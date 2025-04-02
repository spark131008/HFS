import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
            Get <span className="text-blue-600">Personalized Feedback</span> for Your Restaurant
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Transform customer opinions into actionable insights with our hyper-personalized feedback system. Understand what your customers really want.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/survey">
                Try it Now
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#how-it-works">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Abstract shapes for visual interest */}
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-100 rounded-full opacity-50 blur-3xl"></div>
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-100 rounded-full opacity-50 blur-3xl"></div>
  
    </section>
  );
} 