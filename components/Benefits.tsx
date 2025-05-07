import { theme, cn } from "@/theme";

export default function Benefits() {
  const benefits = [
    {
      icon: "🎯",
      title: "Personalized Insights",
      description: "Gain customized feedback insights tailored specifically to your restaurant needs and goals."
    },
    {
      icon: "⏱️",
      title: "Time Savings",
      description: "Automated analysis saves hours of manual work and provides insights immediately."
    },
    {
      icon: "📈",
      title: "Improved Metrics",
      description: "Restaurants using our system report an average 27% increase in customer satisfaction scores."
    },
    {
      icon: "💡",
      title: "Actionable Intelligence",
      description: "Convert raw feedback into clear, actionable steps to improve your restaurant's products and services."
    },
    {
      icon: "🔄",
      title: "Continuous Improvement",
      description: "Implement a culture of ongoing enhancement based on real customer experiences."
    },
    {
      icon: "🛡️",
      title: "Competitive Edge",
      description: "Stay ahead of competitors by responding faster to changing customer expectations."
    }
  ];

  return (
    <section id="benefits" className={cn(
      theme.spacing.section.default,
      "pt-24",
      "bg-gradient-to-b from-gray-50 to-white",
      "mb-20"
    )}>
      <div className={theme.spacing.container}>
        <div className="text-center mb-16">
          <h2 className={cn(
            theme.typography.fontSize["4xl"],
            theme.typography.fontWeight.bold,
            theme.typography.fontFamily.display,
            "tracking-tight mb-3",
            theme.colors.text.gradient
          )}>
            Why Choose Our Solution
          </h2>
          <p className={cn(
            theme.typography.fontSize.lg,
            theme.colors.text.secondary,
            "max-w-2xl mx-auto"
          )}>
            Our hyper-personalized feedback system delivers tangible results for restaurants of all sizes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className={cn(
                theme.colors.background.light,
                "p-6",
                theme.borderRadius.default,
                theme.effects.shadow.md,
                "border border-gray-100",
                "hover:shadow-xl",
                theme.transitions.shadow,
                "bg-gradient-to-br from-white to-indigo-50/30"
              )}
            >
              <div className="text-4xl mb-4">{benefit.icon}</div>
              <h3 className={cn(
                theme.typography.fontSize.xl,
                theme.typography.fontWeight.semibold,
                "mb-3",
                theme.colors.text.primary
              )}>{benefit.title}</h3>
              <p className={theme.colors.text.secondary}>{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a 
            href="/login" 
            className={cn(
              "inline-block",
              theme.effects.gradient.primary,
              "hover:from-indigo-700 hover:to-purple-700",
              theme.colors.text.white,
              theme.typography.fontWeight.bold,
              "py-3 px-8",
              theme.borderRadius.default,
              theme.transitions.colors,
              theme.effects.shadow.lg
            )}
          >
            Start Your Journey Today
          </a>
        </div>
      </div>
    </section>
  );
} 