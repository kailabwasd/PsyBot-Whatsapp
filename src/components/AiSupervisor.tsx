import React, { useState } from 'react';
import { 
  Bot, 
  ShieldCheck, 
  ShieldAlert, 
  Eye, 
  ArrowRight, 
  Sparkles, 
  TrendingDown, 
  TrendingUp, 
  Radio, 
  Phone,
  UserCheck
} from 'lucide-react';
import type { PatientSession } from '../types/index.ts';

interface AiSupervisorProps {
  sessions: PatientSession[];
  onTakeOver: (session: PatientSession) => void;
  onPreview: (session: PatientSession) => void;
}

export const AiSupervisor: React.FC<AiSupervisorProps> = ({
  sessions,
  onTakeOver,
  onPreview,
}) => {
  // Filter sessions currently in AI mode
  const aiSessions = sessions.filter((s) => s.state === 'AI_MODE');

  return (
    <div className="space-y-6">
      
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-teal-950/40 via-slate-900 to-slate-900 rounded-2xl p-6 border border-teal-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></span>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Bot className="w-6 h-6 text-teal-400" />
                Monitor Clínico de Supervisión IA (Aura - Google Gemini)
              </h2>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Supervisión en tiempo real de pacientes conversando con el modelo de contención emocional. 
              Como especialista, puedes auditar los diálogos e <span className="text-teal-300 font-semibold">intervenir de inmediato</span> si detectas escalada de dolor o necesidad de psicoterapia presencial.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700">
            <Radio className="w-4 h-4 text-teal-400 animate-pulse" />
            <div>
              <p className="text-slate-400">Conversaciones IA Activas:</p>
              <p className="text-base font-bold text-teal-300 font-mono">{aiSessions.length} pacientes</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Sessions List */}
      {aiSessions.length === 0 ? (
        <div className="bg-slate-800/40 rounded-2xl p-12 text-center border border-dashed border-slate-700">
          <ShieldCheck className="w-12 h-12 text-teal-400 mx-auto mb-3 stroke-[1.5]" />
          <h3 className="text-lg font-bold text-white">No hay sesiones en Modo IA en este momento</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-1">
            Puedes simular un paciente en diálogo de estrés o abrir el simulador de WhatsApp para probar la interacción con Aura.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiSessions.map((session) => {
            const lastMsg = session.messages[session.messages.length - 1];
            const isNegativeSentiment = session.sentimentScore < -0.3;

            return (
              <div
                key={session.id}
                className="bg-slate-900 rounded-2xl p-5 border border-slate-800 hover:border-teal-500/40 transition shadow-lg flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  
                  {/* Top patient bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs">
                        {session.userName.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {session.userName || 'Usuario Anónimo'}
                        </h4>
                        <p className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          {session.phoneNumber}
                        </p>
                      </div>
                    </div>

                    {/* Sentiment meter */}
                    <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
                      {isNegativeSentiment ? (
                        <>
                          <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-amber-300 font-semibold">Tensión Emocional</span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300 font-semibold">Regulando</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Primary Emotion */}
                  {session.primaryEmotion && (
                    <div className="text-xs flex items-center gap-2">
                      <span className="text-slate-400">Enfoque:</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-teal-300 font-medium border border-slate-700">
                        {session.primaryEmotion}
                      </span>
                    </div>
                  )}

                  {/* Last dialogue preview */}
                  {lastMsg && (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1.5 text-xs">
                      <div className="text-[10px] font-semibold text-slate-500 flex items-center justify-between">
                        <span>ÚLTIMA INTERACCIÓN:</span>
                        <span>{new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-300 line-clamp-3 leading-relaxed italic">
                        "{lastMsg.text}"
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {session.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {session.tags.map((t, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => onPreview(session)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Ver Diálogo
                  </button>

                  <button
                    onClick={() => onTakeOver(session)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-teal-950 bg-teal-400 hover:bg-teal-300 transition shadow-lg shadow-teal-500/20 flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Intervenir (Reclamar Caso)
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
