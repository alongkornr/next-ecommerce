import { deleteItem } from "@/actions/cart"; // เพิ่มอันนี้
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";

export default async function CartPage() {
    // 1. ดึง Cart ID จาก Cookie (Next.js 15 ต้อง await cookies())
    const cookieStore = await cookies();
    const cartId = cookieStore.get("cartId")?.value;

    // --- เพิ่มบรรทัดนี้เพื่อเช็คค่าใน Terminal ---
    console.log("--------------------------------");
    console.log("DEBUG CART ID:", cartId);
    console.log("Type of ID:", typeof cartId);
    console.log("--------------------------------");
    // ----------------------------------------

    let cart = null;

    // 2. ถ้ามี Cookie ให้ไปดึงข้อมูลตะกร้า + รายการสินค้า + รายละเอียดสินค้า
    if (cartId) {
        cart = await prisma.cart.findUnique({
            where: { id: cartId },
            include: {
                items: {
                    include: { product: true }, // Join ตาราง Product เพื่อเอารูปและราคา
                    orderBy: { id: "asc" },
                },
            },
        });
    }

    // 3. ถ้าไม่มีตะกร้า หรือ ตะกร้าว่าง
    if (!cart || cart.items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
                <p className="text-gray-500 mb-8">
                    Looks like you haven't added anything to your cart yet.
                </p>
                <Link
                    href="/"
                    className="bg-black text-white py-3 px-6 rounded-full font-semibold hover:bg-gray-800"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    // 4. คำนวณราคารวม
    const totalPrice = cart.items.reduce((sum, item) => {
        return sum + Number(item.product.price) * item.quantity;
    }, 0);

    return (
        <div className="container mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* รายการสินค้า (ซ้าย) */}
                <div className="lg:col-span-2">
                    <div className="bg-white border rounded-lg overflow-hidden">
                        {cart.items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-4 p-4 border-b last:border-b-0"
                            >
                                {/* รูปสินค้า */}
                                <div className="relative w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                    {item.product.images[0] && (
                                        <Image
                                            src={item.product.images[0]}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </div>

                                {/* ชื่อและราคา */}
                                <div className="flex-1">
                                    <Link
                                        href={`/product/${item.product.slug}`}
                                        className="font-semibold hover:underline"
                                    >
                                        {item.product.name}
                                    </Link>
                                    <p className="text-gray-500 text-sm">
                                        ฿{Number(item.product.price).toLocaleString()}
                                    </p>
                                </div>

                                {/* ส่วนจัดการจำนวนและปุ่มลบ */}
                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                                    </div>

                                    {/* ปุ่มลบ (Server Action Form) */}
                                    <form action={deleteItem.bind(null, item.id)}>
                                        <button
                                            type="submit"
                                            className="text-sm text-red-500 hover:text-red-700 hover:underline"
                                        >
                                            Remove
                                        </button>
                                    </form>
                                </div>

                                {/* ราคารวม */}
                                <div className="font-bold w-24 text-right">
                                    ฿{(Number(item.product.price) * item.quantity).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* สรุปยอดเงิน (ขวา) */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-50 p-6 rounded-lg border">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">฿{totalPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between mb-4">
                            <span className="text-gray-600">Shipping</span>
                            <span className="text-green-600">Free</span>
                        </div>
                        <div className="border-t pt-4 flex justify-between items-center mb-6">
                            <span className="text-lg font-bold">Total</span>
                            <span className="text-2xl font-bold">
                                ฿{totalPrice.toLocaleString()}
                            </span>
                        </div>
                        <button className="w-full bg-black text-white py-4 rounded-full font-bold hover:bg-gray-800 transition-colors">
                            Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}