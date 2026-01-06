import { motion, useScroll, useTransform } from "framer-motion";
import { Quote } from "lucide-react";
import { useRef } from "react";

const AboutSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const textY = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section id="chi-siamo" ref={sectionRef} className="py-20 lg:py-28 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Side with Parallax */}
          <motion.div
            style={{ y: imageY }}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1579751626657-72bc17010498?q=80&w=1000"
                alt="Il nostro pizzaiolo al lavoro"
                className="w-full h-full object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="absolute -bottom-6 -right-6 lg:bottom-8 lg:-right-8 bg-primary text-primary-foreground rounded-xl p-4 shadow-red"
            >
              <div className="text-3xl font-bold">1990</div>
              <div className="text-sm opacity-90">Anno di fondazione</div>
            </motion.div>

            {/* Decorative element */}
            <div className="absolute -z-10 -top-4 -left-4 w-full h-full border-2 border-primary/30 rounded-2xl" />
          </motion.div>

          {/* Content Side with Parallax */}
          <motion.div
            style={{ y: textY }}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* Section Label */}
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
              La Nostra Storia
            </div>

            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Una Tradizione di{" "}
              <span className="text-primary">Famiglia</span>
            </h2>

            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              Dal 1990, la nostra famiglia porta avanti l'arte della pizza napoletana 
              nel cuore di Milano. Il nostro forno a legna, alimentato solo con legna 
              di faggio, raggiunge i 485°C per una cottura perfetta in 90 secondi.
            </p>

            <p className="text-muted-foreground mb-8 leading-relaxed">
              Utilizziamo solo ingredienti selezionati: farina di grano italiano, 
              pomodori San Marzano DOP, mozzarella di bufala campana e olio 
              extravergine d'oliva della nostra terra. L'impasto riposa per 72 ore 
              per una digeribilità eccezionale.
            </p>

            {/* Quote */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative bg-secondary/50 rounded-xl p-6 border-l-4 border-primary"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
              <p className="text-foreground italic mb-3">
                "La pizza non è solo cibo, è passione, è tradizione, è famiglia. 
                Ogni pizza che esce dal nostro forno porta con sé trent'anni di amore."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  MR
                </div>
                <div>
                  <div className="font-semibold text-foreground">Mario Rossi</div>
                  <div className="text-sm text-muted-foreground">Fondatore & Mastro Pizzaiolo</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
