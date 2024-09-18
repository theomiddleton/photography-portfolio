import { Products } from '~/components/store/products'
import { Orders } from '~/components/store/orders'
import { Analytics } from '~/components/store/analytics'
import { Separator } from '~/components/ui/separator'

export const revalidate = 60
export const dynamicParams = true

// the store page has multiple smaller sections, each with their own data requirements
// to manage this, they are eached wrapped in their own component, and the data fetching is done there
// this way, each section can be updated independently, and the page can be revalidated more frequently
// it also ensures that the data fetching is done in parallel, rather than serially, and cleans the code
export default function Store() {
  return (
    <div className="min-h-screen bg-white text-black space-y-12">
      <Products/>
      <Orders/>
      <Analytics/>
      <Separator/>
    </div>
  )
}