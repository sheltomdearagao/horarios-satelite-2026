import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const slides = [
  {
    src: "/overview-manha.png",
    alt: "Horário geral da manhã",
    label: "Manhã",
  },
  {
    src: "/overview-tarde.png",
    alt: "Horário geral da tarde",
    label: "Tarde",
  },
];

export const OverviewCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const slideCount = slides.length;

  const goNext = () => {
    setActiveIndex((current) => (current + 1) % slideCount);
  };

  const goPrev = () => {
    setActiveIndex((current) => (current - 1 + slideCount) % slideCount);
  };

  useEffect(() => {
    const timer = window.setInterval(goNext, 5000);
    return () => window.clearInterval(timer);
  }, []);

  const activeSlide = useMemo(() => slides[activeIndex], [activeIndex]);

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 shadow-[0_30px_90px_rgba(2,6,23,0.7)]">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
          <img
            src={activeSlide.src}
            alt={activeSlide.alt}
            className="h-full w-full object-contain"
          />

          <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.28em] text-white/80 backdrop-blur">
            {activeSlide.label}
          </div>

          <button
            type="button"
            onClick={goPrev}
            aria-label="Imagem anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-slate-950/70 p-2 text-white/90 backdrop-blur transition hover:bg-slate-900"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={goNext}
            aria-label="Próxima imagem"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-slate-950/70 p-2 text-white/90 backdrop-blur transition hover:bg-slate-900"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-white/5 px-4 py-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Visão Geral</p>
            <p className="mt-1 text-sm font-semibold text-white/85">
              Deslize para alternar entre manhã e tarde.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.label}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Ir para ${slide.label}`}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeIndex ? "w-8 bg-emerald-400" : "w-2.5 bg-white/25"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};