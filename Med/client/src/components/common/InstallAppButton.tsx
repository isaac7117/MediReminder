import React, { useState } from 'react';
import { Download, Share, Plus, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface InstallAppButtonProps {
  className?: string;
}

/**
 * Botón "Instalar app" para la PWA.
 * - En Chrome/Edge/Android usa el diálogo nativo de instalación.
 * - En iOS (Safari no soporta el prompt) muestra instrucciones manuales.
 * - Si la app ya está instalada (modo standalone) no se muestra.
 */
const InstallAppButton: React.FC<InstallAppButtonProps> = ({ className }) => {
  const { canInstall, isIOS, isStandalone, promptInstall } = usePWAInstall();
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  // Ya instalada o no hay forma de instalar → no mostrar
  if (isStandalone) return null;
  if (!canInstall && !isIOS) return null;

  const handleClick = async () => {
    if (canInstall) {
      await promptInstall();
    } else if (isIOS) {
      setShowIOSHelp(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={
          className ||
          'w-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-200 shadow-medical hover:shadow-medical-md active:scale-[0.98]'
        }
      >
        <Download size={18} />
        Instalar app
      </button>

      {/* Instrucciones para iOS */}
      {showIOSHelp && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowIOSHelp(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-medical-dark">Instalar en iPhone/iPad</h3>
              <button onClick={() => setShowIOSHelp(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <ol className="space-y-4 text-sm text-gray-600">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <span className="flex items-center gap-1.5 flex-wrap">
                  Toca el botón <Share size={16} className="text-primary-600 inline" /> <strong>Compartir</strong> en la barra de Safari.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <span className="flex items-center gap-1.5 flex-wrap">
                  Elige <Plus size={16} className="text-primary-600 inline" /> <strong>Añadir a pantalla de inicio</strong>.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <span>Toca <strong>Añadir</strong> y listo: MediReminder quedará en tu pantalla de inicio.</span>
              </li>
            </ol>
            <button
              onClick={() => setShowIOSHelp(false)}
              className="mt-6 w-full btn-primary py-2.5 text-sm"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallAppButton;
