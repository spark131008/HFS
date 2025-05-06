import { theme, cn } from "@/theme";

export default function HowItWorks() {
  const steps = [
    {
      icon: "📋",
      title: "Collect Feedback",
      description: "Gather detailed customer feedback through our intuitive survey interface customized for your business.",
    },
    {
      icon: "🔍",
      title: "Analyze Data",
      description: "Our AI-powered system analyzes feedback data to identify patterns, trends, and actionable insights.",
    },
    {
      icon: "📊",
      title: "Visualize Results",
      description: "Access easy-to-understand dashboards and reports showing key metrics and improvement opportunities.",
    },
    {
      icon: "🚀",
      title: "Take Action",
      description: "Implement changes based on data-driven insights to improve customer satisfaction and business performance.",
    },
  ];

  return (
    <section id="how-it-works" className={cn(
      theme.spacing.section.default,
      "bg-gradient-to-b from-white to-gray-50"
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
            How It Works
          </h2>
          <p className={cn(
            theme.typography.fontSize.lg,
            theme.colors.text.secondary,
            "max-w-2xl mx-auto"
          )}>
            Our hyper-personalized feedback system makes it easy to collect, analyze, and act on customer feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
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
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className={cn(
                theme.typography.fontSize.xl,
                theme.typography.fontWeight.semibold,
                "mb-3",
                theme.colors.text.primary
              )}>{step.title}</h3>
              <p className={theme.colors.text.secondary}>{step.description}</p>
              <div className="mt-4 flex items-center">
                <span className={cn(
                  theme.layout.flex.center,
                  "w-8 h-8",
                  theme.borderRadius.full,
                  "bg-indigo-100 text-indigo-600",
                  theme.typography.fontWeight.bold
                )}>
                  {index + 1}
                </span>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block h-0.5 bg-gradient-to-r from-indigo-100 to-purple-100 flex-1 ml-4"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 