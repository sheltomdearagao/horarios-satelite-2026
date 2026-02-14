import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const isIos = () => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua);
};

const isStandalone = () => {
  // iOS Safari
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav: any = navigator;
  return window.matchMedia?.("(display-mode: standalone)")?.matches || nav.standalone === true;
};

export const PwaInstallPrompt = () => {
  const [bipEvent, setBipEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const show = useMemo(() => {
    if (dismissed) return false;
    if (isStandalone()) return false;
    if (isIos()) return true; // show instructions on iOS
    return !!bipEvent; // show install button when supported
  }, [bipEvent, dismissed]);

  useEffect(() => {
    const handler = (e: Event) => {
      // Chrome/Edge/Android
      e.preventDefault();
      setBipEvent(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    const onInstalled = () => {
      setBipEvent(null);
      setDismissed(true);
    };
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  const onInstall = async () => {
    if (!bipEvent) return;
    await bipEvent.prompt();
    const choice = await bipEvent.userChoice;
    if (choice.outcome === "accepted") {
      setDismissed(true);
      setBipEvent(null);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-3 bottom-4 z-50 mx-auto max-w-xl">
      <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/85 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 h-10 w-10 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <img src="/icons/icon-192.png" alt="Horário Satélite" className="h-full w-full object-contain p-1.5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-white">
              Instalar Horário Satélite
            </p>
            {isIos() ? (
              <p className="mt-1 text-sm text-white/75">
                No iPhone/iPad: toque em <span className="font-semibold text-white">Compartilhar</span> e depois{" "}
                <span className="font-semibold text-white">Adicionar à Tela de Início</span>.
              </p>
            ) : (
              <p className="mt-1 text-sm text-white/75">
                Instale o app para abrir mais rápido e usar em tela cheia.
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {!isIos() && (
                <Button
                  onClick={onInstall}
                  className="h-10 rounded-2xl bg-emerald-500/20 px-4 text-xs font-black uppercase tracking-[0.22em] text-white hover:bg-emerald-500/25"
                >
                  Instalar
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() => setDismissed(true)}
                className="h-10 rounded-2xl border border-white/10 bg-white/5 px-4 text-xs font-black uppercase tracking-[0.22em] text-white hover:bg-white/10"
              >
                Agora não
              </Button>
            </div>
          </div>

          <button
            type="button"
            aria-label="Fechar"
            onClick={() => setDismissed(true)}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/80 hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

PwaInstallPrompt.displayName = "PwaInstallPrompt";