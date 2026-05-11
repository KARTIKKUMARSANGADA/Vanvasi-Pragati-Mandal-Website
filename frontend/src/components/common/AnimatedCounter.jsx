import React, { useState, useEffect, useRef } from 'react';
import { useInView, motion, useSpring, useTransform } from 'framer-motion';

const AnimatedCounter = ({ value, duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  // Clean the value (e.g., "150+" -> 150)
  const numericValue = parseInt(value.replace(/,/g, '').replace('+', '')) || 0;
  const suffix = value.includes('+') ? '+' : '';

  const springValue = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  const displayValue = useTransform(springValue, (latest) => 
    Math.floor(latest).toLocaleString() + suffix
  );

  useEffect(() => {
    if (isInView) {
      springValue.set(numericValue);
    }
  }, [isInView, numericValue, springValue]);

  return (
    <motion.span ref={ref} className="tabular-nums">
      {displayValue}
    </motion.span>
  );
};

export default AnimatedCounter;
