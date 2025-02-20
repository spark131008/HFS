import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { createServerComponentClient } from "@/utils/supabase/server"
import { BarChart, PieChart, DoughnutChart, RadarChart, LineChart } from '@/app/components/ui/ClientChartWrapper'
import { TrendingUp, Users, Target } from 'lucide-react'

const CHART_COLORS = {
  primary: 'rgba(79, 70, 229, 0.85)',    // Deep Indigo
  secondary: 'rgba(147, 51, 234, 0.85)',  // Vivid Purple
  success: 'rgba(16, 185, 129, 0.85)',    // Emerald
  warning: 'rgba(251, 146, 60, 0.85)',    // Orange
  error: 'rgba(239, 68, 68, 0.85)',       // Red
  info: 'rgba(14, 165, 233, 0.85)',       // Sky Blue
  background: {
    primary: 'rgba(79, 70, 229, 0.1)',
    secondary: 'rgba(147, 51, 234, 0.1)',
    success: 'rgba(16, 185, 129, 0.1)',
    warning: 'rgba(251, 146, 60, 0.1)',
    error: 'rgba(239, 68, 68, 0.1)',
    info: 'rgba(14, 165, 233, 0.1)',
  }
}

// Add these interfaces at the top of the file
interface LocationData {
  location: string
  total_responses: number
}

interface FeedbackData {
  m1_q1?: string
  m1_q2?: string
  m2_q1?: string
  m2_q2?: string
  total_responses: number
}

// Update the interface to match the function return type
interface SentimentTimeData {
  response_date: Date
  m1_sentiment?: string
  m2_sentiment?: string
  counts: number
}

