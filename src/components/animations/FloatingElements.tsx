import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface FloatingElement {
  id: string;
  emoji: string;
  size: number;
  initialX: number;
  initialY: number;
  parallaxSpeed: number;
  rotationSpeed: number;
}

const elements: FloatingElement[] = [
  { id: 'tomato1', emoji: '🍅', size: 60, initialX: 5, initialY: 20, parallaxSpeed: 0.3, rotationSpeed: 0.5 },
  { id: 'basil1', emoji: '🌿', size: 50, initialX: 90, initialY: 35, parallaxSpeed: 0.4, rotationSpeed: -0.3 },
  { id: 'cheese1', emoji: '🧀', size: 45, initialX: 8, initialY: 55, parallaxSpeed: 0.25, rotationSpeed: 0.4 },
  { id: 'olive1', emoji: '🫒', size: 35, initialX: 92, initialY: 70, parallaxSpeed: 0.35, rotationSpeed: -0.6 },
  { id: 'pepper1', emoji: '🌶️', size: 40, initialX: 3, initialY: 85, parallaxSpeed: 0.45, rotationSpeed: 0.7 },
  { id: 'mushroom1', emoji: '🍄', size: 38, initialX: 95, initialY: 15, parallaxSpeed: 0.28, rotationSpeed: -0.4 },
  { id: 'tomato2', emoji: '🍅', size: 35, initialX: 88, initialY: 50, parallaxSpeed: 0.5, rotationSpeed: 0.3 },
  { id: 'basil2', emoji: '🌿', size: 42, initialX: 6, initialY: 40, parallaxSpeed: 0.32, rotationSpeed: -0.5 },
];

const FloatingElement = ({ element }: { element: FloatingElement }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [0, -300 * element.parallaxSpeed]
  );
  
  const rotate = useTransform(
    scrollYProgress,
    [0, 1],
    [0, 360 * element.rotationSpeed]
  );
  
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1, 1.2, 0.8]
  );
  
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.1, 0.9, 1],
    [0.7, 1, 1, 0.5]
  );

  return (
    <motion.div
      ref={ref}
      className="fixed pointer-events-none z-0"
      style={{
        left: `${element.initialX}%`,
        top: `${element.initialY}%`,
        y,
        rotate,
        scale,
        opacity,
        fontSize: element.size,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 0.7, scale: 1 }}
      transition={{ duration: 1, delay: Math.random() * 0.5 }}
    >
      {element.emoji}
    </motion.div>
  );
};

export const FloatingElements = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {elements.map((element) => (
        <FloatingElement key={element.id} element={element} />
      ))}
    </div>
  );
};
