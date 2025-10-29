// src/components/ScrollToTop.jsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!show) return null;

  return (
    <Button
      size="icon"
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 bg-[#FFD54F] hover:bg-[#FFF3C4] text-black shadow-lg transition-all duration-300 hover:scale-110"
      aria-label="Cuộn lên đầu trang"
    >
      <ArrowUp className="w-5 h-5" />
    </Button>
  );
}