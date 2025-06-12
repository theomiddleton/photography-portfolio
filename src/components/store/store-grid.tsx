import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '~/server/db/schema'
import { formatPrice } from '~/lib/utils'

interface StoreGridProps {
  prints: (Product & { priceWithTax: number })[]
}

export function StoreGrid({ prints }: StoreGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-8">
      {prints.map((print) => (
        <Link key={print.id} href={`/store/${print.slug}`} className="group block">
          <div className="aspect-square rounded-2xl overflow-hidden bg-black/5 flex items-center justify-center">
            <div className="relative w-[90%] h-[90%]">
              <Image
                src={print.imageUrl}
                alt={print.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                priority={print.id === prints[0]?.id}
                className="absolute inset-4 object-contain transition-transform duration-300 group-hover:scale-102 rounded-lg"
              />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-lg font-medium">{print.name}</h2>
            <p className="mt-1 text-sm text-gray-600">
              From {formatPrice(print.priceWithTax)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
