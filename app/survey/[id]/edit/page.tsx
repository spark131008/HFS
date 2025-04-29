'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainNavigationBar from "@/components/MainNavigationBar";

export default function SurveyEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params

  useEffect(() => {
    // Redirect to the survey form with the survey ID as a parameter
    router.push(`/surveyform?id=${id}`)
  }, [router, id])

  return (
    <div className="min-h-screen flex flex-col">
      <MainNavigationBar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent mx-auto mb-4"></div>
          <h1 className="text-xl font-medium text-gray-700">Loading survey editor...</h1>
        </div>
      </div>
    </div>
  )
} 