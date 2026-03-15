import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia', 'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander', 'Luna', 'Daniel', 'Ella', 'Sebastian']
const lastNames = ['Chen', 'Rodriguez', 'Patel', 'Kim', 'Nguyen', 'O\'Brien', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Robinson', 'Clark', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young']

const productData = [
  { title: 'Merino Wool Crewneck Sweater', sku: 'APP-MWC-001', price: 89.00, vendor: 'Nordic Textiles', category: 'Apparel', inventory: 145 },
  { title: 'Organic Cotton T-Shirt', sku: 'APP-OCT-002', price: 34.00, vendor: 'EcoWear Co', category: 'Apparel', inventory: 320 },
  { title: 'Slim Fit Chinos', sku: 'APP-SFC-003', price: 68.00, vendor: 'Heritage Denim', category: 'Apparel', inventory: 89 },
  { title: 'Canvas Tote Bag', sku: 'ACC-CTB-004', price: 42.00, vendor: 'Artisan Goods', category: 'Accessories', inventory: 210 },
  { title: 'Leather Card Wallet', sku: 'ACC-LCW-005', price: 55.00, vendor: 'Artisan Goods', category: 'Accessories', inventory: 178 },
  { title: 'Stainless Steel Water Bottle', sku: 'HOM-SSW-006', price: 28.00, vendor: 'Daily Essentials', category: 'Home', inventory: 450 },
  { title: 'Ceramic Pour-Over Set', sku: 'HOM-CPS-007', price: 64.00, vendor: 'Craft & Co', category: 'Home', inventory: 67 },
  { title: 'Linen Throw Blanket', sku: 'HOM-LTB-008', price: 120.00, vendor: 'Nordic Textiles', category: 'Home', inventory: 34 },
  { title: 'Wireless Charging Pad', sku: 'TEC-WCP-009', price: 39.00, vendor: 'TechFlow', category: 'Electronics', inventory: 280 },
  { title: 'Noise-Canceling Headphones', sku: 'TEC-NCH-010', price: 199.00, vendor: 'TechFlow', category: 'Electronics', inventory: 56 },
  { title: 'Running Shoes - Trail Edition', sku: 'SPT-RST-011', price: 134.00, vendor: 'Stride Athletics', category: 'Footwear', inventory: 98 },
  { title: 'Yoga Mat - Premium', sku: 'SPT-YMP-012', price: 72.00, vendor: 'Stride Athletics', category: 'Fitness', inventory: 165 },
  { title: 'French Press Coffee Maker', sku: 'HOM-FPC-013', price: 48.00, vendor: 'Craft & Co', category: 'Home', inventory: 112 },
  { title: 'Bamboo Cutting Board Set', sku: 'HOM-BCB-014', price: 36.00, vendor: 'Daily Essentials', category: 'Home', inventory: 203 },
  { title: 'Sunglasses - Polarized', sku: 'ACC-SPL-015', price: 78.00, vendor: 'Optic Wear', category: 'Accessories', inventory: 140 },
  { title: 'Denim Jacket - Classic Wash', sku: 'APP-DJC-016', price: 112.00, vendor: 'Heritage Denim', category: 'Apparel', inventory: 72 },
  { title: 'Portable Bluetooth Speaker', sku: 'TEC-PBS-017', price: 85.00, vendor: 'TechFlow', category: 'Electronics', inventory: 190 },
  { title: 'Scented Candle - Cedar & Sage', sku: 'HOM-SCC-018', price: 32.00, vendor: 'Botanica Home', category: 'Home', inventory: 325 },
  { title: 'Weekender Duffle Bag', sku: 'ACC-WDB-019', price: 148.00, vendor: 'Artisan Goods', category: 'Accessories', inventory: 45 },
  { title: 'Fitness Tracker Band', sku: 'TEC-FTB-020', price: 129.00, vendor: 'TechFlow', category: 'Electronics', inventory: 88 },
  { title: 'Cashmere Beanie', sku: 'ACC-CBN-021', price: 58.00, vendor: 'Nordic Textiles', category: 'Accessories', inventory: 195 },
  { title: 'Insulated Travel Mug', sku: 'HOM-ITM-022', price: 24.00, vendor: 'Daily Essentials', category: 'Home', inventory: 410 },
  { title: 'Silk Pillowcase Set', sku: 'HOM-SPS-023', price: 86.00, vendor: 'Botanica Home', category: 'Home', inventory: 78 },
  { title: 'Leather Belt - Brown', sku: 'ACC-LBB-024', price: 62.00, vendor: 'Artisan Goods', category: 'Accessories', inventory: 160 },
  { title: 'Smart Watch Band', sku: 'TEC-SWB-025', price: 29.00, vendor: 'TechFlow', category: 'Electronics', inventory: 340 },
  { title: 'Wool Socks - 3 Pack', sku: 'APP-WS3-026', price: 22.00, vendor: 'Nordic Textiles', category: 'Apparel', inventory: 520 },
  { title: 'Plant Pot - Terracotta', sku: 'HOM-PPT-027', price: 18.00, vendor: 'Botanica Home', category: 'Home', inventory: 280 },
  { title: 'Crossbody Phone Bag', sku: 'ACC-CPB-028', price: 44.00, vendor: 'Artisan Goods', category: 'Accessories', inventory: 135 },
  { title: 'Reading Lamp - Adjustable', sku: 'HOM-RLA-029', price: 95.00, vendor: 'Modern Living', category: 'Home', inventory: 62 },
  { title: 'Cotton Hoodie - Heavyweight', sku: 'APP-CHH-030', price: 76.00, vendor: 'EcoWear Co', category: 'Apparel', inventory: 188 },
]

