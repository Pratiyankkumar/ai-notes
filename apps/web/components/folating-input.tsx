import { useState, useEffect, useRef } from "react";
import InputWithActions from "@/components/input";

const FloatingInput = () => {
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const threshold = window.innerHeight - 100;

      if (isHovered) {
        setIsVisible(true);
        return;
      }

      setIsVisible(e.clientY >= threshold);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isHovered]);

  return (
    <div
      ref={inputRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <InputWithActions />
    </div>
  );
};

export default FloatingInput;
