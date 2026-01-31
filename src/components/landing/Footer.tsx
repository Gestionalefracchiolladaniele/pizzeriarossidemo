import { motion } from "framer-motion";
import { Facebook, Instagram, Phone, Mail, MapPin, Heart } from "lucide-react";
import { Link } from "react-router-dom";

// Basil leaf SVG component for realistic leaves
const BasilLeaf = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg 
    viewBox="0 0 50 70" 
    className={className}
    style={style}
    fill="currentColor"
  >
    {/* Main leaf shape */}
    <path d="M25 2C15 5 8 20 6 35C4 50 12 65 25 68C38 65 46 50 44 35C42 20 35 5 25 2Z" opacity="0.9"/>
    {/* Central vein */}
    <path d="M25 8C25 8 25 60 25 65" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.5"/>
    {/* Side veins */}
    <path d="M25 20C20 22 14 28 12 32" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.4"/>
    <path d="M25 20C30 22 36 28 38 32" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.4"/>
    <path d="M25 35C18 38 12 45 10 50" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.4"/>
    <path d="M25 35C32 38 38 45 40 50" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.4"/>
  </svg>
);

const Footer = () => {
  // Generate positions for basil leaves
  const largeLeaves = [
    { left: '5%', top: '15%', rotate: 25, scale: 1.2 },
    { left: '15%', top: '45%', rotate: -35, scale: 1 },
    { left: '25%', top: '70%', rotate: 45, scale: 0.9 },
    { left: '40%', top: '20%', rotate: -20, scale: 1.1 },
    { left: '55%', top: '55%', rotate: 60, scale: 1 },
    { left: '65%', top: '25%', rotate: -45, scale: 1.3 },
    { left: '75%', top: '65%', rotate: 30, scale: 0.95 },
    { left: '85%', top: '35%', rotate: -60, scale: 1.15 },
    { left: '92%', top: '75%', rotate: 15, scale: 0.85 },
    { left: '10%', top: '80%', rotate: -25, scale: 1.05 },
    { left: '50%', top: '85%', rotate: 40, scale: 0.9 },
    { left: '80%', top: '10%', rotate: -50, scale: 1 },
  ];

  const smallLeaves = [
    { left: '8%', top: '30%', rotate: 50, scale: 0.6 },
    { left: '20%', top: '60%', rotate: -70, scale: 0.5 },
    { left: '35%', top: '40%', rotate: 35, scale: 0.55 },
    { left: '48%', top: '10%', rotate: -30, scale: 0.65 },
    { left: '60%', top: '70%', rotate: 80, scale: 0.5 },
    { left: '72%', top: '45%', rotate: -55, scale: 0.6 },
    { left: '88%', top: '55%', rotate: 25, scale: 0.55 },
    { left: '30%', top: '15%', rotate: -40, scale: 0.5 },
    { left: '95%', top: '20%', rotate: 65, scale: 0.45 },
    { left: '3%', top: '65%', rotate: -15, scale: 0.6 },
  ];

  return (
    <footer className="relative bg-[hsl(var(--pizzeria-red))] text-white pt-12 pb-6 overflow-hidden">
      
      {/* Large Green Basil Leaves */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {largeLeaves.map((leaf, i) => (
          <motion.div
            key={`large-${i}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
            className="absolute"
            style={{
              left: leaf.left,
              top: leaf.top,
            }}
          >
            <BasilLeaf 
              className="text-[#2E7D32] w-10 h-14 md:w-12 md:h-16"
              style={{
                transform: `rotate(${leaf.rotate}deg) scale(${leaf.scale})`,
                filter: 'drop-shadow(2px 3px 4px rgba(0,0,0,0.25))',
              }}
            />
          </motion.div>
        ))}
        
        {/* Small Accent Basil Leaves */}
        {smallLeaves.map((leaf, i) => (
          <div
            key={`small-${i}`}
            className="absolute"
            style={{
              left: leaf.left,
              top: leaf.top,
            }}
          >
            <BasilLeaf 
              className="text-[#4CAF50] w-5 h-7 md:w-6 md:h-9 opacity-70"
              style={{
                transform: `rotate(${leaf.rotate}deg) scale(${leaf.scale})`,
              }}
            />
          </div>
        ))}
      </div>
      
      {/* Subtle red texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--pizzeria-red-light)) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-10">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-xl">
                🍕
              </div>
              <h3 className="font-display text-xl font-bold">
                Pizzeria Rossi
              </h3>
            </div>
            <p className="text-white/70 mb-4 text-xs leading-relaxed">
              Dal 1990, portiamo la tradizione della pizza napoletana nel cuore di Milano. 
              Forno a legna, ingredienti freschi, passione autentica.
            </p>
            <div className="flex gap-2">
              <motion.a 
                href="#" 
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </motion.a>
              <motion.a 
                href="#" 
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </motion.a>
            </div>
          </motion.div>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="font-semibold mb-4 text-base">Link Utili</h4>
            <ul className="space-y-2 text-xs text-white/70">
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
                    className="hover:text-white transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <span className="w-0 h-0.5 bg-white group-hover:w-2 transition-all" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Hours */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-semibold mb-4 text-base">Orari di Apertura</h4>
            <ul className="space-y-2 text-xs">
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
            <div className="mt-3 p-2 rounded-lg bg-white/10 text-xs">
              <span className="text-white/90">🔥 Forno attivo dalle 18:30</span>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="font-semibold mb-4 text-base">Contattaci</h4>
            <ul className="space-y-3 text-xs text-white/70">
              <li className="flex items-start gap-2 group">
                <MapPin className="w-4 h-4 text-white/50 shrink-0 mt-0.5 group-hover:text-white transition-colors" />
                <span className="group-hover:text-white transition-colors">
                  Via Roma 123, 20121 Milano (MI)
                </span>
              </li>
              <li className="flex items-center gap-2 group">
                <Phone className="w-4 h-4 text-white/50 shrink-0 group-hover:text-white transition-colors" />
                <a href="tel:+39021234567" className="group-hover:text-white transition-colors">
                  02 1234567
                </a>
              </li>
              <li className="flex items-center gap-2 group">
                <Mail className="w-4 h-4 text-white/50 shrink-0 group-hover:text-white transition-colors" />
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
          className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/50"
        >
          <p className="flex items-center gap-1">
            © 2024 Pizzeria Rossi. Fatto con <Heart className="w-3 h-3 text-white/70 fill-white/70" /> a Milano
          </p>
          <div className="flex flex-wrap justify-center gap-4">
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