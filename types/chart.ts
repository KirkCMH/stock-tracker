export interface ChartPoint {
  x: string
  y: number | null
}

export interface ChartSeries {
  name: string
  data: ChartPoint[]
}

export interface ChartSeriesGroup {
  solid: ChartSeries
  dashed: ChartSeries | null
}
