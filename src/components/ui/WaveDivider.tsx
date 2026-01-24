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

// Multi-layer wave divider with 3 overlapping waves
interface MultiWaveDividerProps {
  variant?: "top" | "bottom";
  primaryColor?: string;
  className?: string;
}

export const MultiWaveDivider = ({
  variant = "bottom",
  primaryColor = "hsl(var(--background))",
  className = ""
}: MultiWaveDividerProps) => {
  const isTop = variant === "top";
  
  return (
    <div className={`absolute ${isTop ? "-top-1" : "-bottom-1"} left-0 right-0 overflow-hidden pointer-events-none ${className}`}>
      <motion.svg
        initial={{ opacity: 0, y: isTop ? -20 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewBox="0 0 1440 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-auto min-h-[120px] lg:min-h-[180px] ${isTop ? "rotate-180" : ""}`}
        preserveAspectRatio="none"
      >
        {/* Background wave - most subtle */}
        <motion.path
          initial={{ x: -100 }}
          animate={{ x: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          d="M0,80 C360,140 720,40 1080,100 C1260,130 1440,60 1440,60 V200 H0 Z"
          fill={primaryColor}
          opacity="0.3"
        />
        {/* Middle wave */}
        <motion.path
          initial={{ x: 50 }}
          animate={{ x: 0 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
          d="M0,120 C240,70 480,170 720,120 C960,70 1200,150 1440,100 V200 H0 Z"
          fill={primaryColor}
          opacity="0.6"
        />
        {/* Foreground wave - main */}
        <motion.path
          initial={{ x: -50 }}
          animate={{ x: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          d="M0,150 C180,200 360,110 540,150 C720,190 900,110 1080,150 C1260,190 1440,130 1440,130 V200 H0 Z"
          fill={primaryColor}
        />
      </motion.svg>
    </div>
  );
};

// Torn paper effect divider
interface TornDividerProps {
  variant?: "top" | "bottom";
  color?: string;
  className?: string;
}

export const TornDivider = ({
  variant = "bottom",
  color = "hsl(var(--background))",
  className = ""
}: TornDividerProps) => {
  const isTop = variant === "top";
  
  return (
    <div className={`absolute ${isTop ? "-top-1" : "-bottom-1"} left-0 right-0 overflow-hidden pointer-events-none ${className}`}>
      <motion.svg
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewBox="0 0 1440 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-auto min-h-[50px] lg:min-h-[70px] ${isTop ? "rotate-180" : ""}`}
        preserveAspectRatio="none"
      >
        {/* Torn paper irregular path */}
        <path
          d="M0,30 L25,35 L50,28 L75,38 L100,32 L125,40 L150,30 L175,36 L200,28 L225,42 L250,35 L275,30 L300,38 L325,32 L350,45 L375,35 L400,28 L425,40 L450,32 L475,38 L500,30 L525,42 L550,35 L575,28 L600,40 L625,32 L650,38 L675,30 L700,45 L725,35 L750,28 L775,40 L800,32 L825,38 L850,30 L875,42 L900,35 L925,28 L950,40 L975,32 L1000,38 L1025,30 L1050,45 L1075,35 L1100,28 L1125,40 L1150,32 L1175,38 L1200,30 L1225,42 L1250,35 L1275,28 L1300,40 L1325,32 L1350,38 L1375,30 L1400,45 L1425,35 L1440,32 V80 H0 Z"
          fill={color}
        />
        {/* Shadow effect */}
        <path
          d="M0,28 L25,33 L50,26 L75,36 L100,30 L125,38 L150,28 L175,34 L200,26 L225,40 L250,33 L275,28 L300,36 L325,30 L350,43 L375,33 L400,26 L425,38 L450,30 L475,36 L500,28 L525,40 L550,33 L575,26 L600,38 L625,30 L650,36 L675,28 L700,43 L725,33 L750,26 L775,38 L800,30 L825,36 L850,28 L875,40 L900,33 L925,26 L950,38 L975,30 L1000,36 L1025,28 L1050,43 L1075,33 L1100,26 L1125,38 L1150,30 L1175,36 L1200,28 L1225,40 L1250,33 L1275,26 L1300,38 L1325,30 L1350,36 L1375,28 L1400,43 L1425,33 L1440,30 V80 H0 Z"
          fill={color}
          opacity="0.5"
        />
      </motion.svg>
    </div>
  );
};

// Smooth curve divider with decorative dots
interface CurveDividerProps {
  variant?: "top" | "bottom";
  color?: string;
  accentColor?: string;
  showDots?: boolean;
  className?: string;
}

export const CurveDivider = ({
  variant = "bottom",
  color = "hsl(var(--background))",
  accentColor = "hsl(var(--primary))",
  showDots = true,
  className = ""
}: CurveDividerProps) => {
  const isTop = variant === "top";
  
  return (
    <div className={`absolute ${isTop ? "-top-1" : "-bottom-1"} left-0 right-0 overflow-hidden pointer-events-none ${className}`}>
      <motion.svg
        initial={{ opacity: 0, scaleY: 0.8 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewBox="0 0 1440 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-auto min-h-[80px] lg:min-h-[120px] ${isTop ? "rotate-180" : ""}`}
        preserveAspectRatio="none"
      >
        {/* Main curve */}
        <path
          d="M0,60 Q360,140 720,60 Q1080,-20 1440,60 V140 H0 Z"
          fill={color}
        />
        
        {/* Decorative dots */}
        {showDots && (
          <>
            <motion.circle
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.4 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              cx="200" cy="80" r="6"
              fill={accentColor}
            />
            <motion.circle
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.3 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              cx="400" cy="50" r="4"
              fill={accentColor}
            />
            <motion.circle
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.5 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              cx="720" cy="70" r="8"
              fill={accentColor}
            />
            <motion.circle
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.3 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              cx="1000" cy="45" r="5"
              fill={accentColor}
            />
            <motion.circle
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.4 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              cx="1250" cy="75" r="6"
              fill={accentColor}
            />
          </>
        )}
      </motion.svg>
    </div>
  );
};

// Diagonal stripe divider
interface DiagonalDividerProps {
  variant?: "top" | "bottom";
  color?: string;
  stripeColor?: string;
  className?: string;
}

export const DiagonalDivider = ({
  variant = "bottom",
  color = "hsl(var(--background))",
  stripeColor = "hsl(var(--primary))",
  className = ""
}: DiagonalDividerProps) => {
  const isTop = variant === "top";
  
  return (
    <div className={`absolute ${isTop ? "-top-1" : "-bottom-1"} left-0 right-0 overflow-hidden pointer-events-none ${className}`}>
      <motion.svg
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewBox="0 0 1440 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-auto min-h-[60px] lg:min-h-[90px] ${isTop ? "rotate-180" : ""}`}
        preserveAspectRatio="none"
      >
        {/* Diagonal stripes pattern */}
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ delay: 0.2 }}
          d="M0,0 L100,100 L150,100 L50,0 Z"
          fill={stripeColor}
        />
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ delay: 0.25 }}
          d="M200,0 L300,100 L350,100 L250,0 Z"
          fill={stripeColor}
        />
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ delay: 0.3 }}
          d="M400,0 L500,100 L550,100 L450,0 Z"
          fill={stripeColor}
        />
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ delay: 0.35 }}
          d="M600,0 L700,100 L750,100 L650,0 Z"
          fill={stripeColor}
        />
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ delay: 0.4 }}
          d="M800,0 L900,100 L950,100 L850,0 Z"
          fill={stripeColor}
        />
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ delay: 0.45 }}
          d="M1000,0 L1100,100 L1150,100 L1050,0 Z"
          fill={stripeColor}
        />
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ delay: 0.5 }}
          d="M1200,0 L1300,100 L1350,100 L1250,0 Z"
          fill={stripeColor}
        />
        
        {/* Main diagonal cut */}
        <path
          d="M0,40 L1440,0 V100 H0 Z"
          fill={color}
        />
      </motion.svg>
    </div>
  );
};

