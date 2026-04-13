import { useEffect, useRef, memo, type ReactNode } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

interface BoxRevealProps {
  children: ReactNode;
  width?: string;
  boxColor?: string;
  duration?: number;
  delay?: number;
  overflow?: string;
  className?: string;
}

export const BoxReveal = memo(function BoxReveal({
  children,
  width = 'fit-content',
  boxColor = '#0286FF',
  duration = 0.5,
  delay = 0.25,
  overflow = 'hidden',
  className,
}: BoxRevealProps) {
  const mainControls = useAnimation();
  const slideControls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      slideControls.start('visible');
      mainControls.start('visible');
    }
  }, [isInView, mainControls, slideControls]);

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        width,
        overflow,
      }}
      className={className}
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate={mainControls}
        transition={{ duration, delay }}
      >
        {children}
      </motion.div>
      <motion.div
        variants={{ hidden: { left: 0 }, visible: { left: '100%' } }}
        initial="hidden"
        animate={slideControls}
        transition={{ duration, ease: 'easeIn', delay: delay - 0.1 }}
        style={{
          position: 'absolute',
          top: 4,
          bottom: 4,
          left: 0,
          right: 0,
          zIndex: 20,
          background: boxColor,
          borderRadius: 4,
        }}
      />
    </div>
  );
});
