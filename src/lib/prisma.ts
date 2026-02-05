import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    // ไม่ต้องใส่อะไรในวงเล็บสำหรับ v5 มันจะอ่าน .env เองอัตโนมัติครับ
    return new PrismaClient()
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = global as unknown as {
    prisma: PrismaClientSingleton | undefined
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma