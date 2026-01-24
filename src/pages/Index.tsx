import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import StatsSection from "@/components/landing/StatsSection";
import AboutSection from "@/components/landing/AboutSection";
import ServicesSection from "@/components/landing/ServicesSection";
import PizzaShowcase from "@/components/landing/PizzaShowcase";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FAQSection from "@/components/landing/FAQSection";
import ContactSection from "@/components/landing/ContactSection";
import Footer from "@/components/landing/Footer";
import { FloatingElements } from "@/components/animations/FloatingElements";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <FloatingElements />
      <Navbar />
      <HeroSection />
      <StatsSection />
      <AboutSection />
      <PizzaShowcase />
      <ServicesSection />
      <TestimonialsSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
