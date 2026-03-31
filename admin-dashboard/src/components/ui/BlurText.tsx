import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
}

export function BlurText({ text, delay = 0, className = "" }: BlurTextProps) {
  const words = text.split(" ");
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={`flex flex-wrap ${className}`}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
          animate={
            isInView
              ? {
                  filter: ["blur(10px)", "blur(5px)", "blur(0px)"],
                  opacity: [0, 0.5, 1],
                  y: [50, -5, 0],
                }
              : {}
          }
          transition={{
            duration: 0.35,
            delay: delay / 1000 + index * 0.1,
            ease: "easeOut",
          }}
          className="mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}
