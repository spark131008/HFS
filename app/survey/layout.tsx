import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HFS Survey',
}

export default function SurveyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}