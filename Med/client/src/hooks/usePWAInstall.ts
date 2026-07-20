import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Hook para instalar la PWA.
 * - `canInstall`: hay un prompt nativo disponible (Chrome/Edge/Android).
 * - `isIOS`: dispositivo iOS (Safari no soporta el prompt; requiere instrucciones).
 * - `isStandalone`: la app ya está instalada / abierta como app.
 * - `promptInstall()`: dispara el diálogo nativo de instalación.
 */
export const usePWAInstall = () => {
  const getDeferred = () => (window as any).__deferredInstallPrompt as BeforeInstallPromptEvent | null;

  const [canInstall, setCanInstall] = useState<boolean>(!!getDeferred());

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true;

  useEffect(() => {
    const onInstallable = () => setCanInstall(!!getDeferred());
    const onInstalled = () => setCanInstall(false);

    window.addEventListener('pwa-installable', onInstallable);
    window.addEventListener('pwa-installed', onInstalled);
    // Por si el evento se disparó antes de montar
    onInstallable();

    return () => {
      window.removeEventListener('pwa-installable', onInstallable);
      window.removeEventListener('pwa-installed', onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    const deferred = getDeferred();
    if (!deferred) return 'unavailable';
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === 'accepted') {
      (window as any).__deferredInstallPrompt = null;
      setCanInstall(false);
    }
    return choice.outcome;
  }, []);

  return { canInstall, isIOS, isStandalone, promptInstall };
};
