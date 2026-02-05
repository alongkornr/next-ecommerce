import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  // 1. ดึงข้อมูลสินค้าจาก DB โดยตรง (ทำงานฝั่ง Server 100%)
  const products = await prisma.product.findMany({
    where: { isArchived: false },
    orderBy: { createdAt: "desc" },
    include: { category: true }, // Join เอาชื่อหมวดหมู่มาด้วย
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Latest Products</h1>
        <span className="text-gray-500">{products.length} Items</span>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            href={`/product/${product.slug}`}
            key={product.id}
            className="group block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Product Image */}
            <div className="relative aspect-square bg-gray-100">
              {product.images[0] && (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <p className="text-sm text-blue-600 font-medium mb-1">
                {product.category.name}
              </p>
              <h2 className="font-semibold text-lg truncate">{product.name}</h2>
              <div className="flex justify-between items-center mt-3">
                <span className="font-bold text-xl">
                  ฿{Number(product.price).toLocaleString()}
                </span>
                {product.stock <= 0 && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}