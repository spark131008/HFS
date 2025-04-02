import { Metadata } from "next";
import { Header, HeroSection, HowItWorks, Benefits, Footer } from "./components";

export const metadata: Metadata = {
  title: "HFS Landing Page",
  description: "Welcome to the Hyper-personalized Feedback System",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <HowItWorks />
        <Benefits />
      </main>
      <Footer />
    </div>
  );
} 