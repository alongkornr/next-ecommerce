import Link from "next/link";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export default async function Navbar() {
    // 1. เช็คว่ามีตะกร้าไหม
    const cookieStore = await cookies();
    const cartId = cookieStore.get("cartId")?.value;

    // 2. ถ้ามี ให้นับจำนวนของในตะกร้า
    let cartCount = 0;
    if (cartId) {
        const cart = await prisma.cart.findUnique({
            where: { id: cartId },
            include: { items: true },
        });
        // นับผลรวม quantity ของสินค้าทุกชิ้น
        cartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
    }

    return (
        <nav className="border-b bg-white sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-xl font-bold tracking-tight">
                    NEXT STORE
                </Link>

                {/* Cart Icon */}
                <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>

                    {/* Badge แสดงจำนวน (ถ้ามีของ) */}
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                            {cartCount}
                        </span>
                    )}
                </Link>
            </div>
        </nav>
    );
}