const salesChannels = ['online_store', 'pos', 'wholesale', 'social', 'marketplace']
const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
const paymentStatuses = ['pending', 'paid', 'partially_refunded', 'refunded', 'failed']
const fulfillmentStatuses = ['unfulfilled', 'partially_fulfilled', 'fulfilled']

const streetNames = ['Oak Avenue', 'Maple Street', 'Pine Road', 'Cedar Lane', 'Elm Boulevard', 'Birch Drive', 'Walnut Court', 'Spruce Way', 'Ash Circle', 'Willow Place']
const cities = ['Portland', 'Austin', 'Denver', 'Seattle', 'Brooklyn', 'San Francisco', 'Chicago', 'Nashville', 'Miami', 'Boston']
const states = ['OR', 'TX', 'CO', 'WA', 'NY', 'CA', 'IL', 'TN', 'FL', 'MA']
const zips = ['97201', '78701', '80202', '98101', '11201', '94102', '60601', '37201', '33101', '02101']

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateAddress(): string {
  const idx = randomInt(0, cities.length - 1)
  return `${randomInt(100, 9999)} ${randomItem(streetNames)}, ${cities[idx]}, ${states[idx]} ${zips[idx]}`
}

function getConsistentStatuses(): { status: string; paymentStatus: string; fulfillmentStatus: string } {
  const rand = Math.random()
  if (rand < 0.35) {
    return { status: 'delivered', paymentStatus: 'paid', fulfillmentStatus: 'fulfilled' }
  } else if (rand < 0.50) {
    return { status: 'shipped', paymentStatus: 'paid', fulfillmentStatus: 'fulfilled' }
  } else if (rand < 0.62) {
    return { status: 'processing', paymentStatus: 'paid', fulfillmentStatus: 'unfulfilled' }
  } else if (rand < 0.72) {
    return { status: 'confirmed', paymentStatus: 'paid', fulfillmentStatus: 'unfulfilled' }
  } else if (rand < 0.82) {
    return { status: 'pending', paymentStatus: 'pending', fulfillmentStatus: 'unfulfilled' }
  } else if (rand < 0.88) {
    return { status: 'cancelled', paymentStatus: 'refunded', fulfillmentStatus: 'unfulfilled' }
  } else if (rand < 0.94) {
    return { status: 'refunded', paymentStatus: 'refunded', fulfillmentStatus: 'fulfilled' }
  } else {
    return { status: 'processing', paymentStatus: 'paid', fulfillmentStatus: 'partially_fulfilled' }
  }
}

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.orderLineItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.activityEvent.deleteMany()
  await prisma.reportJob.deleteMany()
  await prisma.analyticsAggregate.deleteMany()

  // Create customers
  const customers = []
  for (let i = 0; i < 24; i++) {
    const firstName = firstNames[i]
    const lastName = lastNames[i]
    const customer = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace("'", '')}@example.com`,
        phone: `+1${randomInt(200, 999)}${randomInt(100, 999)}${randomInt(1000, 9999)}`,
        totalOrders: 0,
        totalSpent: 0,
      },
    })
    customers.push(customer)
  }
  console.log(`Created ${customers.length} customers`)

  // Create products
  const products = []
  for (const p of productData) {
    const product = await prisma.product.create({
      data: {
        ...p,
        compareAtPrice: Math.random() > 0.6 ? Math.round(p.price * 1.2 * 100) / 100 : null,
        status: Math.random() > 0.1 ? 'active' : 'draft',
      },
    })
    products.push(product)
  }
  console.log(`Created ${products.length} products`)

  // Create orders spanning 90 days
  const now = new Date()
  const orders = []
  let orderNumber = 1001

  for (let i = 0; i < 85; i++) {
    const daysAgo = randomInt(0, 90)
    const hoursAgo = randomInt(0, 23)
    const minutesAgo = randomInt(0, 59)
    const createdAt = new Date(now)
    createdAt.setDate(createdAt.getDate() - daysAgo)
    createdAt.setHours(hoursAgo, minutesAgo, 0, 0)

    const customer = randomItem(customers)
    const { status, paymentStatus, fulfillmentStatus } = getConsistentStatuses()
    const channel = randomItem(salesChannels)

    const numItems = randomInt(1, 4)
    const selectedProducts = []
    const usedProductIds = new Set<string>()

    for (let j = 0; j < numItems; j++) {
      let product = randomItem(products)
      while (usedProductIds.has(product.id)) {
        product = randomItem(products)
      }
      usedProductIds.add(product.id)
      selectedProducts.push({
        product,
        quantity: randomInt(1, 3),
      })
    }

    const subtotal = selectedProducts.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )
    const tax = Math.round(subtotal * 0.08 * 100) / 100
    const shipping = subtotal > 100 ? 0 : 9.99
    const total = Math.round((subtotal + tax + shipping) * 100) / 100

    const address = generateAddress()

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        status,
        paymentStatus,
        fulfillmentStatus,
        subtotal: Math.round(subtotal * 100) / 100,
        tax,
        shipping,
        total,
        currency: 'USD',
        salesChannel: channel,
        shippingAddress: address,
        billingAddress: address,
        notes: Math.random() > 0.8 ? 'Customer requested gift wrapping' : null,
        tags: Math.random() > 0.7 ? randomItem(['vip', 'repeat', 'wholesale', 'rush', 'international']) : null,
        createdAt,
        updatedAt: createdAt,
        lineItems: {
          create: selectedProducts.map((item) => ({
            productId: item.product.id,
            title: item.product.title,
            sku: item.product.sku,
            quantity: item.quantity,
            unitPrice: item.product.price,
            total: Math.round(item.product.price * item.quantity * 100) / 100,
          })),
        },
      },
    })

    orders.push(order)
    orderNumber++

    // Update customer totals
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        totalOrders: { increment: 1 },
        totalSpent: { increment: total },
      },
    })
  }
  console.log(`Created ${orders.length} orders`)

  // Create activity events
  const activityTypes = [
    { type: 'order_placed', titleTemplate: 'New order #{orderNumber}', descTemplate: '{customer} placed an order for {total}' },
    { type: 'order_fulfilled', titleTemplate: 'Order #{orderNumber} fulfilled', descTemplate: 'Order for {customer} has been shipped' },
    { type: 'order_refunded', titleTemplate: 'Order #{orderNumber} refunded', descTemplate: 'Refund of {total} processed for {customer}' },
    { type: 'customer_registered', titleTemplate: 'New customer', descTemplate: '{customer} created an account' },
    { type: 'product_added', titleTemplate: 'New product added', descTemplate: '"{product}" added to catalog' },
  ]

  const events = []
  for (let i = 0; i < 30; i++) {
    const daysAgo = randomInt(0, 14)
    const hoursAgo = randomInt(0, 23)
    const createdAt = new Date(now)
    createdAt.setDate(createdAt.getDate() - daysAgo)
    createdAt.setHours(hoursAgo, randomInt(0, 59), 0, 0)

    const template = randomItem(activityTypes)
    const order = randomItem(orders)
    const customer = randomItem(customers)
    const product = randomItem(products)

    const title = template.titleTemplate
      .replace('{orderNumber}', String(order.orderNumber))
    const description = template.descTemplate
      .replace('{customer}', `${customer.firstName} ${customer.lastName}`)
      .replace('{total}', `$${order.total.toFixed(2)}`)
      .replace('{product}', product.title)

    const event = await prisma.activityEvent.create({
      data: {
        type: template.type,
        title,
        description,
        metadata: JSON.stringify({
          orderId: order.id,
          customerId: customer.id,
          orderNumber: order.orderNumber,
        }),
        createdAt,
      },
    })
    events.push(event)
  }
  console.log(`Created ${events.length} activity events`)

  // Create analytics aggregates for last 90 days
  const aggregates = []
  for (let i = 0; i < 90; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)

    // Calculate from actual orders for that day
    const dayStart = new Date(date)
    const dayEnd = new Date(date)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const dayOrders = orders.filter((o) => {
      const orderDate = new Date(o.createdAt)
      return orderDate >= dayStart && orderDate < dayEnd
    })

    const totalSales = dayOrders.reduce((sum, o) => sum + o.total, 0)
    const orderCount = dayOrders.length
    const avgOrderValue = orderCount > 0 ? totalSales / orderCount : 0

    // Add some baseline even for days with no orders
    const baseSales = orderCount === 0 ? randomInt(50, 300) : totalSales
    const baseOrders = orderCount === 0 ? randomInt(0, 2) : orderCount

    const aggregate = await prisma.analyticsAggregate.create({
      data: {
        date,
        totalSales: Math.round(baseSales * 100) / 100,
        orderCount: baseOrders,
        averageOrderValue: baseOrders > 0 ? Math.round((baseSales / Math.max(baseOrders, 1)) * 100) / 100 : 0,
        conversionRate: Math.round((1.5 + Math.random() * 3.5) * 100) / 100,
        newCustomers: randomInt(0, 4),
        returningCustomers: randomInt(0, 6),
        topChannel: randomItem(salesChannels),
        createdAt: date,
      },
    })
    aggregates.push(aggregate)
  }
  console.log(`Created ${aggregates.length} analytics aggregates`)

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
