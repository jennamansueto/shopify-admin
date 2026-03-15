export interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  totalOrders: number
  totalSpent: number
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  title: string
  sku: string
  price: number
  compareAtPrice: number | null
  inventory: number
  vendor: string
  category: string
  status: string
  imageUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface OrderLineItem {
  id: string
  orderId: string
  productId: string
  title: string
  sku: string
  quantity: number
  unitPrice: number
  total: number
  product?: Product
}

export interface Order {
  id: string
  orderNumber: number
  customerId: string
  customer?: Customer
  status: string
  paymentStatus: string
  fulfillmentStatus: string
  subtotal: number
  tax: number
  shipping: number
  total: number
  currency: string
  salesChannel: string
  shippingAddress: string | null
  billingAddress: string | null
  notes: string | null
  tags: string | null
  createdAt: string
  updatedAt: string
  lineItems?: OrderLineItem[]
}

export interface ActivityEvent {
  id: string
  type: string
  title: string
  description: string
  metadata: string | null
  createdAt: string
}

export interface ReportJob {
  id: string
  type: string
  status: string
  parameters: string | null
  fileUrl: string | null
  startedAt: string | null
  completedAt: string | null
  createdAt: string
}

export interface AnalyticsAggregate {
  id: string
  date: string
  totalSales: number
  orderCount: number
  averageOrderValue: number
  conversionRate: number
  newCustomers: number
  returningCustomers: number
  topChannel: string
  createdAt: string
}

export interface KPIMetric {
  label: string
  value: string
  change: number
  changeLabel: string
  trend: 'up' | 'down' | 'neutral'
}

export interface HomeData {
  kpis: KPIMetric[]
  recentActivity: ActivityEvent[]
  alerts: Alert[]
}

export interface Alert {
  id: string
  type: 'warning' | 'info' | 'error'
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}

export interface OrdersResponse {
  orders: Order[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface AnalyticsData {
  kpis: KPIMetric[]
  timeseries: TimeseriesPoint[]
  ordersByStatus: StatusBreakdown[]
  topProducts: TopProduct[]
  channelBreakdown: ChannelBreakdown[]
}

export interface TimeseriesPoint {
  date: string
  sales: number
  orders: number
  previousSales?: number
  previousOrders?: number
}

export interface StatusBreakdown {
  status: string
  count: number
  percentage: number
}

export interface TopProduct {
  id: string
  title: string
  sku: string
  totalSold: number
  revenue: number
}

export interface ChannelBreakdown {
  channel: string
  sales: number
  orders: number
  percentage: number
}

export interface OrderFilters {
  search?: string
  status?: string
  paymentStatus?: string
  fulfillmentStatus?: string
  channel?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}
