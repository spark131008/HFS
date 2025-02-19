'use client'

import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  TimeScale,
  RadialLinearScale
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import { BarChart, PieChart, DoughnutChart, RadarChart, LineChart } from './Charts'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  TimeScale,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export { BarChart, PieChart, DoughnutChart, RadarChart, LineChart } 