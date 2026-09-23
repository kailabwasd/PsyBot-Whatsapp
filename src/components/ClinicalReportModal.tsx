import React, { useState } from 'react';
import { 
  FileText, 
  X, 
  Printer, 
  Download, 
  Check, 
  Copy, 
  HeartHandshake, 
  ShieldCheck, 
  Calendar, 
  User, 
  Phone
} from 'lucide-react';
import type { PatientSession } from '../types/index.ts';

interface ClinicalReportModalProps {
  session: PatientSession | null;
  onClose: () => void;
}

export const ClinicalReportModal: React.FC<ClinicalReportModalProps> = ({
  session,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!session) return null;

  const reportText = `=====================================================
INFORME DE ATENCIÓN EMOCIONAL & TRIAGE PSICOLÓGICO
MINDBRIDGE - SISTEMA HÍBRIDO DE CONTENCIÓN Y BIENESTAR
=====================================================

FECHA DE GENERACIÓN: ${new Date().toLocaleString()}
CANAL DE ATENCIÓN: WhatsApp Webhook & Panel Clínico

1. DATOS GENERALES DEL PACIENTE
-----------------------------------------------------
Nombre Registrado: ${session.userName || 'No especificado'}
Teléfono / ID: ${session.phoneNumber}
Inicio de Contacto: ${new Date(session.startedAt).toLocaleString()}
Última Actividad: ${new Date(session.lastActivityAt).toLocaleString()}
Estado Actual de la Sesión: ${session.state}

2. EVALUACIÓN Y TRIAGE DE RIESGO
-----------------------------------------------------
Nivel de Riesgo Determinado: ${session.riskLevel}
Emoción Predominante (IA): ${session.primaryEmotion || 'Sin clasificar'}
Resumen Inicial de Triage: 
${session.triageSummary || 'Sin resumen registrado.'}

Etiquetas Clínicas: ${session.tags.join(', ') || 'Ninguna'}

3. PROFESIONAL RESPONSABLE
-----------------------------------------------------
Psicólogo(a) Asignado(a): ${session.assignedPsychologistName || 'En guardia / Asistente IA'}

4. NOTAS TERAPÉUTICAS PRIVADAS
-----------------------------------------------------
${session.clinicalNotes || 'No se registraron notas adicionales.'}

5. HISTORIAL DE COMUNICACIÓN (TRANSCRIPCIÓN RESUMIDA)
-----------------------------------------------------
${session.messages
  .map(
    (m) =>
      `[${new Date(m.timestamp).toLocaleTimeString()}] ${
        m.sender === 'user' ? session.userName : m.sender === 'psychologist' ? 'Psicólogo' : 'Aura (IA)'
      }: ${m.text}`
  )
  .join('\n')}

=====================================================
Confidencialidad amparada bajo el Código Deontológico de Psicología.
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Informe_Triage_${session.userName.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Informe Clínico de Sesión
              </h3>
              <p className="text-[11px] text-slate-400">
                {session.userName} ({session.phoneNumber})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition"
              title="Copiar texto del informe"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition"
              title="Descargar archivo TXT"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content viewer */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-950 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
          {reportText}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-850 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Documento clínico generado automáticamente por MindBridge</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
