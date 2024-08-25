'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart"

type ChartData = {
  imageId: number
  price: number
  total: number
  createdAt: string
}

type AggregatedData = {
  imageId: number
  price: number
  total: number
}


const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--chart-1))",
  },
  total: {
    label: "Total",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function ImageIdChart({ data }: { data: any }) {
  function generateRandomData(): ChartData[] {
    const data: ChartData[] = []
    for (let i = 0; i < 30; i++) {
      data.push({
        // id: i + 1,
        imageId: Math.floor(Math.random() * 10),
        price: Math.floor(Math.random() * 100) + 1,
        total: Math.floor(Math.random() * 100) + 1,
        // createdAt: new Date(2024, 7, Math.floor(Math.random() * 28) + 1).toISOString().slice(0, 10),
        createdAt: new Date(2024, 7, i + 1).toISOString().slice(0, 10),
      })
    }
    return data
  }
  const chartData = generateRandomData()

  function aggregateData(data: ChartData[]): AggregatedData[] {
    const result: { [key: number]: AggregatedData } = {}
  
    data.forEach(({ imageId, price, total }) => {
      if (result[imageId]) {
        result[imageId].price += price
        result[imageId].total += total
      } else {
        result[imageId] = {
          imageId,
          price,
          total,
        }
      }
    })
  
    return Object.values(result)
  }

  const aggregatedData = aggregateData(chartData)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bar Chart - Price and Total</CardTitle>
        <CardDescription>By Image ID</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={aggregatedData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="imageId"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="price"
              stackId="a"
              className="fill-[--color-price]"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="total"
              stackId="a"
              className="fill-[--color-total]"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}