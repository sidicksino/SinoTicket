import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { forwardRef, memo, useState, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export const Input = memo(
  forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
    function Input({ className, type, ...props }, ref) {
      const radius = 100;
      const [visible, setVisible] = useState(false);

      const mouseX = useMotionValue(0);
      const mouseY = useMotionValue(0);

      function handleMouseMove({
        currentTarget,
        clientX,
        clientY,
      }: React.MouseEvent<HTMLDivElement>) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
      }

      return (
        <motion.div
          style={{
            background: useMotionTemplate`
          radial-gradient(
            ${visible ? radius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
            var(--color-primary, #3b82f6),
            transparent 80%
          )
        `,
          }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setVisible(true)}
          onMouseLeave={() => setVisible(false)}
          className="group/input rounded-xl p-px transition duration-300"
        >
          <input
            type={type}
            className={cn(
              `flex h-12 w-full border-none bg-slate-900 text-white shadow-input rounded-xl px-4 py-2 text-sm selection:bg-blue-500/30 selection:text-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 disabled:cursor-not-allowed disabled:opacity-50 transition duration-400`,
              className,
            )}
            ref={ref}
            {...props}
          />
        </motion.div>
      );
    },
  ),
);

Input.displayName = "Input";
