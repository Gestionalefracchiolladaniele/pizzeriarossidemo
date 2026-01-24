import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import AboutSection from "@/components/landing/AboutSection";
import PizzaScrollShowcase from "@/components/landing/PizzaScrollShowcase";
import ServicesScrollShowcase from "@/components/landing/ServicesScrollShowcase";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FAQSection from "@/components/landing/FAQSection";
import ContactSection from "@/components/landing/ContactSection";
import Footer from "@/components/landing/Footer";
import { FloatingElements } from "@/components/animations/FloatingElements";
import { CurveDivider, MultiWaveDivider } from "@/components/ui/WaveDivider";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <FloatingElements />
      <Navbar />
      <HeroSection />
      <AboutSection />
      
      {/* Pizza Showcase - Strong Orange background */}
      <PizzaScrollShowcase />
      
      {/* Transition from Orange to Green Services Section */}
      <div className="relative bg-[hsl(var(--section-orange-strong))]">
        <MultiWaveDivider 
          variant="bottom" 
          primaryColor="hsl(var(--section-green))" 
        />
      </div>
      
      {/* Services - Green Basil Background */}
      <ServicesScrollShowcase />
      
      {/* Transition from Green to Cream Testimonials */}
      <div className="relative bg-[hsl(var(--section-green))]">
        <CurveDivider 
          variant="bottom" 
          color="hsl(var(--cream))" 
          showDots={false}
        />
      </div>
      
      {/* Testimonials - Cream Background */}
      <TestimonialsSection />
      
      {/* Transition from Cream to Gold FAQ */}
      <div className="relative bg-[hsl(var(--cream))]">
        <CurveDivider 
          variant="bottom" 
          color="hsl(var(--section-gold))" 
          showDots={false}
        />
      </div>
      
      {/* FAQ - Gold Background */}
      <FAQSection />
      
      {/* Transition from Gold to Orange Contact */}
      <div className="relative bg-[hsl(var(--section-gold))]">
        <CurveDivider 
          variant="bottom" 
          color="hsl(var(--section-orange-strong))" 
          showDots={false}
        />
      </div>
      
      {/* Contact - Orange Background */}
      <ContactSection />
      
      {/* Footer with Red Background */}
      <Footer />
    </div>
  );
};

export default Index;