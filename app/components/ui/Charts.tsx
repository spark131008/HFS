import { 
  Bar, 
  Line, 
  Pie, 
  Doughnut, 
  Radar, 
  PolarArea 
} from 'react-chartjs-2';
import type { 
  ChartData, 
  ChartOptions,
  ScatterDataPoint,
  BubbleDataPoint
} from 'chart.js';

// Define type for horizontal bar chart prop
interface BarChartProps {
  data: ChartData<'bar', (number | ScatterDataPoint | BubbleDataPoint | null)[]>;
  horizontal?: boolean;
}

export function BarChart({ data, horizontal = false }: BarChartProps) {
  const options: ChartOptions<'bar'> = {
    responsive: true,
    indexAxis: horizontal ? 'y' : 'x',
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };

  return <Bar data={data} options={options} />;
}

interface LineChartProps {
  data: ChartData<'line', (number | ScatterDataPoint | BubbleDataPoint | null)[]>;
  options?: ChartOptions<'line'>;
}

export function LineChart({ data, options }: LineChartProps) {
  const defaultOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };

  return <Line data={data} options={options || defaultOptions} />;
}

interface PieChartProps {
  data: ChartData<'pie', number[]>;
}

export function PieChart({ data }: PieChartProps) {
  const options: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };

  return <Pie data={data} options={options} />;
}

interface DoughnutChartProps {
  data: ChartData<'doughnut', number[]>;
}

export function DoughnutChart({ data }: DoughnutChartProps) {
  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };

  return <Doughnut data={data} options={options} />;
}

interface RadarChartProps {
  data: ChartData<'radar', number[]>;
}

export function RadarChart({ data }: RadarChartProps) {
  const options: ChartOptions<'radar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };

  return <Radar data={data} options={options} />;
}

interface PolarAreaChartProps {
  data: ChartData<'polarArea', number[]>;
}

export function PolarAreaChart({ data }: PolarAreaChartProps) {
  const options: ChartOptions<'polarArea'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };

  return <PolarArea data={data} options={options} />;
} 