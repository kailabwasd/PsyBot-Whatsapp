import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, X, Check } from 'lucide-react';

export const CookieConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: true,
    security: true,
  });

  useEffect(() => {
    const consent = localStorage.getItem('subatech_cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('subatech_cookie_consent', JSON.stringify({ necessary: true, analytics: true, security: true, timestamp: Date.now() }));
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('subatech_cookie_consent', JSON.stringify({ ...preferences, timestamp: Date.now() }));
    setShowBanner(false);
    setShowModal(false);
  };

  if (!showBanner && !showModal) return null;

  return (
    <>
      {/* Bottom Sticky Cookie Banner */}
      {showBanner && !showModal && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 border-t border-slate-800 p-4 sm:p-5 backdrop-blur-xl shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] shrink-0 mt-0.5">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="text-xs text-slate-300 space-y-1">
                <h4 className="font-bold text-white text-sm">Política de Cookies & Privacidad Sanitaria - SubaTECH</h4>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Utilizamos cookies técnicas esenciales, almacenamiento seguro de sesión y reCAPTCHA v3 para garantizar la seguridad clínica, el secreto profesional y prevenir accesos no autorizados en el sistema de salud mental de Suba.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition cursor-pointer"
              >
                Configurar Cookies
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#00E5FF] hover:bg-[#00D2F4] text-slate-950 shadow-lg shadow-[#00E5FF]/20 transition cursor-pointer"
              >
                Aceptar Todas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Preferences Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2BF267]/10 border border-[#2BF267]/30 flex items-center justify-center text-[#2BF267]">
                  <Cookie className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Configuración de Privacidad y Cookies</h3>
                  <p className="text-xs text-slate-400">Subred Integrada de Servicios de Salud Norte - SubaTECH</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-300 overflow-y-auto max-h-[60vh]">
              <p className="text-slate-400 leading-relaxed">
                Nuestra plataforma cumple con los más altos estándares de seguridad clínica y protección de datos sanitarios. Puedes personalizar tus preferencias de cookies a continuación:
              </p>

              {/* Necessary Cookies */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Cookies Técnicas Esenciales</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">Obligatorias</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Necesarias para la autenticación en Firebase, persistencia de sesión del profesional y encriptación de historiales clínicos.
                  </p>
                </div>
                <input type="checkbox" checked disabled className="mt-1 w-4 h-4 rounded accent-[#00E5FF]" />
              </div>

              {/* Security / reCAPTCHA Cookies */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Cookies de Seguridad & reCAPTCHA v3</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#00E5FF]/20 text-[#00E5FF] font-mono">Protección anti-bots</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Utilizadas para verificar la autenticidad de las solicitudes de inicio de sesión y prevenir accesos maliciosos a la red de salud.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.security}
                  onChange={(e) => setPreferences({ ...preferences, security: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded accent-[#00E5FF]"
                />
              </div>

              {/* Analytics */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Métricas de Calidad Asistencial</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Opcional</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Estadísticas anónimas sobre tiempos de respuesta en triage y optimización del flujo de urgencias psicológicas.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded accent-[#00E5FF]"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-850 flex items-center justify-between rounded-b-3xl">
              <button
                onClick={() => {
                  setShowModal(false);
                  setShowBanner(false);
                }}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                Rechazar opcionales
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#2BF267] text-slate-950 hover:bg-emerald-400 transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Preferencias de Cookies</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
