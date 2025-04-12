import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-r from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
            Get <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Personalized Feedback</span> for Your Restaurant
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Transform customer opinions into actionable insights with our hyper-personalized feedback system. Understand what your customers really want.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg font-semibold shadow-lg" asChild>
              <Link href="/survey">
                Try it Now
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-lg font-semibold" asChild>
              <Link href="#how-it-works">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Abstract shapes for visual interest */}
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-100 rounded-full opacity-50 blur-3xl"></div>
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-purple-100 rounded-full opacity-50 blur-3xl"></div>
  
    </section>
  );
} 