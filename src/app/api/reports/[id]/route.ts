import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { generateRequestId } from '@/lib/request-id'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId()
  const { id } = await params

  try {
    const report = await prisma.reportJob.findUnique({
      where: { id },
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404, headers: { 'X-Request-Id': requestId } }
      )
    }

    return NextResponse.json(report, {
      headers: { 'X-Request-Id': requestId },
    })
  } catch (error) {
    logger.error('Failed to fetch report', {
      requestId,
      reportId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to load report' },
      { status: 500, headers: { 'X-Request-Id': requestId } }
    )
  }
}
