'use client'

import { Bar, Pie, Doughnut, Radar, Line } from 'react-chartjs-2'
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  TimeScale,
  ChartData,
  ChartOptions
} from 'chart.js'
import 'chartjs-adapter-date-fns'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
)

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        font: {
          family: 'Inter',
          size: 14
        },
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle'
      }
    }
  }
}

interface DatasetProps {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
  borderWidth?: number
}

interface ChartProps {
  data: ChartData<'bar' | 'pie' | 'doughnut' | 'radar' | 'line', number[], string>
  options?: ChartOptions
}

interface BarChartProps extends ChartProps {
  horizontal?: boolean
}

// Update component definitions
export function BarChart({ data, options = {}, horizontal = false }: BarChartProps) {
  const mergedOptions: ChartOptions = {
    ...defaultOptions,
    ...options,
    aspectRatio: horizontal ? 1.6 : 1.8,
    maintainAspectRatio: true,
    indexAxis: horizontal ? 'y' as const : 'x' as const,
    plugins: {
      ...defaultOptions.plugins,
      ...options.plugins,
      legend: {
        position: 'bottom' as const,
        padding: 20
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  }
  return <Bar data={data} options={mergedOptions} />
}

export function PieChart({ data, options = {} }: ChartProps) {
  const mergedOptions: ChartOptions = {
    ...defaultOptions,
    ...options,
    aspectRatio: 1.3,
    maintainAspectRatio: true,
    plugins: {
      ...defaultOptions.plugins,
      ...options.plugins,
      legend: {
        position: 'bottom' as const,
        padding: 20
      }
    }
  }
  return <Pie data={data} options={mergedOptions} />
}

export function DoughnutChart({ data, options = {} }: ChartProps) {
  const mergedOptions: ChartOptions = {
    ...defaultOptions,
    ...options,
    aspectRatio: 1.3,
    maintainAspectRatio: true,
    cutout: '60%',
    plugins: {
      ...defaultOptions.plugins,
      ...options.plugins,
      legend: {
        position: 'bottom' as const,
        padding: 20
      }
    }
  }
  return <Doughnut data={data} options={mergedOptions} />
}

export function RadarChart({ data, options = {} }: ChartProps) {
  const mergedOptions: ChartOptions = {
    ...defaultOptions,
    ...options,
    aspectRatio: 1.3,
    maintainAspectRatio: true,
    scales: {
      r: {
        beginAtZero: true,
        ticks: {
          stepSize: 10
        }
      }
    },
    plugins: {
      ...defaultOptions.plugins,
      ...options.plugins,
      legend: {
        position: 'bottom' as const,
        padding: 20
      }
    }
  }
  return <Radar data={data} options={mergedOptions} />
}

export function LineChart({ data, options = {} }: ChartProps) {
  const mergedOptions: ChartOptions = {
    ...defaultOptions,
    ...options,
    aspectRatio: 2,
    maintainAspectRatio: true,
    plugins: {
      ...defaultOptions.plugins,
      ...options.plugins,
    }
  }
  return <Line data={data} options={mergedOptions} />
}