import React, { useState } from 'react';
import { 
  HeartHandshake, 
  ShieldAlert, 
  UserCheck, 
  Activity, 
  Radio, 
  PlusCircle, 
  RotateCcw,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import type { PsychologistProfile } from '../types/index.ts';

export const PSYCHOLOGISTS: PsychologistProfile[] = [
  {
    id: 'psy-sofia',
    name: 'Dra. Sofía Méndez',
    role: 'Psicóloga Clínica & Triage',
    license: 'Col. Sanitario M-28941',
    avatar: 'https://images.unsplash.com/photo-1594824813576-a05e263d9061?w=150&auto=format&fit=crop&q=80',
    specialty: 'Intervención en Crisis e Ideación',
    activeCasesCount: 2,
  },
  {
    id: 'psy-carlos',
    name: 'Dr. Carlos Rivas',
    role: 'Especialista TCC',
    license: 'Col. Sanitario M-34102',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    specialty: 'Ataques de Pánico y Trastorno de Ansiedad',
    activeCasesCount: 1,
  },
  {
    id: 'psy-elena',
    name: 'Lic. Elena Ortiz',
    role: 'Terapeuta de Primeros Auxilios',
    license: 'Col. Sanitario M-19830',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    specialty: 'Burnout, Duelo y Contención Emocional',
    activeCasesCount: 0,
  }
];

interface HeaderProps {
  currentSpecialist: PsychologistProfile;
  onSelectSpecialist: (specialist: PsychologistProfile) => void;
  waitingCount: number;
  crisisCount: number;
  activeCount: number;
  onSimulateScenario: (type: 'CRISIS' | 'PANIC' | 'ANXIETY') => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSpecialist,
  onSelectSpecialist,
  waitingCount,
  crisisCount,
  activeCount,
  onSimulateScenario,
  onReset,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scenarioOpen, setScenarioOpen] = useState(false);

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <HeartHandshake className="w-6 h-6 text-slate-950 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-teal-300 via-emerald-200 to-white bg-clip-text text-transparent">
                  MindBridge
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  En Vivo
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Plataforma Híbrida de Triage Emocional WhatsApp & IA
              </p>
            </div>
          </div>

          {/* Real-time metrics bar */}
          <div className="hidden lg:flex items-center space-x-3 text-xs">
            <button
              onClick={() => {
                const navBtn = document.querySelector('[data-tab="INTEGRATION"]') as HTMLButtonElement;
                if (navBtn) navBtn.click();
              }}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 transition"
              title="Abrir panel de diagnóstico y conexión Twilio 24/7"
            >
              <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              <span className="text-slate-300">Twilio WhatsApp:</span>
              <span className="text-emerald-400 font-mono font-bold">+1 415 523 8886</span>
            </button>

            {crisisCount > 0 && (
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-500/50 text-red-300 animate-bounce">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span className="font-bold">{crisisCount} en Alerta Crisis</span>
              </div>
            )}

            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-200">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Cola Triage:</span>
              <span className="font-bold bg-amber-500/20 px-1.5 py-0.2 rounded text-amber-300">{waitingCount}</span>
            </div>

            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mis Casos:</span>
              <span className="font-bold text-white">{activeCount}</span>
            </div>
          </div>

          {/* Actions & Specialist Switcher */}
          <div className="flex items-center space-x-3">
            
            {/* Simulation dropdown */}
            <div className="relative">
              <button
                onClick={() => setScenarioOpen(!scenarioOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 text-xs font-semibold transition"
                title="Generar caso de prueba"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden md:inline">Simular Paciente</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {scenarioOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setScenarioOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/60">
                    Inyectar Paciente Real de Prueba
                  </div>
                  <button
                    onClick={() => onSimulateScenario('CRISIS')}
                    className="w-full text-left px-3 py-2 text-xs text-red-300 hover:bg-red-500/10 flex items-center space-x-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span>🚨 Paciente en Crisis (Pide Terapeuta)</span>
                  </button>
                  <button
                    onClick={() => onSimulateScenario('PANIC')}
                    className="w-full text-left px-3 py-2 text-xs text-amber-300 hover:bg-amber-500/10 flex items-center space-x-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>⚡ Paciente con Pánico (Pide Terapeuta)</span>
                  </button>
                  <button
                    onClick={() => onSimulateScenario('ANXIETY')}
                    className="w-full text-left px-3 py-2 text-xs text-teal-300 hover:bg-teal-500/10 flex items-center space-x-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                    <span>🌿 Paciente con Ansiedad (Pide Terapeuta)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Reset button */}
            <button
              onClick={onReset}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Reiniciar casos de demostración"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Specialist Profile Selector */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 transition"
              >
                <img
                  src={currentSpecialist.avatar}
                  alt={currentSpecialist.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500/40"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-white leading-tight">
                    {currentSpecialist.name}
                  </div>
                  <div className="text-[10px] text-emerald-400 leading-tight">
                    {currentSpecialist.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {dropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-700/60 mb-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Cambiar Especialista en Turno
                    </p>
                  </div>
                  {PSYCHOLOGISTS.map((psy) => (
                    <button
                      key={psy.id}
                      onClick={() => onSelectSpecialist(psy)}
                      className={`w-full text-left p-2 rounded-lg flex items-center space-x-3 transition ${
                        currentSpecialist.id === psy.id
                          ? 'bg-emerald-500/10 border border-emerald-500/30'
                          : 'hover:bg-slate-700/50'
                      }`}
                    >
                      <img
                        src={psy.avatar}
                        alt={psy.name}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-600"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">
                          {psy.name}
                        </p>
                        <p className="text-[11px] text-teal-400 truncate">
                          {psy.specialty}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {psy.license}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
