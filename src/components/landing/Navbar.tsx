import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Chi Siamo", href: "/#chi-siamo" },
  { label: "Menu", href: "/menu" },
  { label: "Prenota", href: "/prenota" },
  { label: "Ordina", href: "/ordina" },
  { label: "Contatti", href: "/#contatti" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

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
          className={`text-sm font-medium transition-colors hover:text-primary ${
            isScrolled || !isHomePage ? "text-foreground" : "text-white/90"
          }`}
        >
          {link.label}
        </a>
      );
    }
    return (
      <Link
        to={link.href}
        className={`text-sm font-medium transition-colors hover:text-primary ${
          isScrolled || !isHomePage ? "text-foreground" : "text-white/90"
        } ${location.pathname === link.href ? "text-primary" : ""}`}
      >
        {link.label}
      </Link>
    );
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || !isHomePage
          ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
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
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isScrolled || !isHomePage ? "text-foreground" : "text-white/90"
              }`}
            >
              <Phone className="w-4 h-4 text-primary" />
              02 1234567
            </a>
            <Link to="/prenota">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-red">
                Prenota Ora
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-2 transition-colors ${
              isScrolled || !isHomePage ? "text-foreground" : "text-white"
            }`}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                link.href.startsWith("/#") ? (
                  <a
                    key={link.label}
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
                    key={link.label}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block py-3 text-foreground hover:text-primary font-medium transition-colors ${
                      location.pathname === link.href ? "text-primary" : ""
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              ))}
              <div className="pt-4 space-y-3">
                <a
                  href="tel:+39021234567"
                  className="flex items-center gap-2 text-foreground"
                >
                  <Phone className="w-4 h-4 text-primary" />
                  02 1234567
                </a>
                <Link to="/prenota">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-red">
                    Prenota Ora
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
