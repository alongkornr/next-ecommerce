import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding...')

    // 1. สร้าง Category ก่อน (เพื่อให้มี ID ไปใช้ต่อ)
    const electronics = await prisma.category.upsert({
        where: { slug: 'electronics' },
        update: {},
        create: {
            name: 'Electronics',
            slug: 'electronics',
        },
    })

    const clothing = await prisma.category.upsert({
        where: { slug: 'clothing' },
        update: {},
        create: {
            name: 'Clothing',
            slug: 'clothing',
        },
    })

    // 2. สร้างข้อมูล Product (ตอนนี้ electronics และ clothing มีค่าแล้ว เรียกใช้ .id ได้)
    const products = [
        {
            name: 'iPhone 15 Pro',
            slug: 'iphone-15-pro',
            description: 'The ultimate iPhone.',
            price: 39900,
            stock: 50,
            images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569'],
            categoryId: electronics.id, // <-- ตรงนี้จะไม่ Error แล้ว
            isFeatured: true,
        },
        {
            name: 'MacBook Air M2',
            slug: 'macbook-air-m2',
            description: 'Supercharged by M2.',
            price: 43900,
            stock: 20,
            images: ['https://images.unsplash.com/photo-1655560246788-b769f441050a'],
            categoryId: electronics.id,
            isFeatured: true,
        },
        {
            name: 'Developer T-Shirt',
            slug: 'dev-t-shirt',
            description: 'Comfortable cotton t-shirt for coding.',
            price: 590,
            stock: 100,
            images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab'],
            categoryId: clothing.id, // <-- ตรงนี้จะไม่ Error แล้ว
            isFeatured: false,
        },
    ]

    // 3. วนลูปสร้าง Product
    for (const p of products) {
        await prisma.product.upsert({
            where: { slug: p.slug },
            update: {},
            create: p,
        })
    }

    console.log(`Seeding finished. Created ${products.length} products.`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })