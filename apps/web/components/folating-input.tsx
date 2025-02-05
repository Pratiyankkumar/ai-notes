import { useState, useEffect } from "react";
import InputWithActions from "@/components/input";

const FloatingInput = () => {
  const [isVisible, setIsVisible] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mouseY, setMouseY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseY(e.clientY);
      const threshold = window.innerHeight - 100;
      setIsVisible(e.clientY >= threshold);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-50 
        transition-all duration-500 ease-in-out 
        ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }
        shadow-2xl rounded-t-xl
      `}
      style={{
        transform: `translateY(${isVisible ? "0" : "100%"})`,
        transitionDelay: isVisible ? "0ms" : "300ms",
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <div
        className={`
          p-4 bg-transparent
          transition-opacity duration-500 
          ${isVisible ? "opacity-100" : "opacity-0"}
        `}
      >
        <InputWithActions />
      </div>
    </div>
  );
};

export default FloatingInput;
