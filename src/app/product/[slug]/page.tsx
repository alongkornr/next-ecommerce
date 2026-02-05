import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Metadata } from "next";
import AddToCartButton from "@/components/AddToCartButton";

// 1. แก้ไข Type ให้รองรับ Promise
interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    // ต้อง await params ก่อนเรียกใช้ slug
    const { slug } = await params;

    const product = await prisma.product.findUnique({
        where: { slug },
    });

    if (!product) return { title: "Product Not Found" };

    return {
        title: `${product.name} | Next Shop`,
        description: product.description,
        openGraph: {
            images: product.images[0] ? [product.images[0]] : [],
        },
    };
}

export default async function ProductPage({ params }: Props) {
    // 2. สำคัญมาก! ต้อง await params ตรงนี้ก่อนเสมอ
    const { slug } = await params;

    const product = await prisma.product.findUnique({
        where: {
            slug: slug // ใช้ตัวแปร slug ที่ await มาแล้ว
        },
        include: { category: true },
    });

    if (!product) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {/* รูปสินค้า */}
                <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-sm">
                    {product.images[0] && (
                        <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    )}
                </div>

                {/* รายละเอียด */}
                <div className="flex flex-col justify-center">
                    <div className="mb-4">
                        <span className="text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full text-sm">
                            {product.category.name}
                        </span>
                    </div>

                    <h1 className="text-4xl font-bold mb-4 text-gray-900">{product.name}</h1>
                    <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                        {product.description}
                    </p>

                    <div className="flex items-center mb-8">
                        <span className="text-3xl font-bold text-gray-900">
                            ฿{Number(product.price).toLocaleString()}
                        </span>
                    </div>

                    <div className="flex gap-4">
                        <AddToCartButton productId={product.id} stock={product.stock} />
                    </div>

                    <div className="mt-8 text-sm text-gray-500">
                        <p>Stock Available: {product.stock} items</p>
                        <p>Product ID: {product.id}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}