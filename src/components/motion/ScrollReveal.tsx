"use client";

import { motion, type Variants } from "framer-motion";

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** How far (in px) the element lifts as it reveals. */
  rise?: number;
  /** Trigger every time it scrolls back into view (false = once). */
  always?: boolean;
};

/**
 * Cinematic, calm reveal: slow fade + small lift when entering the viewport.
 * Honors `prefers-reduced-motion` automatically via framer-motion.
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  rise = 24,
  always = false,
}: Props) {
  const variants: Variants = {
    hidden: { opacity: 0, y: rise },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1], delay },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: !always, amount: 0.25 }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
