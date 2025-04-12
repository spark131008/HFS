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
    <section id="benefits" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold font-display tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Why Choose Our Solution
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our hyper-personalized feedback system delivers tangible results for restaurants of all sizes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-indigo-50/30"
            >
              <div className="text-4xl mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a 
            href="#contact" 
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg"
          >
            Start Your Journey Today
          </a>
        </div>
      </div>
    </section>
  );
} 