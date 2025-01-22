import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '~/server/db/schema'
import { formatPrice } from '~/lib/utils'

interface StoreGridProps {
  prints: Product[]
}

export function StoreGrid({ prints }: StoreGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {prints.map((print) => (
        <Link key={print.id} href={`/store/${print.slug}`} className="group block bg-white">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
            <div className="relative w-[85%] h-[85%]">
              <Image
                src={print.imageUrl}
                alt={print.name}
                fill
                className="object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-lg font-medium">{print.name}</h2>
            <p className="mt-1 text-sm text-gray-600">From {formatPrice(2500)}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

