import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div>
            <h3 className="font-display text-2xl font-bold mb-4">
              Pizzeria <span className="text-primary">Rossi</span>
            </h3>
            <p className="text-background/70 mb-4 text-sm leading-relaxed">
              Dal 1990, portiamo la tradizione della pizza napoletana nel cuore di Milano. 
              Forno a legna, ingredienti freschi, passione autentica.
            </p>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-background/10 hover:bg-primary flex items-center justify-center transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-background/10 hover:bg-primary flex items-center justify-center transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Link Utili</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li>
                <a href="#menu" className="hover:text-primary transition-colors">
                  Il Nostro Menu
                </a>
              </li>
              <li>
                <a href="#chi-siamo" className="hover:text-primary transition-colors">
                  Chi Siamo
                </a>
              </li>
              <li>
                <a href="#servizi" className="hover:text-primary transition-colors">
                  I Nostri Servizi
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#contatti" className="hover:text-primary transition-colors">
                  Contatti
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-semibold mb-4">Orari di Apertura</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li className="flex justify-between">
                <span>Lunedì</span>
                <span className="text-primary">Chiuso</span>
              </li>
              <li className="flex justify-between">
                <span>Martedì - Giovedì</span>
                <span>18:00 - 23:00</span>
              </li>
              <li className="flex justify-between">
                <span>Venerdì - Sabato</span>
                <span>18:00 - 24:00</span>
              </li>
              <li className="flex justify-between">
                <span>Domenica</span>
                <span>18:00 - 23:00</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contattaci</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Via Roma 123, 20121 Milano (MI)</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>02 1234567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>info@pizzeriarossi.it</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-background/50">
          <p>© 2024 Pizzeria Rossi. Tutti i diritti riservati.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
