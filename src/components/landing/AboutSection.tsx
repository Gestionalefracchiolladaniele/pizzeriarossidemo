import { motion, useScroll, useTransform } from "framer-motion";
import { Quote, Flame, Clock, Award, Leaf } from "lucide-react";
import { useRef } from "react";
import { WaveDivider } from "@/components/ui/WaveDivider";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Flame, title: "Forno a Legna", description: "485°C per una cottura perfetta in 90 secondi", color: "from-orange-500 to-red-500" },
  { icon: Clock, title: "Impasto 72h", description: "Lievitazione lenta per massima digeribilità", color: "from-amber-500 to-orange-500" },
  { icon: Award, title: "Ingredienti DOP", description: "Solo prodotti certificati e selezionati", color: "from-yellow-500 to-amber-500" },
  { icon: Leaf, title: "100% Fresco", description: "Ingredienti freschi ogni giorno", color: "from-green-500 to-emerald-500" },
];

const AboutSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const textY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <>
      {/* First part - Light background with image */}
      <section id="chi-siamo" ref={sectionRef} className="py-20 lg:py-28 bg-background overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image Side with Parallax */}
            <motion.div
              style={{ y: imageY }}
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1579751626657-72bc17010498?q=80&w=1000"
                  alt="Il nostro pizzaiolo al lavoro"
                  className="w-full h-full object-cover"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                whileInView={{ opacity: 1, scale: 1, rotate: -6 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
                className="absolute -bottom-6 -right-6 lg:bottom-8 lg:-right-8 bg-primary text-primary-foreground rounded-2xl p-6 shadow-red-lg"
              >
                <div className="text-4xl font-display font-bold">1990</div>
                <div className="text-sm opacity-90">Anno di fondazione</div>
              </motion.div>

              {/* Decorative elements */}
              <div className="absolute -z-10 -top-6 -left-6 w-full h-full border-4 border-primary/20 rounded-3xl" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute -top-12 -right-12 w-24 h-24 border-2 border-dashed border-primary/30 rounded-full"
              />
            </motion.div>

            {/* Content Side */}
            <motion.div
              style={{ y: textY }}
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {/* Section Label */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-full mb-6"
              >
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                La Nostra Storia
              </motion.div>

              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Una Tradizione di{" "}
                <span className="text-gradient-red">Famiglia</span>
              </h2>

              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                Dal 1990, la nostra famiglia porta avanti l'arte della pizza napoletana 
                nel cuore di Milano. Il nostro forno a legna, alimentato solo con legna 
                di faggio, raggiunge i 485°C per una cottura perfetta in 90 secondi.
              </p>

              <p className="text-muted-foreground mb-8 leading-relaxed">
                Utilizziamo solo ingredienti selezionati: farina di grano italiano, 
                pomodori San Marzano DOP, mozzarella di bufala campana e olio 
                extravergine d'oliva della nostra terra.
              </p>

              {/* Features Grid - Premium Style */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="group p-5 rounded-2xl bg-primary/5 border border-primary/10 hover:border-primary/30 hover:shadow-[0_8px_30px_-8px_hsl(var(--pizzeria-red)/0.15)] transition-all duration-300"
                  >
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shrink-0 mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="font-bold text-foreground text-base mb-1">{feature.title}</div>
                    <div className="text-sm text-muted-foreground leading-relaxed">{feature.description}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Second part - Red background with quote */}
      <section className="relative py-20 lg:py-24 bg-primary overflow-hidden">
        <WaveDivider variant="top" color="hsl(var(--background))" />
        
        {/* Background pattern */}
        <div className="absolute inset-0 bg-pattern-dots opacity-10" />
        
        {/* Decorative circles */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white/10 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.15, 0.1, 0.15] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-white/10 blur-3xl"
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Large Quote Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 mb-8"
            >
              <Quote className="w-10 h-10 text-white" />
            </motion.div>

            <blockquote className="font-display text-2xl md:text-3xl lg:text-4xl text-white font-medium leading-relaxed mb-8">
              "La pizza non è solo cibo, è passione, è tradizione, è famiglia. 
              Ogni pizza che esce dal nostro forno porta con sé trent'anni di amore 
              e dedizione per quest'arte."
            </blockquote>

            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold">
                MR
              </div>
              <div className="text-left">
                <div className="font-semibold text-white text-lg">Mario Rossi</div>
                <div className="text-white/70">Fondatore & Mastro Pizzaiolo</div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-10"
            >
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-primary rounded-full px-8"
              >
                Scopri la Nostra Storia
              </Button>
            </motion.div>
          </motion.div>
        </div>

        <WaveDivider variant="bottom" color="hsl(var(--background))" />
      </section>
    </>
  );
};

export default AboutSection;
