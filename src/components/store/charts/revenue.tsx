'use client'

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,

  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  ChartConfig,
  ChartContainer,

  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart"

type OriginalData = {
  id: number
  storeImageId: number
  imageId: number
  quantity: number
  price: number
  total: number
  createdAt: string
}

type TransformedData = {
  date: string
  total: number
}

const chartConfig = {
  total: {
    label: "Total",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function Revenue({ data }: { data: OriginalData[] }) {
  console.log("inp data", data)

  const transformData = (data: OriginalData[]): TransformedData[] => {
    return data.map(item => ({
      date: new Date(item.createdAt).toISOString().slice(0, 10),
      total: item.total
    }))
  }

  const originalData = data
  const transformedData = transformData(originalData)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Area Chart</CardTitle>
        <CardDescription>
          Showing total revenue for the last week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={transformedData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                return new Date(value).toLocaleDateString("en-UK", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="total"
              type="natural"
              fill="var(--color-total)"
              fillOpacity={0.4}
              stroke="var(--color-total)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
