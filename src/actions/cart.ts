"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// ฟังก์ชันสำหรับเพิ่มสินค้าลงตะกร้า
export async function addToCart(productId: string) {
    // 1. เช็คว่ามีตะกร้า (Cart ID) ใน Cookie หรือยัง?
    const cookieStore = await cookies();
    const cartId = cookieStore.get("cartId")?.value;

    let cart;

    if (cartId) {
        // 1.1 ถ้ามี Cookie ให้ไปหาตะกร้าใน DB
        cart = await prisma.cart.findUnique({
            where: { id: cartId },
            include: { items: true },
        });
    }

    // 1.2 ถ้าไม่มีตะกร้า (หรือหาไม่เจอ) ให้สร้างใหม่
    if (!cart) {
        cart = await prisma.cart.create({
            data: {}, // สร้างตะกร้าเปล่าๆ (userId เป็น null ไปก่อนสำหรับ Guest)
        });
        // ฝัง Cookie กลับไปที่เครื่องลูกค้า (อยู่ได้ 30 วัน)
        cookieStore.set("cartId", cart.id, { maxAge: 60 * 60 * 24 * 30 });
    }

    // 2. เช็คว่าสินค้านี้มีในตะกร้าหรือยัง?
    const existingItem = await prisma.cartItem.findFirst({
        where: {
            cartId: cart.id,
            productId: productId,
        },
    });

    if (existingItem) {
        // 2.1 ถ้ามีแล้ว ให้บวกจำนวนเพิ่ม
        await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + 1 },
        });
    } else {
        // 2.2 ถ้ายังไม่มี ให้สร้างรายการใหม่
        await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId: productId,
                quantity: 1,
            },
        });
    }

    // 3. สั่งให้หน้าเว็บรีเฟรชข้อมูลใหม่ (เช่น ตัวเลขที่ตะกร้าด้านบน)
    revalidatePath("/");
    revalidatePath(`/product/[slug]`);
}

// ฟังก์ชันสำหรับลบสินค้าออกจากตะกร้า
export async function deleteItem(itemId: string) {
    try {
        await prisma.cartItem.delete({
            where: { id: itemId },
        });

        // สั่งให้รีเฟรชหน้าเว็บ
        revalidatePath("/cart");
        revalidatePath("/"); // รีเฟรชตัวเลขที่ Navbar ด้วย
    } catch (error) {
        console.error("Failed to delete item:", error);
    }
}