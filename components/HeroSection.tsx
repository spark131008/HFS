import Link from "next/link";
import { Button } from "@/components/ui/button";
import { theme, cn } from "@/theme";

export default function HeroSection() {
  return (
    <section className={cn(
      "relative overflow-hidden",
      "pt-28 pb-24",
      theme.spacing.section.default,
      theme.colors.background.gradient,
      "mb-16"
    )}>
      <div className={theme.spacing.container}>
        <div className="max-w-3xl mx-auto text-center">
          <h1 className={cn(
            theme.typography.fontSize["4xl"],
            "md:text-5xl lg:text-6xl",
            theme.typography.fontWeight.bold,
            "tracking-tight",
            theme.colors.text.primary,
            "mb-6"
          )}>
            Get <span className={theme.colors.text.gradient}>Personalized Feedback</span> for Your Restaurant
          </h1>
          <p className={cn(
            theme.typography.fontSize.lg,
            "md:text-xl",
            theme.colors.text.secondary,
            "mb-10 max-w-2xl mx-auto"
          )}>
            Transform customer opinions into actionable insights with our hyper-personalized feedback system. Understand what your customers really want.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className={cn(
                theme.effects.gradient.primary,
                theme.colors.text.white,
                theme.typography.fontSize.lg,
                theme.typography.fontWeight.semibold,
                theme.effects.shadow.lg,
                "hover:from-indigo-700 hover:to-purple-700"
              )} 
              asChild
            >
              <Link href="/login">
                Try it Now
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className={cn(
                theme.colors.border.primary,
                "text-indigo-600 hover:bg-indigo-50",
                theme.typography.fontSize.lg,
                theme.typography.fontWeight.semibold
              )} 
              asChild
            >
              <Link href="#how-it-works">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Abstract shapes for visual interest */}
      <div className={cn(
        "absolute -bottom-24 -left-24 w-80 h-80",
        "bg-indigo-100 rounded-full opacity-50",
        theme.effects.blur.xl
      )}></div>
      <div className={cn(
        "absolute -top-24 -right-24 w-80 h-80",
        "bg-purple-100 rounded-full opacity-50",
        theme.effects.blur.xl
      )}></div>
    </section>
  );
} 