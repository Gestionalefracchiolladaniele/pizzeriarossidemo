import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

// Import real ingredient images
import tomatoImg from "@/assets/ingredients/tomato.png";
import basilImg from "@/assets/ingredients/basil.png";
import cheeseImg from "@/assets/ingredients/cheese.png";
import olivesImg from "@/assets/ingredients/olives.png";
import pepperImg from "@/assets/ingredients/pepper.png";
import mushroomImg from "@/assets/ingredients/mushroom.png";
import prosciuttoImg from "@/assets/ingredients/prosciutto.png";
import garlicImg from "@/assets/ingredients/garlic.png";

interface FloatingElement {
  id: string;
  image: string;
  size: number;
  initialX: number;
  initialY: number;
  parallaxSpeed: number;
  rotationSpeed: number;
  blur?: number;
}

const elements: FloatingElement[] = [
  { id: 'tomato1', image: tomatoImg, size: 140, initialX: 3, initialY: 15, parallaxSpeed: 0.3, rotationSpeed: 0.2, blur: 0 },
  { id: 'basil1', image: basilImg, size: 120, initialX: 88, initialY: 25, parallaxSpeed: 0.4, rotationSpeed: -0.15, blur: 0 },
  { id: 'cheese1', image: cheeseImg, size: 110, initialX: 5, initialY: 45, parallaxSpeed: 0.25, rotationSpeed: 0.1, blur: 0 },
  { id: 'olives1', image: olivesImg, size: 100, initialX: 92, initialY: 55, parallaxSpeed: 0.35, rotationSpeed: -0.2, blur: 0 },
  { id: 'pepper1', image: pepperImg, size: 105, initialX: 2, initialY: 70, parallaxSpeed: 0.45, rotationSpeed: 0.25, blur: 0 },
  { id: 'mushroom1', image: mushroomImg, size: 115, initialX: 90, initialY: 10, parallaxSpeed: 0.28, rotationSpeed: -0.1, blur: 0 },
  { id: 'prosciutto1', image: prosciuttoImg, size: 130, initialX: 85, initialY: 75, parallaxSpeed: 0.5, rotationSpeed: 0.15, blur: 0 },
  { id: 'garlic1', image: garlicImg, size: 95, initialX: 8, initialY: 88, parallaxSpeed: 0.32, rotationSpeed: -0.18, blur: 0 },
  { id: 'tomato2', image: tomatoImg, size: 90, initialX: 95, initialY: 42, parallaxSpeed: 0.38, rotationSpeed: 0.12, blur: 1 },
  { id: 'basil2', image: basilImg, size: 85, initialX: 4, initialY: 35, parallaxSpeed: 0.42, rotationSpeed: -0.22, blur: 1 },
];

const FloatingElement = ({ element }: { element: FloatingElement }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [0, -400 * element.parallaxSpeed]
  );
  
  const rotate = useTransform(
    scrollYProgress,
    [0, 1],
    [0, 180 * element.rotationSpeed]
  );
  
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1, 1.1, 0.9]
  );

  return (
    <motion.div
      ref={ref}
      className="absolute pointer-events-none"
      style={{
        left: `${element.initialX}%`,
        top: `${element.initialY}%`,
        y,
        rotate,
        scale,
        width: element.size,
        height: element.size,
        filter: `blur(${element.blur || 0}px)`,
        opacity: 0.35,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 0.35, scale: 1 }}
      transition={{ duration: 1.2, delay: Math.random() * 0.8, ease: "easeOut" }}
    >
      <img 
        src={element.image} 
        alt="" 
        className="w-full h-full object-contain"
        loading="lazy"
      />
    </motion.div>
  );
};

export const FloatingElements = () => {
  return (
    <div 
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: -1 }}
    >
      {elements.map((element) => (
        <FloatingElement key={element.id} element={element} />
      ))}
    </div>
  );
};
