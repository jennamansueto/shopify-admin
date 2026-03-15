import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { generateRequestId } from '@/lib/request-id'

export async function GET() {
  const requestId = generateRequestId()
  logger.info('Fetching reports', { requestId })

  try {
    const reports = await prisma.reportJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({ reports }, {
      headers: { 'X-Request-Id': requestId },
    })
  } catch (error) {
    logger.error('Failed to fetch reports', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to load reports' },
      { status: 500, headers: { 'X-Request-Id': requestId } }
    )
  }
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()

  try {
    const body = await request.json()
    const { type, parameters } = body

    logger.info('Creating report job', { requestId, type })

    const report = await prisma.reportJob.create({
      data: {
        type,
        status: 'pending',
        parameters: parameters ? JSON.stringify(parameters) : null,
      },
    })

    // Simulate background job processing
    simulateReportProcessing(report.id)

    logger.info('Report job created', { requestId, reportId: report.id })

    return NextResponse.json(report, {
      status: 201,
      headers: { 'X-Request-Id': requestId },
    })
  } catch (error) {
    logger.error('Failed to create report', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500, headers: { 'X-Request-Id': requestId } }
    )
  }
}

async function simulateReportProcessing(reportId: string) {
  const requestId = generateRequestId()

  try {
    // Mark as processing
    await new Promise((resolve) => setTimeout(resolve, 1000))
    await prisma.reportJob.update({
      where: { id: reportId },
      data: {
        status: 'processing',
        startedAt: new Date(),
      },
    })
    logger.info('Report processing started', { requestId, reportId })

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Mark as completed
    await prisma.reportJob.update({
      where: { id: reportId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        fileUrl: `/reports/${reportId}.csv`,
      },
    })
    logger.info('Report processing completed', { requestId, reportId })
  } catch (error) {
    logger.error('Report processing failed', {
      requestId,
      reportId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    try {
      await prisma.reportJob.update({
        where: { id: reportId },
        data: {
          status: 'failed',
          completedAt: new Date(),
        },
      })
    } catch (updateError) {
      logger.error('Failed to update report status to failed', {
        requestId,
        reportId,
        error: updateError instanceof Error ? updateError.message : 'Unknown error',
      })
    }
  }
}
