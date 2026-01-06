import { motion } from "framer-motion";
import { ArrowRight, Flame, Leaf, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    name: "Margherita",
    description: "Pomodoro San Marzano, mozzarella fior di latte, basilico fresco",
    price: "8.00",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=400",
    tags: ["classica"],
  },
  {
    name: "Diavola",
    description: "Pomodoro, mozzarella, salame piccante calabrese",
    price: "10.00",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=400",
    tags: ["piccante"],
  },
  {
    name: "Quattro Formaggi",
    description: "Mozzarella, gorgonzola, fontina, parmigiano reggiano",
    price: "11.00",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400",
    tags: ["speciale"],
  },
  {
    name: "Ortolana",
    description: "Verdure grigliate di stagione, mozzarella, olio evo",
    price: "10.00",
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=400",
    tags: ["vegetariana"],
  },
  {
    name: "Bufala e Prosciutto",
    description: "Mozzarella di bufala DOP, prosciutto crudo di Parma",
    price: "13.00",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400",
    tags: ["speciale"],
  },
  {
    name: "Capricciosa",
    description: "Prosciutto cotto, funghi, carciofi, olive, mozzarella",
    price: "11.00",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=400",
    tags: ["classica"],
  },
];

const tagConfig = {
  classica: { icon: Sparkles, color: "text-primary bg-primary/10" },
  piccante: { icon: Flame, color: "text-red-500 bg-red-500/10" },
  vegetariana: { icon: Leaf, color: "text-green-500 bg-green-500/10" },
  speciale: { icon: Sparkles, color: "text-primary bg-primary/10" },
};

const MenuPreviewSection = () => {
  return (
    <section id="menu" className="py-20 lg:py-28 bg-background">
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
            Il Nostro Menu
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Le Nostre <span className="text-primary">Specialità</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Pizze artigianali cotte nel forno a legna, con ingredienti freschi e selezionati
          </p>
        </motion.div>

        {/* Menu Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group"
            >
              <div className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                {/* Image */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  
                  {/* Tags */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {item.tags.map((tag) => {
                      const config = tagConfig[tag as keyof typeof tagConfig];
                      return (
                        <span
                          key={tag}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
                        >
                          <config.icon className="w-3 h-3" />
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-bold text-foreground">
                      {item.name}
                    </h3>
                    <span className="text-xl font-bold text-primary">
                      €{item.price}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-gold">
            Vedi Menu Completo
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default MenuPreviewSection;
