import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import Benefits from "@/components/Benefits";

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