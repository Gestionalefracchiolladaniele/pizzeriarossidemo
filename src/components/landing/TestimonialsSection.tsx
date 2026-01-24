import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useRef, useState } from "react";

const testimonials = [
  {
    name: "Maria Bianchi",
    role: "Cliente fedele",
    avatar: "MB",
    rating: 5,
    text: "La migliore pizza di Milano, senza dubbio! L'impasto è leggero e digeribile, gli ingredienti sono sempre freschi. Vengo qui ogni settimana.",
    date: "2 settimane fa",
  },
  {
    name: "Luca Ferrari",
    role: "Food Blogger",
    avatar: "LF",
    rating: 5,
    text: "Ho provato centinaia di pizzerie in Italia. Questa è tra le top 5. Il forno a legna fa davvero la differenza, si sente la tradizione in ogni morso.",
    date: "1 mese fa",
  },
  {
    name: "Anna Russo",
    role: "Residente",
    avatar: "AR",
    rating: 5,
    text: "Consegna sempre puntuale e pizza ancora calda. Il servizio clienti è eccezionale. La mia preferita è la Quattro Formaggi, divina!",
    date: "3 settimane fa",
  },
  {
    name: "Giovanni Conti",
    role: "Chef",
    avatar: "GC",
    rating: 5,
    text: "Da professionista del settore, apprezzo la cura nei dettagli. L'impasto a 72 ore si sente, la mozzarella è quella vera. Complimenti!",
    date: "1 settimana fa",
  },
];

const TestimonialsSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-20 lg:py-28 bg-[hsl(var(--cream))] relative overflow-hidden">
      {/* Background decoration */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--pizzeria-red) / 0.15) 1px, transparent 1px)`,
          backgroundSize: '25px 25px'
        }}
      />
      
      {/* Floating decoration */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-20 w-40 h-40 rounded-full bg-[hsl(var(--pizzeria-red))]/10 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-[hsl(var(--gold))]/15 blur-3xl"
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Large decorative quotes - Enhanced */}
          <div className="relative inline-block mb-6">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring" }}
              className="relative"
            >
              <Quote className="w-20 h-20 lg:w-24 lg:h-24 text-[hsl(var(--pizzeria-red))]/30" />
              <div className="absolute inset-0 bg-[hsl(var(--pizzeria-red))]/10 rounded-full blur-2xl -z-10" />
            </motion.div>
          </div>

          <div className="inline-block px-4 py-2 bg-[hsl(var(--pizzeria-red))]/10 text-[hsl(var(--pizzeria-red))] text-sm font-medium rounded-full mb-4">
            Testimonianze Verificate
          </div>
          
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[hsl(var(--charcoal))] mb-4">
            Cosa Dicono i <span className="text-gradient-red">Nostri Clienti</span>
          </h2>
          
          {/* Google Rating Badge - Enhanced */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="inline-flex flex-col sm:flex-row items-center gap-4 mt-6 px-6 py-5 bg-white rounded-2xl border-2 border-[hsl(var(--pizzeria-red))]/20 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.1)]"
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl lg:text-3xl font-bold text-gradient-red">ECCELLENTE</span>
              <div className="flex items-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -30 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.1, type: "spring" }}
                  >
                    <Star className="w-6 h-6 fill-[hsl(var(--gold))] text-[hsl(var(--gold))]" />
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="hidden sm:block h-14 w-px bg-[hsl(var(--cream-dark))]" />
            <div className="text-center sm:text-left">
              <div className="text-sm text-[hsl(var(--charcoal)/0.6)]">In base a</div>
              <div className="font-bold text-xl text-[hsl(var(--pizzeria-red))]">523 recensioni</div>
            </div>
            <div className="hidden sm:block h-14 w-px bg-[hsl(var(--cream-dark))]" />
            <img 
              src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" 
              alt="Google" 
              className="h-7"
            />
          </motion.div>
        </motion.div>

        {/* Testimonials Grid */}
        <div ref={containerRef} className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group"
            >
              <motion.div 
                className="bg-white rounded-3xl p-6 lg:p-8 border-2 border-[hsl(var(--cream-dark))] h-full relative overflow-hidden transition-all duration-300"
                whileHover={{ y: -5, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)" }}
              >
                {/* Hover glow effect */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
                  className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--pizzeria-red))]/5 to-transparent pointer-events-none"
                />

                {/* Quote Icon */}
                <Quote className="absolute top-6 right-6 w-12 h-12 text-[hsl(var(--pizzeria-red))]/10 group-hover:text-[hsl(var(--pizzeria-red))]/20 transition-colors" />

                {/* Rating with Google badge */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex gap-0.5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + i * 0.05 }}
                      >
                        <Star className="w-5 h-5 fill-[hsl(var(--gold))] text-[hsl(var(--gold))]" />
                      </motion.div>
                    ))}
                  </div>
                  <span className="text-xs text-[hsl(var(--charcoal)/0.5)]">{testimonial.date}</span>
                </div>

                {/* Text */}
                <p className="text-[hsl(var(--charcoal))] mb-6 leading-relaxed text-lg">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <motion.div 
                    className="w-14 h-14 rounded-full bg-gradient-red flex items-center justify-center text-white font-bold text-lg shadow-red"
                    whileHover={{ scale: 1.1 }}
                  >
                    {testimonial.avatar}
                  </motion.div>
                  <div>
                    <div className="font-semibold text-[hsl(var(--charcoal))] text-lg">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-[hsl(var(--charcoal)/0.6)] flex items-center gap-2">
                      {testimonial.role}
                      <span className="inline-flex items-center gap-1 text-xs bg-[hsl(var(--basil-green))]/10 text-[hsl(var(--basil-green))] px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 bg-[hsl(var(--basil-green))] rounded-full" />
                        Verificata
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Stats - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 grid grid-cols-3 gap-4 lg:gap-8 max-w-3xl mx-auto"
        >
          {[
            { value: "4.9", label: "Valutazione Media", suffix: "/5", color: "text-gradient-red" },
            { value: "500+", label: "Recensioni", suffix: "", color: "text-[hsl(var(--gold))]" },
            { value: "98%", label: "Ci Raccomandano", suffix: "", color: "text-gradient-red" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + index * 0.15 }}
              whileHover={{ scale: 1.05 }}
              className="text-center p-4 lg:p-6 rounded-2xl bg-white border-2 border-[hsl(var(--cream-dark))]"
            >
              <div className={`text-3xl lg:text-5xl font-bold ${stat.color}`}>
                {stat.value}
                <span className="text-xl lg:text-2xl">{stat.suffix}</span>
              </div>
              <div className="text-sm lg:text-base text-[hsl(var(--charcoal)/0.6)] mt-2">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
