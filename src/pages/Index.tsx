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
import { MultiWaveDivider, TornDivider, CurveDivider, DiagonalDivider, BlobDivider } from "@/components/ui/WaveDivider";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <FloatingElements />
      <Navbar />
      <HeroSection />
      <StatsSection />
      <AboutSection />
      
      {/* Pizza Showcase - Cream background */}
      <div className="relative bg-[hsl(var(--cream))]">
        <MultiWaveDivider variant="top" primaryColor="hsl(var(--background))" />
      </div>
      <PizzaScrollShowcase />
      
      {/* Transition to Green Services Section */}
      <div className="relative bg-[hsl(var(--cream))]">
        <CurveDivider 
          variant="bottom" 
          color="hsl(var(--section-green))" 
          accentColor="hsl(var(--cream))"
        />
      </div>
      
      {/* Services - Green Basil Background */}
      <ServicesScrollShowcase />
      
      {/* Transition to Cream Testimonials */}
      <div className="relative bg-[hsl(var(--section-green))]">
        <TornDivider variant="bottom" color="hsl(var(--cream))" />
      </div>
      
      {/* Testimonials - Cream Background */}
      <TestimonialsSection />
      
      {/* Transition to Gold FAQ */}
      <div className="relative bg-[hsl(var(--cream))]">
        <DiagonalDivider 
          variant="bottom" 
          color="hsl(var(--section-gold))" 
          stripeColor="hsl(var(--gold-dark))"
        />
      </div>
      
      {/* FAQ - Gold Background */}
      <FAQSection />
      
      {/* Transition to Dark Contact */}
      <div className="relative bg-[hsl(var(--section-gold))]">
        <BlobDivider variant="bottom" color="hsl(var(--section-charcoal))" />
      </div>
      
      {/* Contact - Dark Charcoal Background */}
      <ContactSection />
      
      {/* Footer with Red Background */}
      <Footer />
    </div>
  );
};

export default Index;
