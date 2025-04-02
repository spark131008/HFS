"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

export default function ThankYou() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-50 p-8">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold font-display tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Thank You for Your Feedback!
          </h1>
          <p className="text-lg text-gray-600 font-normal">
            Your response helps us serve you better
          </p>
        </div>

        <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-50/80 to-white/90 hover:shadow-2xl transition-shadow duration-300 rounded-2xl p-8">
          <div className="mb-8 text-center text-gray-600">
            <p className="mb-4">
              Your response has been successfully recorded. Your feedback helps us
              improve and provide better service.
            </p>
            <p>
              We appreciate you taking the time to complete our survey.
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 px-8 rounded-xl font-medium text-lg shadow-lg transition-all duration-200 ease-in-out"
            >
              Return to Home
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
