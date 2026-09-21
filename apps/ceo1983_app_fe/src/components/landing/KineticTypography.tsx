import React from "react";
import { motion } from "framer-motion";

/**
 * Kinetic Word Reveal Component
 * Staggers each word upward with spring physics, blur wipe, and high contrast.
 */
export function KineticWords({
  text,
  className = "",
  highlightIndices = [],
  highlightClass = "text-amber-400 font-extrabold",
  delay = 0,
}: {
  text: string;
  className?: string;
  highlightIndices?: number[];
  highlightClass?: string;
  delay?: number;
}) {
  const words = text.split(" ");

  return (
    <span className={`inline-flex flex-wrap gap-x-[0.3em] overflow-hidden ${className}`}>
      {words.map((word, idx) => {
        const isHighlight = highlightIndices.includes(idx);
        return (
          <motion.span
            key={idx}
            initial={{ y: 35, opacity: 0, filter: "blur(8px)" }}
            whileInView={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{
              duration: 0.6,
              delay: delay + idx * 0.04,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`inline-block ${isHighlight ? highlightClass : ""}`}
          >
            {word}
          </motion.span>
        );
      })}
    </span>
  );
}

/**
 * Kinetic Luxury Gold Heading
 * Features staggered word reveal and sweeping gold sheen effect
 */
export function KineticGoldHeading({
  tag,
  title,
  subtitle,
  className = "",
}: {
  tag?: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-3 text-center ${className}`}>
      {tag && (
        <motion.div
          initial={{ scale: 0.85, opacity: 0, filter: "blur(6px)" }}
          whileInView={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-extrabold tracking-widest uppercase bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent border border-amber-400/30 text-amber-300 backdrop-blur-md shadow-[0_0_20px_rgba(216,178,130,0.15)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span>{tag}</span>
        </motion.div>
      )}

      <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
        <KineticWords
          text={title}
          className="justify-center"
          highlightClass="bg-gradient-to-r from-[#FFE6A5] via-[#D8B282] to-[#B8860B] bg-clip-text text-transparent"
        />
      </h2>

      {subtitle && (
        <motion.p
          initial={{ y: 20, opacity: 0, filter: "blur(6px)" }}
          whileInView={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-xs sm:text-sm md:text-base text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

/**
 * Text Fade Up with blur-to-focus animation
 */
export function KineticTextFadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ y: 25, opacity: 0, filter: "blur(8px)" }}
      whileInView={{ y: 0, opacity: 1, filter: "blur(0px)" }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
