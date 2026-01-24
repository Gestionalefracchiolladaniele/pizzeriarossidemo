import { motion } from "framer-motion";

interface WaveDividerProps {
  variant?: "top" | "bottom";
  color?: string;
  className?: string;
  animated?: boolean;
}

export const WaveDivider = ({ 
  variant = "top", 
  color = "hsl(var(--background))",
  className = "",
  animated = true
}: WaveDividerProps) => {
  const isTop = variant === "top";
  
  return (
    <div className={`absolute ${isTop ? "-top-1" : "-bottom-1"} left-0 right-0 overflow-hidden ${className}`}>
      <motion.svg
        initial={animated ? { x: -50 } : undefined}
        animate={animated ? { x: 0 } : undefined}
        transition={{ duration: 1, ease: "easeOut" }}
        viewBox="0 0 1440 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-[calc(100%+100px)] h-auto ${isTop ? "rotate-180" : ""}`}
        preserveAspectRatio="none"
      >
        <path
          d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 80C1248 70 1344 50 1392 40L1440 30V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
          fill={color}
        />
      </motion.svg>
    </div>
  );
};

interface WaveDividerDoubleProps {
  topColor?: string;
  bottomColor?: string;
  className?: string;
}

export const WaveDividerDouble = ({
  topColor = "hsl(var(--primary))",
  bottomColor = "hsl(var(--background))",
  className = ""
}: WaveDividerDoubleProps) => {
  return (
    <div className={`relative h-24 ${className}`}>
      <svg
        viewBox="0 0 1440 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
      >
        <path
          d="M0 0L48 10C96 20 192 40 288 50C384 60 480 60 576 55C672 50 768 40 864 35C960 30 1056 30 1152 40C1248 50 1344 70 1392 80L1440 90V0H1392C1344 0 1248 0 1152 0C1056 0 960 0 864 0C768 0 672 0 576 0C480 0 384 0 288 0C192 0 96 0 48 0H0Z"
          fill={topColor}
        />
        <path
          d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 80C1248 70 1344 50 1392 40L1440 30V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
          fill={bottomColor}
        />
      </svg>
    </div>
  );
};

export default WaveDivider;