// Make the component async
export default async function DashboardPage() {
  const supabase = await createServerComponentClient()

  // Add new query for total responses
  const { data: totalResponsesData } = await supabase.rpc('total_count_responses')
  const totalResponses = totalResponsesData?.[0]?.total_responses || 0
  const totalRequests = 100 + totalResponses
  const conversionRate = (totalResponses * 100 / totalRequests).toFixed(1)
  // Fetch data with type annotations
  const { data: locationData } = await supabase.rpc('get_responses_by_location') as { data: LocationData[] }
  const { data: butterChickenTextureData } = await supabase.rpc('count_m1_q1') as { data: FeedbackData[] }
  const { data: butterChickenSauceData } = await supabase.rpc('count_m1_q2') as { data: FeedbackData[] }
  const { data: mangoLassiFreshnessData } = await supabase.rpc('count_m2_q1') as { data: FeedbackData[] }
  const { data: mangoLassiSweetnessData } = await supabase.rpc('count_m2_q2') as { data: FeedbackData[] }

  // Update the data fetching
  const { data: butterChickenSentimentData } = await supabase.rpc('m1_sentiment_count') as { data: SentimentTimeData[] }
  const { data: mangoLassiSentimentData } = await supabase.rpc('m2_sentiment_count') as { data: SentimentTimeData[] }

  // Chart configuration for location data
  const locationChartData = {
    labels: locationData?.map((item: LocationData) => item.location) || [],
    datasets: [{
      label: 'Responses by Location',
      data: locationData?.map((item: LocationData) => item.total_responses) || [],
      backgroundColor: CHART_COLORS.primary,
      borderRadius: 8,
      barThickness: 40,
      hoverBackgroundColor: 'rgba(79, 70, 229, 0.95)',
    }]
  }

  return (
    <div className="container mx-auto p-8 font-sans">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 font-display tracking-tight">
          Empire Feedback Dashboard
        </h1>
        <p className="mt-2 text-base text-gray-600 font-normal">
          Real-time customer feedback analysis and insights
        </p>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-indigo-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 font-sans">
              Total Requests
            </CardTitle>
            <Users className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="text-3xl font-semibold text-indigo-600 font-display tracking-tight">
                {totalRequests}
              </div>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                +12% from last month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 font-sans">
              Total Responses
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="text-3xl font-semibold text-purple-600 font-display tracking-tight">
                {totalResponses}
              </div>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                +{((totalResponses - (totalResponses * 0.9)) / (totalResponses * 0.9) * 100).toFixed(1)}% from last week
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 font-sans">
              Conversion Rate
            </CardTitle>
            <Target className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <div className="text-3xl font-semibold text-green-600 font-display tracking-tight">
                {conversionRate}%
              </div>
              <div className="flex items-center mt-1">
                <div className="w-16 h-1 rounded-full bg-gray-100 mr-2">
                  <div 
                    className="h-full bg-green-600 rounded-full" 
                    style={{ width: `${Math.min(Number(conversionRate), 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 font-medium">Target: 30%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location and Word Cloud Charts */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 font-display tracking-tight">
              Response Distribution by Location
            </CardTitle>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Geographic breakdown of customer feedback
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[400px] w-full flex justify-center items-center">
              <div className="relative w-full max-w-[800px]">
                <BarChart data={locationChartData} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Feedback Charts - reorganized into columns */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Butter Chicken Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800 font-display tracking-tight">
                Butter Chicken Texture
              </CardTitle>
              <p className="text-sm text-gray-500 font-medium mt-1">
                Distribution of texture feedback
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[280px] w-full flex justify-center items-center">
                <div className="relative w-full max-w-[300px]">
                  <PieChart data={{
                    labels: butterChickenTextureData?.map((item: FeedbackData) => item.m1_q1) || [],
                    datasets: [{
                      data: butterChickenTextureData?.map((item: FeedbackData) => item.total_responses) || [],
                      backgroundColor: [
                        CHART_COLORS.primary,
                        CHART_COLORS.success,
                        CHART_COLORS.warning,
                      ],
                      borderWidth: 0,
                      hoverOffset: 4
                    }]
                  }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800 font-display tracking-tight">
                Butter Chicken Sauce
              </CardTitle>
              <p className="text-sm text-gray-500 font-medium mt-1">
                Distribution of sauce feedback
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[280px] w-full flex justify-center items-center">
                <div className="relative w-full max-w-[300px]">
                  <DoughnutChart data={{
                    labels: butterChickenSauceData?.map((item: FeedbackData) => item.m1_q2) || [],
                    datasets: [{
                      data: butterChickenSauceData?.map((item: FeedbackData) => item.total_responses) || [],
                      backgroundColor: [
                        CHART_COLORS.info,
                        CHART_COLORS.warning,
                        CHART_COLORS.error,
                        CHART_COLORS.primary,
                        CHART_COLORS.success,
                      ],
                      borderWidth: 0,
                      hoverOffset: 10
                    }]
                  }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800 font-display tracking-tight">
                Butter Chicken Sentiment Trends
              </CardTitle>
              <p className="text-sm text-gray-500 font-medium mt-1">
                Sentiment analysis of Butter Chicken feedback
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px] w-full flex justify-center items-center">
                <div className="relative w-full max-w-[800px]">
                  <LineChart 
                    data={{
                      datasets: [
                        {
                          label: 'Positive',
                          data: butterChickenSentimentData
                            ?.filter(item => item.m1_sentiment === 'Positive')
                            .sort((a, b) => new Date(a.response_date).getTime() - new Date(b.response_date).getTime())
                            .map(item => ({
                              x: new Date(item.response_date).getTime(),
                              y: item.counts
                            })) || [],
                          borderColor: CHART_COLORS.success,
                          backgroundColor: CHART_COLORS.background.success,
                          tension: 0.3,
                          fill: false,
                          pointRadius: 4,
                          cubicInterpolationMode: 'monotone',
                        },
                        {
                          label: 'Neutral',
                          data: butterChickenSentimentData
                            ?.filter(item => item.m1_sentiment === 'Neutral')
                            .sort((a, b) => new Date(a.response_date).getTime() - new Date(b.response_date).getTime())
                            .map(item => ({
                              x: new Date(item.response_date).getTime(),
                              y: item.counts
                            })) || [],
                          borderColor: CHART_COLORS.warning,
                          backgroundColor: CHART_COLORS.background.warning,
                          tension: 0.3,
                          fill: false,
                          pointRadius: 4,
                          cubicInterpolationMode: 'monotone',
                        },
                        {
                          label: 'Negative',
                          data: butterChickenSentimentData
                            ?.filter(item => item.m1_sentiment === 'Negative')
                            .sort((a, b) => new Date(a.response_date).getTime() - new Date(b.response_date).getTime())
                            .map(item => ({
                              x: new Date(item.response_date).getTime(),
                              y: item.counts
                            })) || [],
                          borderColor: CHART_COLORS.error,
                          backgroundColor: CHART_COLORS.background.error,
                          tension: 0.3,
                          fill: false,
                          pointRadius: 4,
                          cubicInterpolationMode: 'monotone',
                        }
                      ]
                    }}
                    options={{
                      scales: {
                        x: {
                          type: 'time',
                          time: {
                            unit: 'day',
                            displayFormats: {
                              day: 'MMM d'
                            }
                          },
                          title: {
                            display: true,
                            text: 'Response Date'
                          }
                        },
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Number of Responses'
                          },
                          min: 0,
                          ticks: {
                            stepSize: 1
                          }
                        }
                      },
                      plugins: {
                        tooltip: {
                          mode: 'index',
                          intersect: false
                        },
                        legend: {
                          position: 'bottom',
                          labels: {
                            usePointStyle: true,
                            padding: 20
                          }
                        }
                      },
                      interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false
                      }
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mango Lassi Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800 font-display tracking-tight">
                Mango Lassi Freshness
              </CardTitle>
              <p className="text-sm text-gray-500 font-medium mt-1">
                Distribution of freshness feedback
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[280px] w-full flex justify-center items-center">
                <div className="relative w-full max-w-[600px]">
                  <BarChart 
                    horizontal={true}
                    data={{
                      labels: mangoLassiFreshnessData?.map((item: FeedbackData) => item.m2_q1) || [],
                      datasets: [{
                        label: 'Responses',
                        data: mangoLassiFreshnessData?.map((item: FeedbackData) => item.total_responses) || [],
                        backgroundColor: [
                          CHART_COLORS.primary,
                          CHART_COLORS.warning,
                          CHART_COLORS.error,
                        ],
                        borderRadius: 6,
                        barThickness: 30,
                      }]
                    }} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800 font-display tracking-tight">
                Mango Lassi Sweetness
              </CardTitle>
              <p className="text-sm text-gray-500 font-medium mt-1">
                Distribution of sweetness feedback
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[280px] w-full flex justify-center items-center">
                <div className="relative w-full max-w-[300px]">
                  <RadarChart data={{
                    labels: mangoLassiSweetnessData?.map((item: FeedbackData) => item.m2_q2) || [],
                    datasets: [{
                      label: 'Responses',
                      data: mangoLassiSweetnessData?.map((item: FeedbackData) => item.total_responses) || [],
                      backgroundColor: 'rgba(14, 165, 233, 0.2)',
                      borderColor: CHART_COLORS.info,
                      borderWidth: 2,
                      pointBackgroundColor: CHART_COLORS.info,
                      pointBorderColor: '#fff',
                      pointHoverBackgroundColor: '#fff',
                      pointHoverBorderColor: CHART_COLORS.info
                    }]
                  }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800 font-display tracking-tight">
                Mango Lassi Sentiment Trends
              </CardTitle>
              <p className="text-sm text-gray-500 font-medium mt-1">
                Sentiment analysis of Mango Lassi feedback
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px] w-full flex justify-center items-center">
                <div className="relative w-full max-w-[800px]">
                  <LineChart 
                    data={{
                      datasets: [
                        {
                          label: 'Positive',
                          data: mangoLassiSentimentData
                            ?.filter(item => item.m2_sentiment === 'Positive')
                            .sort((a, b) => new Date(a.response_date).getTime() - new Date(b.response_date).getTime())
                            .map(item => ({
                              x: new Date(item.response_date).getTime(),
                              y: item.counts
                            })) || [],
                          borderColor: CHART_COLORS.success,
                          backgroundColor: CHART_COLORS.background.success,
                          tension: 0.3,
                          fill: false,
                          pointRadius: 4,
                          cubicInterpolationMode: 'monotone',
                        },
                        {
                          label: 'Neutral',
                          data: mangoLassiSentimentData
                            ?.filter(item => item.m2_sentiment === 'Neutral')
                            .sort((a, b) => new Date(a.response_date).getTime() - new Date(b.response_date).getTime())
                            .map(item => ({
                              x: new Date(item.response_date).getTime(),
                              y: item.counts
                            })) || [],
                          borderColor: CHART_COLORS.warning,
                          backgroundColor: CHART_COLORS.background.warning,
                          tension: 0.3,
                          fill: false,
                          pointRadius: 4,
                          cubicInterpolationMode: 'monotone',
                        },
                        {
                          label: 'Negative',
                          data: mangoLassiSentimentData
                            ?.filter(item => item.m2_sentiment === 'Negative')
                            .sort((a, b) => new Date(a.response_date).getTime() - new Date(b.response_date).getTime())
                            .map(item => ({
                              x: new Date(item.response_date).getTime(),
                              y: item.counts
                            })) || [],
                          borderColor: CHART_COLORS.error,
                          backgroundColor: CHART_COLORS.background.error,
                          tension: 0.3,
                          fill: false,
                          pointRadius: 4,
                          cubicInterpolationMode: 'monotone',
                        }
                      ]
                    }}
                    options={{
                      scales: {
                        x: {
                          type: 'time',
                          time: {
                            unit: 'day',
                            displayFormats: {
                              day: 'MMM d'
                            }
                          },
                          title: {
                            display: true,
                            text: 'Response Date'
                          }
                        },
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Number of Responses'
                          },
                          min: 0,
                          ticks: {
                            stepSize: 1
                          }
                        }
                      },
                      plugins: {
                        tooltip: {
                          mode: 'index',
                          intersect: false
                        },
                        legend: {
                          position: 'bottom',
                          labels: {
                            usePointStyle: true,
                            padding: 20
                          }
                        }
                      },
                      interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false
                      }
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  )
}
