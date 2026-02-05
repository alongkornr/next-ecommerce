"use client";

import { addToCart } from "@/actions/cart";
import { useTransition } from "react";

interface Props {
    productId: string;
    stock: number;
}

export default function AddToCartButton({ productId, stock }: Props) {
    const [isPending, startTransition] = useTransition();

    const handleAddToCart = () => {
        startTransition(async () => {
            await addToCart(productId);
            alert("เพิ่มสินค้าลงตะกร้าเรียบร้อย!"); // (เดี๋ยวอนาคตค่อยเปลี่ยนเป็น Toast สวยๆ)
        });
    };

    const isOutOfStock = stock <= 0;

    return (
        <button
            onClick={handleAddToCart}
            disabled={isPending || isOutOfStock}
            className={`
        w-full py-4 px-8 rounded-full font-semibold text-white transition-all
        ${isOutOfStock
                    ? "bg-gray-300 cursor-not-allowed text-gray-500"
                    : "bg-black hover:bg-gray-800 hover:shadow-lg"
                }
        ${isPending ? "opacity-70 cursor-wait" : ""}
      `}
        >
            {isOutOfStock
                ? "สินค้าหมด"
                : isPending
                    ? "กำลังเพิ่ม..."
                    : "ใส่ตะกร้าเลย"}
        </button>
    );
}