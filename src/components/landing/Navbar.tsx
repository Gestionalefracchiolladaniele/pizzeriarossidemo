import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, User, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Chi Siamo", href: "/#chi-siamo" },
  { label: "Menu", href: "/menu" },
  { label: "Prenota", href: "/prenota" },
  { label: "Contatti", href: "/#contatti" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    if (href.startsWith("/#")) {
      const sectionId = href.replace("/#", "");
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const NavItem = ({ link }: { link: typeof navLinks[0] }) => {
    const isActive = location.pathname === link.href || (link.href === "/" && location.pathname === "/");
    
    if (link.href.startsWith("/#")) {
      return (
        <a
          href={link.href}
          onClick={(e) => {
            if (isHomePage) {
              e.preventDefault();
              handleNavClick(link.href);
            }
          }}
          className={`relative text-sm font-medium transition-all duration-300 hover:text-primary group ${
            isScrolled || !isHomePage ? "text-foreground" : "text-white/90"
          }`}
        >
          {link.label}
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
        </a>
      );
    }
    return (
      <Link
        to={link.href}
        className={`relative text-sm font-medium transition-all duration-300 hover:text-primary group ${
          isScrolled || !isHomePage ? "text-foreground" : "text-white/90"
        } ${isActive ? "text-primary" : ""}`}
      >
        {link.label}
        <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${
          isActive ? "w-full" : "w-0 group-hover:w-full"
        }`} />
      </Link>
    );
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled || !isHomePage
          ? "bg-background/95 backdrop-blur-xl shadow-lg border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-20 lg:h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="w-12 h-12 rounded-full bg-gradient-red flex items-center justify-center shadow-red"
            >
              <span className="text-2xl">🍕</span>
            </motion.div>
            <span
              className={`font-display text-xl lg:text-2xl font-bold transition-colors ${
                isScrolled || !isHomePage ? "text-foreground" : "text-white"
              }`}
            >
              Pizzeria <span className="text-primary">Rossi</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavItem key={link.label} link={link} />
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:+39021234567"
              className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                isScrolled || !isHomePage ? "text-foreground" : "text-white/90"
              }`}
            >
              <Phone className="w-4 h-4 text-primary" />
              <span className="hidden xl:inline">02 1234567</span>
            </a>
            
            <Link to="/auth?role=user">
              <Button 
                variant="ghost" 
                size="sm"
                className={isScrolled || !isHomePage ? "text-foreground" : "text-white/90"}
              >
                <User className="w-4 h-4 mr-2" />
                Utente
              </Button>
            </Link>
            <Link to="/auth?role=admin">
              <Button 
                variant="ghost" 
                size="sm"
                className={isScrolled || !isHomePage ? "text-foreground" : "text-white/90"}
              >
                Admin
              </Button>
            </Link>
            
            <Link to="/ordina">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-red rounded-full px-6 group">
                <ShoppingBag className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Ordina
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button - Animated Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 transition-colors ${
              isScrolled || !isHomePage ? "text-foreground" : "text-white"
            }`}
          >
            <motion.span
              animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="w-6 h-0.5 bg-current origin-center"
            />
            <motion.span
              animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              className="w-6 h-0.5 bg-current"
            />
            <motion.span
              animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="w-6 h-0.5 bg-current origin-center"
            />
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 space-y-2">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {link.href.startsWith("/#") ? (
                    <a
                      href={link.href}
                      onClick={(e) => {
                        if (isHomePage) {
                          e.preventDefault();
                          handleNavClick(link.href);
                        }
                      }}
                      className="block py-3 text-foreground hover:text-primary font-medium transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`block py-3 text-foreground hover:text-primary font-medium transition-colors ${
                        location.pathname === link.href ? "text-primary" : ""
                      }`}
                    >
                      {link.label}
                    </Link>
                  )}
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-6 space-y-3 border-t border-border mt-4"
              >
                <a
                  href="tel:+39021234567"
                  className="flex items-center gap-2 text-foreground py-2"
                >
                  <Phone className="w-4 h-4 text-primary" />
                  02 1234567
                </a>
                <Link to="/auth?role=user" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">
                    <User className="w-4 h-4 mr-2" />
                    Accedi Utente
                  </Button>
                </Link>
                <Link to="/auth?role=admin" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full mt-2">
                    <User className="w-4 h-4 mr-2" />
                    Accedi Admin
                  </Button>
                </Link>
                <Link to="/ordina" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-red mt-2">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Ordina Ora
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
