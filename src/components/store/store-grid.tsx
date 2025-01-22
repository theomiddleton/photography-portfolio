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
        <Link key={print.id} href={`/store/${print.id}`} className="group block bg-white">
          <div className="aspect-square overflow-hidden">
            <Image
              src={print.imageUrl}
              alt={print.name}
              width={600}
              height={600}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="mt-4">
            <h2 className="text-lg font-medium">{print.name}</h2>
            <p className="mt-1 text-sm text-gray-600">{formatPrice(print.price)}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