// Organic blob divider
interface BlobDividerProps {
  variant?: "top" | "bottom";
  color?: string;
  className?: string;
}

export const BlobDivider = ({
  variant = "bottom",
  color = "hsl(var(--background))",
  className = ""
}: BlobDividerProps) => {
  const isTop = variant === "top";
  
  return (
    <div className={`absolute ${isTop ? "-top-1" : "-bottom-1"} left-0 right-0 overflow-hidden pointer-events-none ${className}`}>
      <motion.svg
        initial={{ opacity: 0, y: isTop ? -30 : 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        viewBox="0 0 1440 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-auto min-h-[90px] lg:min-h-[130px] ${isTop ? "rotate-180" : ""}`}
        preserveAspectRatio="none"
      >
        {/* Organic blob shape */}
        <path
          d="M0,100 C120,80 180,120 300,90 C420,60 480,110 600,80 C720,50 780,100 900,70 C1020,40 1080,90 1200,60 C1320,30 1380,80 1440,50 V150 H0 Z"
          fill={color}
        />
        {/* Secondary blob for depth */}
        <path
          d="M0,110 C100,130 200,90 350,120 C500,150 600,100 750,130 C900,160 1000,110 1150,140 C1300,170 1400,120 1440,100 V150 H0 Z"
          fill={color}
          opacity="0.7"
        />
      </motion.svg>
    </div>
  );
};

export default WaveDivider;
