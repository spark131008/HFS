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
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our hyper-personalized feedback system makes it easy to collect, analyze, and act on customer feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
              <div className="mt-4 flex items-center">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">
                  {index + 1}
                </span>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block h-0.5 bg-blue-100 flex-1 ml-4"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 