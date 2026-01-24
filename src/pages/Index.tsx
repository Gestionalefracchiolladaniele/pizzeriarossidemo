import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import StatsSection from "@/components/landing/StatsSection";
import AboutSection from "@/components/landing/AboutSection";
import PizzaScrollShowcase from "@/components/landing/PizzaScrollShowcase";
import ServicesScrollShowcase from "@/components/landing/ServicesScrollShowcase";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FAQSection from "@/components/landing/FAQSection";
import ContactSection from "@/components/landing/ContactSection";
import Footer from "@/components/landing/Footer";
import { FloatingElements } from "@/components/animations/FloatingElements";
import WaveDivider from "@/components/ui/WaveDivider";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <FloatingElements />
      <Navbar />
      <HeroSection />
      <StatsSection />
      <AboutSection />
      <div className="relative">
        <WaveDivider variant="bottom" color="hsl(var(--cream))" />
      </div>
      <PizzaScrollShowcase />
      <div className="relative">
        <WaveDivider variant="bottom" color="hsl(var(--cream))" />
      </div>
      <ServicesScrollShowcase />
      <div className="relative bg-[hsl(var(--cream))]">
        <WaveDivider variant="bottom" color="hsl(var(--background))" />
      </div>
      <TestimonialsSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
