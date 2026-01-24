import { motion } from "framer-motion";
import { Facebook, Instagram, Phone, Mail, MapPin, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { MultiWaveDivider } from "@/components/ui/WaveDivider";

const Footer = () => {
  return (
    <footer className="relative bg-[hsl(var(--pizzeria-red))] text-white pt-32 pb-8 overflow-hidden">
      {/* Wave Divider at top - from red contact section */}
      <MultiWaveDivider variant="top" primaryColor="hsl(var(--section-red-dark))" />
      
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
          backgroundSize: '25px 25px'
        }}
      />
      
      {/* Decorative elements */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute top-20 right-20 w-64 h-64 border border-white/10 rounded-full"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-20 left-10 w-48 h-48 border border-white/5 rounded-full"
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-2xl">
                🍕
              </div>
              <h3 className="font-display text-2xl font-bold">
                Pizzeria Rossi
              </h3>
            </div>
            <p className="text-white/70 mb-6 text-sm leading-relaxed">
              Dal 1990, portiamo la tradizione della pizza napoletana nel cuore di Milano. 
              Forno a legna, ingredienti freschi, passione autentica.
            </p>
            <div className="flex gap-3">
              <motion.a 
                href="#" 
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </motion.a>
              <motion.a 
                href="#" 
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="font-semibold mb-6 text-lg">Link Utili</h4>
            <ul className="space-y-3 text-sm text-white/70">
              {[
                { label: "Il Nostro Menu", href: "#menu" },
                { label: "Chi Siamo", href: "#chi-siamo" },
                { label: "I Nostri Servizi", href: "#servizi" },
                { label: "FAQ", href: "#faq" },
                { label: "Contatti", href: "#contatti" },
              ].map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="hover:text-white transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-white group-hover:w-3 transition-all" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-semibold mb-6 text-lg">Orari di Apertura</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between text-white/70">
                <span>Lunedì</span>
                <span className="text-white/50">Chiuso</span>
              </li>
              <li className="flex justify-between text-white/70">
                <span>Martedì - Giovedì</span>
                <span>18:00 - 23:00</span>
              </li>
              <li className="flex justify-between text-white/70">
                <span>Venerdì - Sabato</span>
                <span>18:00 - 24:00</span>
              </li>
              <li className="flex justify-between text-white/70">
                <span>Domenica</span>
                <span>18:00 - 23:00</span>
              </li>
            </ul>
            <div className="mt-4 p-3 rounded-lg bg-white/10 text-sm">
              <span className="text-white/90">🔥 Forno attivo dalle 18:30</span>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="font-semibold mb-6 text-lg">Contattaci</h4>
            <ul className="space-y-4 text-sm text-white/70">
              <li className="flex items-start gap-3 group">
                <MapPin className="w-5 h-5 text-white/50 shrink-0 mt-0.5 group-hover:text-white transition-colors" />
                <span className="group-hover:text-white transition-colors">
                  Via Roma 123, 20121 Milano (MI)
                </span>
              </li>
              <li className="flex items-center gap-3 group">
                <Phone className="w-5 h-5 text-white/50 shrink-0 group-hover:text-white transition-colors" />
                <a href="tel:+39021234567" className="group-hover:text-white transition-colors">
                  02 1234567
                </a>
              </li>
              <li className="flex items-center gap-3 group">
                <Mail className="w-5 h-5 text-white/50 shrink-0 group-hover:text-white transition-colors" />
                <a href="mailto:info@pizzeriarossi.it" className="group-hover:text-white transition-colors">
                  info@pizzeriarossi.it
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/50"
        >
          <p className="flex items-center gap-1">
            © 2024 Pizzeria Rossi. Fatto con <Heart className="w-4 h-4 text-white/70 fill-white/70" /> a Milano
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Cookie Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Termini e Condizioni
            </a>
            <Link to="/admin-auth" className="hover:text-white transition-colors text-xs opacity-60">
              Area Riservata
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
