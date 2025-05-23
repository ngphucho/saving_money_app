import React, { useState, useEffect } from "react";
import SlotCounter from "react-slot-counter";

export default function SlotCounterComponent({ number }) {
  const [numbers, setNumbers] = useState(["?", "?", "?"]);

  useEffect(() => {
    const numberString = String(number).padStart(3, "0");
    const digits = numberString.split("");
    setTimeout(() => {
      setNumbers(digits);
    }, 1000);
  });

  return (
    <div style={{ display: "inline" }}>
      <SlotCounter
        startValue={["?", "?", "?"]}
        value={numbers}
        duration={2}
        autoAnimationStart={false}
        animateUnchanged={true}
        delay={0.5}
      />
    </div>
  );
}
