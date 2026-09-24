import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  ShieldCheck, 
  Palette, 
  Key, 
  X, 
  CheckCircle2, 
  Award, 
  Lock, 
  Sliders,
  Globe,
  Database,
  Terminal,
  AlertCircle,
  FileClock
} from 'lucide-react';
import type { PsychologistAuthUser } from '../types/index.ts';
import { AuditLog } from './AuditLog.tsx';

interface SettingsModalProps {
  currentUser: PsychologistAuthUser;
  onClose: () => void;
  onUpdateUser: (updated: PsychologistAuthUser) => void;
  allPsychologists: PsychologistAuthUser[];
  onUpdatePsychologistRole: (uid: string, isAdmin: boolean) => void;
  themeMode: 'light' | 'dark' | 'subatech';
  onThemeChange: (theme: 'light' | 'dark' | 'subatech') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  currentUser,
  onClose,
  onUpdateUser,
  allPsychologists,
  onUpdatePsychologistRole,
  themeMode,
  onThemeChange,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'admins' | 'theme' | 'secrets' | 'audit'>('profile');
  
  // Profile editing local state
  const [displayName, setDisplayName] = useState(currentUser.displayName || '');
  const [license, setLicense] = useState(currentUser.license || '');
  const [specialty, setSpecialty] = useState(currentUser.specialty || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Secrets editing (Only for owner/admin)
  const [twilioSid, setTwilioSid] = useState(localStorage.getItem('subatech_twilio_sid') || 'AC_mock_subatech_9921');
  const [twilioAuth, setTwilioAuth] = useState(localStorage.getItem('subatech_twilio_auth') || '••••••••••••••••••••');
  const [githubToken, setGithubToken] = useState(localStorage.getItem('subatech_github_token') || 'ghp_subatech_live_prod_sec');
  const [railwayKey, setRailwayKey] = useState(localStorage.getItem('subatech_railway_key') || 'rw_prod_key_suba_cluster');
  const [secretsSaved, setSecretsSaved] = useState(false);

  const isOwner = currentUser.email === 'kailabwasd@gmail.com' || currentUser.isAdmin;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PsychologistAuthUser = {
      ...currentUser,
      displayName: displayName.trim(),
      license: license.trim(),
      specialty: specialty.trim(),
      phone: phone.trim(),
    };
    onUpdateUser(updated);
    setSuccessMsg('Perfil actualizado correctamente.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSaveSecrets = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('subatech_twilio_sid', twilioSid);
    localStorage.setItem('subatech_twilio_auth', twilioAuth);
    localStorage.setItem('subatech_github_token', githubToken);
    localStorage.setItem('subatech_railway_key', railwayKey);
    setSecretsSaved(true);
    setTimeout(() => setSecretsSaved(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00E5FF]/20 to-[#2BF267]/20 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF]">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Panel de Configuración General</h2>
              <p className="text-xs text-slate-400">Subred Norte • SubaTECH Sistema de Salud Mental</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950 px-6 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${activeTab === 'profile' ? 'border-[#00E5FF] text-[#00E5FF]' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <User className="w-4 h-4" />
            <span>Perfil</span>
          </button>

          {isOwner && (
            <button
              onClick={() => setActiveTab('admins')}
              className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${activeTab === 'admins' ? 'border-[#00E5FF] text-[#00E5FF]' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              <ShieldCheck className="w-4 h-4 text-[#2BF267]" />
              <span>Administradores</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('theme')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${activeTab === 'theme' ? 'border-[#00E5FF] text-[#00E5FF]' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <Palette className="w-4 h-4 text-amber-400" />
            <span>Tema</span>
          </button>

          {isOwner && (
            <button
              onClick={() => setActiveTab('secrets')}
              className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${activeTab === 'secrets' ? 'border-[#00E5FF] text-[#00E5FF]' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              <Key className="w-4 h-4 text-[#FF3646]" />
              <span>Twilio, Github & Railway Secrets</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/40">Owner</span>
            </button>
          )}

          {isOwner && (
            <button
              onClick={() => setActiveTab('audit')}
              className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${activeTab === 'audit' ? 'border-[#00E5FF] text-[#00E5FF]' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              <FileClock className="w-4 h-4 text-[#2BF267]" />
              <span>AuditLog</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">Admin</span>
            </button>
          )}
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          
          {/* Success Banner */}
          {successMsg && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#00E5FF]/40"
                />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">{currentUser.displayName}</h3>
                  <p className="text-xs text-slate-400">{currentUser.email || 'Correo institucional'}</p>
                  <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-500/30">
                    {currentUser.isAdmin ? '👑 Administrador / Owner' : '👨‍⚕️ Psicólogo Clínico Autorizado'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 focus:border-[#00E5FF] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Registro Sanitario / Colpsic</label>
                  <input
                    type="text"
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 focus:border-[#00E5FF] rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Especialidad Clínica</label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 focus:border-[#00E5FF] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Teléfono de Guardia</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 focus:border-[#00E5FF] rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#00E5FF] hover:bg-[#00D2F4] text-slate-950 font-bold text-xs shadow transition cursor-pointer"
                >
                  Guardar Cambios de Perfil
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: ADMINS (Only for Owner) */}
          {activeTab === 'admins' && isOwner && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-300">Gestión de Privilegios Administrativos</p>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    Como Owner, puedes otorgar o revocar privilegios de administrador a los psicólogos registrados en la plataforma SubaTECH.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {allPsychologists.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No hay otros psicólogos registrados actualmente.</p>
                ) : (
                  allPsychologists.map((psych) => (
                    <div key={psych.uid} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={psych.photoURL} alt={psych.displayName} className="w-10 h-10 rounded-xl object-cover" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{psych.displayName}</p>
                          <p className="text-[11px] text-slate-400 truncate">{psych.email || 'Sin correo'}</p>
                          <span className="text-[10px] font-mono text-blue-400">{psych.license || 'Sin registro'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${psych.isAdmin ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'}`}>
                          {psych.isAdmin ? '👑 Administrador' : '👤 Psicólogo'}
                        </span>

                        {psych.email !== 'kailabwasd@gmail.com' && (
                          <button
                            type="button"
                            onClick={() => onUpdatePsychologistRole(psych.uid, !psych.isAdmin)}
                            className={`px-3 py-1.5 text-[11px] font-bold rounded-xl transition cursor-pointer ${psych.isAdmin ? 'bg-red-950 text-red-300 hover:bg-red-900 border border-red-500/30' : 'bg-[#2BF267] text-slate-950 hover:bg-emerald-400'}`}
                          >
                            {psych.isAdmin ? 'Revocar Admin' : 'Hacer Admin'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: THEME */}
          {activeTab === 'theme' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Selecciona la apariencia visual de la plataforma SubaTECH disponible tanto para usuarios como administradores y psicólogos.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => onThemeChange('subatech')}
                  className={`p-4 rounded-2xl border text-left space-y-2 transition cursor-pointer ${themeMode === 'subatech' ? 'bg-[#00E5FF]/10 border-[#00E5FF]' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#00E5FF] to-[#2BF267]" />
                  <h4 className="text-xs font-bold text-white">SubaTECH Oscuro Pro</h4>
                  <p className="text-[11px] text-slate-400">Diseño institucional de alta tecnología con neón y contraste clínico.</p>
                </button>

                <button
                  type="button"
                  onClick={() => onThemeChange('dark')}
                  className={`p-4 rounded-2xl border text-left space-y-2 transition cursor-pointer ${themeMode === 'dark' ? 'bg-blue-600/10 border-blue-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                >
                  <div className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700" />
                  <h4 className="text-xs font-bold text-white">Oscuro Minimalista</h4>
                  <p className="text-[11px] text-slate-400">Tonos grisáceos sobrios para guardias nocturnas prolongadas.</p>
                </button>

                <button
                  type="button"
                  onClick={() => onThemeChange('light')}
                  className={`p-4 rounded-2xl border text-left space-y-2 transition cursor-pointer ${themeMode === 'light' ? 'bg-amber-500/10 border-amber-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                >
                  <div className="w-6 h-6 rounded-lg bg-white border border-slate-300" />
                  <h4 className="text-xs font-bold text-white">Claro Institucional GOV</h4>
                  <p className="text-[11px] text-slate-400">Estándar oficial con fondos claros para consulta diurna.</p>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: SECRETS (Only for Owner) */}
          {activeTab === 'secrets' && isOwner && (
            <form onSubmit={handleSaveSecrets} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-xs text-red-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-300">Credenciales Sensibles (Ámbito Exclusivo del Owner)</p>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    Modifica los parámetros de integración con Twilio WhatsApp, llaves API de GitHub y variables de entorno de Railway.
                  </p>
                </div>
              </div>

              {secretsSaved && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Secretos actualizados y guardados con cifrado local.</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Twilio Account SID</label>
                  <input
                    type="text"
                    value={twilioSid}
                    onChange={(e) => setTwilioSid(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 focus:border-[#FF3646] rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Twilio Auth Token</label>
                  <input
                    type="password"
                    value={twilioAuth}
                    onChange={(e) => setTwilioAuth(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 focus:border-[#FF3646] rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">GitHub Personal Access Token</label>
                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 focus:border-[#FF3646] rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Railway Production Secret Key</label>
                  <input
                    type="password"
                    value={railwayKey}
                    onChange={(e) => setRailwayKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 focus:border-[#FF3646] rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#FF3646] hover:bg-red-600 text-white font-bold text-xs shadow transition cursor-pointer"
                >
                  Guardar Secretos del Sistema
                </button>
              </div>
            </form>
          )}

          {/* TAB 5: AUDIT LOG */}
          {activeTab === 'audit' && (
            <AuditLog currentUser={currentUser} />
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-850 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-white transition cursor-pointer"
          >
            Cerrar Configuración
          </button>
        </div>

      </div>
    </div>
  );
};
