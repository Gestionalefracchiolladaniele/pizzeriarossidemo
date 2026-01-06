import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Maria Bianchi",
    role: "Cliente fedele",
    avatar: "MB",
    rating: 5,
    text: "La migliore pizza di Milano, senza dubbio! L'impasto è leggero e digeribile, gli ingredienti sono sempre freschi. Vengo qui ogni settimana.",
  },
  {
    name: "Luca Ferrari",
    role: "Food Blogger",
    avatar: "LF",
    rating: 5,
    text: "Ho provato centinaia di pizzerie in Italia. Questa è tra le top 5. Il forno a legna fa davvero la differenza, si sente la tradizione in ogni morso.",
  },
  {
    name: "Anna Russo",
    role: "Residente",
    avatar: "AR",
    rating: 5,
    text: "Consegna sempre puntuale e pizza ancora calda. Il servizio clienti è eccezionale. La mia preferita è la Quattro Formaggi, divina!",
  },
  {
    name: "Giovanni Conti",
    role: "Chef",
    avatar: "GC",
    rating: 5,
    text: "Da professionista del settore, apprezzo la cura nei dettagli. L'impasto a 72 ore si sente, la mozzarella è quella vera. Complimenti!",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 lg:py-28 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-16"
        >
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
            Testimonianze
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Cosa Dicono i <span className="text-primary">Nostri Clienti</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            La soddisfazione dei nostri clienti è la nostra migliore pubblicità
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className="bg-card rounded-2xl p-6 lg:p-8 border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg h-full relative">
                {/* Quote Icon */}
                <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/10" />

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 flex flex-wrap justify-center gap-8 lg:gap-16"
        >
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-primary">4.9</div>
            <div className="text-muted-foreground">Google Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-primary">500+</div>
            <div className="text-muted-foreground">Recensioni</div>
          </div>
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-primary">98%</div>
            <div className="text-muted-foreground">Raccomandano</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
