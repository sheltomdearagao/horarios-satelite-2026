import { useEffect, useMemo, useState } from "react";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
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

  const activeSlide = useMemo(() => slides[activeIndex], [activeIndex]);

  useEffect(() => {
    const preloadImages = slides.map((slide) => {
      const image = new Image();
      image.src = slide.src;
      return image;
    });

    return () => {
      preloadImages.forEach((image) => {
        image.src = "";
      });
    };
  }, []);

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 shadow-[0_30px_90px_rgba(2,6,23,0.7)]">
        <TransformWrapper
          key={activeSlide.src}
          initialScale={1}
          minScale={1}
          maxScale={4}
          centerOnInit
          wheel={{ step: 0.2 }}
          doubleClick={{ mode: "zoomIn", step: 1.2 }}
          pinch={{ step: 5 }}
          limitToBounds
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Visão Geral</p>
                  <p className="mt-1 text-sm font-semibold text-white/85">
                    Clique, arraste e use zoom na imagem.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={() => zoomOut()}
                    className="h-10 w-10 rounded-full border border-white/10 bg-slate-900/70 text-white hover:bg-slate-800"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={() => zoomIn()}
                    className="h-10 w-10 rounded-full border border-white/10 bg-slate-900/70 text-white hover:bg-slate-800"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={() => resetTransform()}
                    className="h-10 w-10 rounded-full border border-white/10 bg-slate-900/70 text-white hover:bg-slate-800"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="relative flex h-[52vh] items-center justify-center overflow-hidden bg-slate-900 sm:h-[58vh] lg:h-[60vh]">
                <TransformComponent
                  wrapperClass="!w-full !h-full"
                  contentClass="!w-full !h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                >
                  <img
                    src={activeSlide.src}
                    alt={activeSlide.alt}
                    className="max-h-full max-w-full object-contain select-none"
                    draggable={false}
                  />
                </TransformComponent>
              </div>
            </>
          )}
        </TransformWrapper>

        <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-white/5 px-4 py-3">
          <div className="flex items-center gap-2">
            {slides.map((slide, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={slide.label}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Ir para ${slide.label}`}
                  className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.22em] transition ${
                    isActive
                      ? "bg-emerald-400 text-slate-950"
                      : "border border-white/10 bg-slate-900/70 text-white/75 hover:bg-slate-800"
                  }`}
                >
                  {slide.label}
                </button>
              );
            })}
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
            Toque duplo ou scroll para ampliar
          </p>
        </div>
      </div>
    </div>
  );
};