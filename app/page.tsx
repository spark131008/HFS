import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: 'HFS',
};

export default function Home() {
  // Redirect to the landing page
  redirect("/landing");
  
  // This code won't execute due to the redirect, but we'll keep it as a fallback
  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center gap-8">
      <h1 className="text-3xl font-bold">Restaurant Feedback System</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <Link
          href="/landing"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center"
        >
          Landing Page
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center"
        >
          Dashboard
        </Link>
        <Link
          href="/survey"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-center"
        >
          Take Survey
        </Link>
      </div>
    </div>
  );
}
