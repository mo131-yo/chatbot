"use client";
import { useState, useEffect } from "react";

interface TypewriterTextProps {
  text: string;
  onComplete?: () => void;
  speed?: number;
  waitBeforeComplete?: number;
}

export const TypewriterText = ({ 
  text, 
  onComplete, 
  speed = 30, 
  waitBeforeComplete = 3000 
}: TypewriterTextProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [i, setI] = useState(0);

  // Хэрэв text өөрчлөгдвөл (дараагийн мессеж ирвэл) reset хийнэ
  useEffect(() => {
    setDisplayedText("");
    setI(0);
  }, [text]);

  useEffect(() => {
    if (i < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[i]);
        setI(i + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (i === text.length && onComplete) {
      // Бичиж дууссаны дараа хүлээх хугацаа
      const waitTimeout = setTimeout(onComplete, waitBeforeComplete);
      return () => clearTimeout(waitTimeout);
    }
  }, [i, text, onComplete, speed, waitBeforeComplete]);

  return <span>{displayedText}</span>;
};