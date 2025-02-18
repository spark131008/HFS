import Link from "next/link";

export const metadata = {
  title: 'HFS',
};

export default function Home() {
  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center gap-8">
      <h1 className="text-3xl font-bold">Restaurant Feedback System</h1>
      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Dashboard
        </Link>
        <Link
          href="/survey"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Take Survey
        </Link>
      </div>
    </div>
  );
}
