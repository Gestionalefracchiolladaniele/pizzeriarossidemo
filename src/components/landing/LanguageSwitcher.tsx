import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "light" | "dark";
}

export const LanguageSwitcher = ({ className, variant = "dark" }: LanguageSwitcherProps) => {
  const { language, setLanguage } = useLanguage();

  const baseBtn =
    "w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-base leading-none transition-all border";
  const activeRing =
    variant === "light"
      ? "border-white ring-2 ring-white/60 scale-110"
      : "border-primary ring-2 ring-primary/40 scale-110";
  const inactive =
    variant === "light"
      ? "border-white/40 opacity-70 hover:opacity-100"
      : "border-border opacity-70 hover:opacity-100";

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <button
        type="button"
        onClick={() => setLanguage("it")}
        aria-label="Italiano"
        title="Italiano"
        className={cn(baseBtn, language === "it" ? activeRing : inactive)}
      >
        <span aria-hidden>🇮🇹</span>
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-label="English"
        title="English"
        className={cn(baseBtn, language === "en" ? activeRing : inactive)}
      >
        <span aria-hidden>🇬🇧</span>
      </button>
    </div>
  );
};