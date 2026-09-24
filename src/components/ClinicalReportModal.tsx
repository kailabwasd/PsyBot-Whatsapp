import React, { useState } from 'react';
import { 
  FileText, 
  X, 
  Printer, 
  Download, 
  Check, 
  Copy, 
  ShieldCheck, 
  Award,
  Building2,
  FileDown
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import type { PatientSession, PsychologistAuthUser } from '../types/index.ts';
import { SubaTechLogo } from './SubaTechLogo.tsx';

interface ClinicalReportModalProps {
  session: PatientSession | null;
  currentUser?: PsychologistAuthUser | null;
  onClose: () => void;
}

export const ClinicalReportModal: React.FC<ClinicalReportModalProps> = ({
  session,
  currentUser,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  if (!session) return null;

  const doctorName = currentUser?.displayName || session.assignedPsychologistName || 'Psicólogo de Guardia';
  const doctorLicense = currentUser?.license || 'Registro Sanitario No Especificado';
  const doctorInstitution = currentUser?.institution || 'Subred Integrada de Servicios de Salud Norte - Suba';
  const doctorSpecialty = currentUser?.specialty || 'Triage y Atención Psicológica';

  const reportText = `=====================================================
SUBATECH - SISTEMA CLÍNICO DE SALUD MENTAL
COCREANDO LA SUBA DEL FUTURO
INFORME OFICIAL DE TRIAGE Y ATENCIÓN EMOCIONAL
=====================================================

FECHA DE GENERACIÓN: ${new Date().toLocaleString()}
CANAL DE ATENCIÓN: WhatsApp Webhook & Panel SubaTECH
ESTADO DE ATENCIÓN: ${session.state}

1. DATOS GENERALES DEL PACIENTE
-----------------------------------------------------
Nombre Registrado: ${session.userName || 'No especificado'}
Teléfono / Contacto: ${session.phoneNumber}
Fecha Inicio Contacto: ${new Date(session.startedAt).toLocaleString()}
Última Actividad: ${new Date(session.lastActivityAt).toLocaleString()}

2. EVALUACIÓN DE TRIAGE & CLASIFICACIÓN CLÍNICA
-----------------------------------------------------
Nivel de Riesgo Determinado: ${session.riskLevel}
Emoción Predominante (IA): ${session.primaryEmotion || 'Sin clasificar'}
Resumen de Triage: 
${session.triageSummary || 'Sin resumen registrado.'}

Etiquetas Clínicas: ${session.tags?.join(', ') || 'Ninguna'}

3. PROFESIONAL RESPONSABLE SANITARIO
-----------------------------------------------------
Nombre del Profesional: ${doctorName}
Registro Sanitario / Licencia Oficial: ${doctorLicense}
Especialidad: ${doctorSpecialty}
Institución / Centro: ${doctorInstitution}

4. NOTAS CLÍNICAS Y TERAPÉUTICAS
-----------------------------------------------------
${session.clinicalNotes || 'No se registraron notas adicionales en la sesión.'}

5. HISTORIAL DE TRANSCRIPCIÓN RESUMIDA
-----------------------------------------------------
${session.messages
  .map(
    (m) =>
      `[${new Date(m.timestamp).toLocaleTimeString()}] ${
        m.sender === 'user' ? session.userName : m.sender === 'psychologist' ? doctorName : 'Aura (IA SubaTECH)'
      }: ${m.text}`
  )
  .join('\n')}

=====================================================
Documento confidencial sujeto a secreto profesional bajo la Ley 1090 de 2006
y Código Deontológico de la Salud Mental en Colombia.
SubaTECH - Alcaldía Local de Suba & Red de Salud Mental
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Psybot_Informe_${session.userName.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    setIsExportingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);

      // Header Banner Background
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 38, 'F');

      // Accent color bar (SubaTECH Cyan & Green)
      doc.setFillColor(0, 229, 255); // #00E5FF
      doc.rect(0, 38, pageWidth * 0.6, 2, 'F');
      doc.setFillColor(43, 242, 103); // #2BF267
      doc.rect(pageWidth * 0.6, 38, pageWidth * 0.4, 2, 'F');

      // Header Titles
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text('PSYBOT / SUBATECH - SALUD MENTAL', margin, 14);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 229, 255);
      doc.text('INFORME OFICIAL DE ATENCIÓN PSICOLÓGICA Y TRIAGE CLÍNICO', margin, 20);

      doc.setTextColor(148, 163, 184); // slate-400
      doc.text('Subred Integrada de Servicios de Salud Norte • Alcaldía Local de Suba', margin, 26);
      doc.text(`Fecha Emisión: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}`, margin, 32);

      // Risk level badge in header
      const riskColor: [number, number, number] = 
        session.riskLevel === 'CRISIS' ? [255, 54, 70] :
        session.riskLevel === 'ALTO' ? [245, 158, 11] :
        session.riskLevel === 'MODERADO' ? [250, 204, 21] : [43, 242, 103];

      doc.setFillColor(...riskColor);
      doc.roundedRect(pageWidth - margin - 35, 12, 35, 16, 2, 2, 'F');
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('RIESGO CLÍNICO', pageWidth - margin - 17.5, 18, { align: 'center' });
      doc.setFontSize(10);
      doc.text(session.riskLevel, pageWidth - margin - 17.5, 24, { align: 'center' });

      let currentY = 48;

      const checkPageBreak = (neededHeight: number) => {
        if (currentY + neededHeight > pageHeight - 20) {
          doc.addPage();
          currentY = 20;
          // Add header strip on subsequent pages
          doc.setFillColor(15, 23, 42);
          doc.rect(0, 0, pageWidth, 10, 'F');
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(`Psybot / SubaTECH - Expediente ${session.userName} (${session.phoneNumber})`, margin, 7);
          currentY = 18;
        }
      };

      const drawSectionHeader = (title: string) => {
        checkPageBreak(12);
        doc.setFillColor(241, 245, 249); // slate-100
        doc.roundedRect(margin, currentY, contentWidth, 7, 1, 1, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(title, margin + 3, currentY + 5);
        currentY += 10;
      };

      // 1. Patient Data
      drawSectionHeader('1. INFORMACIÓN DEL PACIENTE');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);

      doc.text(`Nombre del Paciente:`, margin + 3, currentY);
      doc.setFont('helvetica', 'bold');
      doc.text(`${session.userName || 'No especificado'}`, margin + 45, currentY);
      currentY += 5;

      doc.setFont('helvetica', 'normal');
      doc.text(`Teléfono / WhatsApp:`, margin + 3, currentY);
      doc.setFont('helvetica', 'bold');
      doc.text(`${session.phoneNumber}`, margin + 45, currentY);
      currentY += 5;

      doc.setFont('helvetica', 'normal');
      doc.text(`Fecha y Hora de Contacto:`, margin + 3, currentY);
      doc.text(`${new Date(session.startedAt).toLocaleString('es-CO')}`, margin + 45, currentY);
      currentY += 5;

      doc.setFont('helvetica', 'normal');
      doc.text(`Estado de la Atención:`, margin + 3, currentY);
      doc.setFont('helvetica', 'bold');
      doc.text(`${session.state}`, margin + 45, currentY);
      currentY += 8;

      // 2. Triage & Clinical Assessment
      drawSectionHeader('2. EVALUACIÓN DE TRIAGE Y CLASIFICACIÓN EMOCIONAL');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);

      doc.text(`Emoción Predominante:`, margin + 3, currentY);
      doc.setFont('helvetica', 'bold');
      doc.text(`${session.primaryEmotion || 'Sin clasificar'}`, margin + 45, currentY);
      currentY += 5;

      if (session.tags && session.tags.length > 0) {
        doc.setFont('helvetica', 'normal');
        doc.text(`Etiquetas Clínicas:`, margin + 3, currentY);
        doc.text(`${session.tags.join(', ')}`, margin + 45, currentY);
        currentY += 5;
      }

      doc.setFont('helvetica', 'normal');
      doc.text(`Resumen de Triage:`, margin + 3, currentY);
      currentY += 4;

      const triageLines = doc.splitTextToSize(session.triageSummary || 'Sin resumen registrado.', contentWidth - 6);
      checkPageBreak(triageLines.length * 4.5 + 4);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(30, 41, 59);
      doc.text(triageLines, margin + 3, currentY);
      currentY += (triageLines.length * 4.5) + 6;

      // 3. Responsible Health Professional
      drawSectionHeader('3. PROFESIONAL RESPONSABLE SANITARIO');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);

      doc.text(`Especialista Asignado:`, margin + 3, currentY);
      doc.setFont('helvetica', 'bold');
      doc.text(`${doctorName}`, margin + 45, currentY);
      currentY += 5;

      doc.setFont('helvetica', 'normal');
      doc.text(`Registro Sanitario / Licencia:`, margin + 3, currentY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(14, 116, 144); // cyan-700
      doc.text(`${doctorLicense}`, margin + 45, currentY);
      currentY += 5;

      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'normal');
      doc.text(`Especialidad Sanitaria:`, margin + 3, currentY);
      doc.text(`${doctorSpecialty}`, margin + 45, currentY);
      currentY += 5;

      doc.text(`Institución Vinculada:`, margin + 3, currentY);
      doc.text(`${doctorInstitution}`, margin + 45, currentY);
      currentY += 8;

      // 4. Clinical Notes
      if (session.clinicalNotes) {
        drawSectionHeader('4. NOTAS Y OBSERVACIONES CLÍNICAS');
        const notesLines = doc.splitTextToSize(session.clinicalNotes, contentWidth - 6);
        checkPageBreak(notesLines.length * 4.5 + 4);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);
        doc.text(notesLines, margin + 3, currentY);
        currentY += (notesLines.length * 4.5) + 6;
      }

      // 5. Message Transcript
      drawSectionHeader('5. TRANSCRIPCIÓN DEL DIÁLOGO CLÍNICO');
      doc.setFontSize(8);
      
      session.messages.forEach((msg) => {
        const senderLabel = msg.sender === 'user' ? `[PACIENTE - ${session.userName}]` :
                            msg.sender === 'psychologist' ? `[PSICÓLOGO - ${doctorName}]` : '[IA AURA]';
        const timeLabel = new Date(msg.timestamp).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
        const linePrefix = `${timeLabel} ${senderLabel}: `;
        
        const fullMsg = `${linePrefix}${msg.text}`;
        const msgLines = doc.splitTextToSize(fullMsg, contentWidth - 6);
        
        checkPageBreak(msgLines.length * 4 + 2);
        
        if (msg.sender === 'psychologist') {
          doc.setTextColor(14, 116, 144);
          doc.setFont('helvetica', 'bold');
        } else if (msg.sender === 'user') {
          doc.setTextColor(30, 41, 59);
          doc.setFont('helvetica', 'normal');
        } else {
          doc.setTextColor(100, 116, 139);
          doc.setFont('helvetica', 'italic');
        }
        
        doc.text(msgLines, margin + 3, currentY);
        currentY += (msgLines.length * 4) + 1.5;
      });

      // Footer / Legal declaration
      checkPageBreak(25);
      currentY += 5;
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 5;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Documento confidencial sujeto a reserva médica y secreto profesional bajo la Ley 1090 de 2006 (Código Deontológico de Psicología en Colombia).', margin, currentY);
      currentY += 4;
      doc.text('Generado por el Sistema Psybot / SubaTECH - Red de Salud Mental y Triage de la Alcaldía Local de Suba.', margin, currentY);

      // Save PDF file
      const cleanName = (session.userName || 'Paciente').replace(/[^a-zA-Z0-9]/g, '_');
      doc.save(`Psybot_Informe_Clinico_${cleanName}_${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Ocurrió un error al generar el PDF. Puedes descargar la versión TXT.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 selection:bg-[#00E5FF] selection:text-slate-950">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header with SubaTECH identity */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850 rounded-t-3xl">
          <div className="flex items-center space-x-3">
            <SubaTechLogo size="sm" showTagline={false} />
            <div className="border-l border-slate-700 pl-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Informe Clínico Sanitario</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#00E5FF]/20 text-[#00E5FF] font-mono">
                  {session.riskLevel}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Paciente: <span className="text-slate-200 font-semibold">{session.userName}</span> ({session.phoneNumber})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Export to PDF Button in Header */}
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#2BF267] text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#00E5FF]/20 hover:opacity-95 transition active:scale-95 cursor-pointer disabled:opacity-50"
              title="Exportar informe clínico oficial a PDF"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">{isExportingPdf ? 'Generando...' : 'Exportar PDF'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs flex items-center gap-1 transition"
              title="Copiar texto del informe"
            >
              {copied ? <Check className="w-4 h-4 text-[#2BF267]" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={handleDownloadTxt}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs flex items-center gap-1 transition"
              title="Descargar archivo TXT plano"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Doctor credentials banner */}
        <div className="px-5 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#FAFF00]" />
            <span>Rubricado por: <strong className="text-white">{doctorName}</strong></span>
          </div>
          <span className="font-mono text-[#00E5FF] font-semibold">{doctorLicense}</span>
        </div>

        {/* Content viewer */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-950 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
          {reportText}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-850 flex items-center justify-between rounded-b-3xl">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#2BF267]" />
            <span>Psybot • SubaTECH • Habilitación sanitaria oficial</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#00E5FF] to-[#2BF267] text-slate-950 hover:opacity-90 flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-[#00E5FF]/20 cursor-pointer disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              <span>{isExportingPdf ? 'Exportando...' : 'Descargar PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

