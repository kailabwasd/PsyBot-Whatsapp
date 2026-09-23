import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  MessageSquare, 
  Bot, 
  Smartphone, 
  FileCode2, 
  HeartHandshake, 
  ShieldAlert, 
  X,
  User,
  CheckCircle2,
  Clock,
  Phone
} from 'lucide-react';
import type { PatientSession, PsychologistProfile, RiskLevel } from './types/index.ts';
import { 
  fetchSessions, 
  claimSession, 
  sendPsychologistMessage, 
  transferSession, 
  saveClinicalNotes, 
  closeSession, 
  simulateScenario, 
  resetSimulation,
  sendWhatsAppWebhookMessage
} from './services/api.ts';
import { Header, PSYCHOLOGISTS } from './components/Header.tsx';
import { GeneralQueue } from './components/GeneralQueue.tsx';
import { ActiveChat } from './components/ActiveChat.tsx';
import { AiSupervisor } from './components/AiSupervisor.tsx';
import { WhatsAppSimulator } from './components/WhatsAppSimulator.tsx';
import { IntegrationDocs } from './components/IntegrationDocs.tsx';
import { ClinicalReportModal } from './components/ClinicalReportModal.tsx';
import { ClinicalRecordsView } from './components/ClinicalRecordsView.tsx';
import { Database, FileSpreadsheet } from 'lucide-react';
import { testFirestoreConnection } from './lib/firebase.ts';

type NavigationTab = 'QUEUE' | 'ACTIVE' | 'SUPERVISOR' | 'RECORDS' | 'SIMULATOR' | 'INTEGRATION';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('QUEUE');
  const [sessions, setSessions] = useState<PatientSession[]>([]);
  const [currentSpecialist, setCurrentSpecialist] = useState<PsychologistProfile>(PSYCHOLOGISTS[0]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeSimulatorPhone, setActiveSimulatorPhone] = useState<string>('');
  const [reportModalSession, setReportModalSession] = useState<PatientSession | null>(null);
  const [previewModalSession, setPreviewModalSession] = useState<PatientSession | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Parse deep-link URL on boot (e.g. ?tab=RECORDS&recordId=CR-525541908231)
  useEffect(() => {
    testFirestoreConnection();
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const recordParam = params.get('recordId');

      if (tabParam === 'RECORDS' || recordParam) {
        setActiveTab('RECORDS');
        if (recordParam) {
          setSelectedRecordId(recordParam);
        }
      }
    } catch (e) {
      console.error('Error parsing URL params:', e);
    }
  }, []);

  // Sync sessions from backend periodically
  const loadSessions = async () => {
    const list = await fetchSessions();
    setSessions(list);
    if (!activeSimulatorPhone && list.length > 0) {
      setActiveSimulatorPhone(list[0].id);
    }
  };

  useEffect(() => {
    loadSessions().then(() => setIsLoading(false));
    const interval = setInterval(loadSessions, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleClaim = async (session: PatientSession) => {
    try {
      const updated = await claimSession(session.id, currentSpecialist.id, currentSpecialist.name);
      await loadSessions();
      setActiveSessionId(updated.id);
      setActiveTab('ACTIVE');
    } catch (err) {
      console.error('Error claiming case:', err);
    }
  };

  const handleSendMessage = async (sessionId: string, text: string) => {
    try {
      await sendPsychologistMessage(sessionId, text, currentSpecialist.name);
      await loadSessions();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleTransfer = async (sessionId: string, target: 'AI_MODE' | 'WAITING_PSYCHOLOGIST') => {
    try {
      await transferSession(sessionId, target);
      await loadSessions();
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
      }
    } catch (err) {
      console.error('Error transferring session:', err);
    }
  };

  const handleSaveNotes = async (sessionId: string, data: { clinicalNotes?: string; tags?: string[]; riskLevel?: RiskLevel; diagnosticImpressions?: string[] }) => {
    try {
      await saveClinicalNotes(sessionId, data);
      await loadSessions();
    } catch (err) {
      console.error('Error saving notes:', err);
    }
  };

  const handleCloseSession = async (sessionId: string, resolutionNotes: string) => {
    try {
      await closeSession(sessionId, resolutionNotes);
      await loadSessions();
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
      }
    } catch (err) {
      console.error('Error closing session:', err);
    }
  };

  const handleSimulateUserMessage = async (phone: string, text: string, userName?: string) => {
    try {
      await sendWhatsAppWebhookMessage(phone, text, userName);
      await loadSessions();
    } catch (err) {
      console.error('Error simulating user message:', err);
    }
  };

  const handleNewSimulatedUser = () => {
    const randomPhone = `whatsapp:+5255${Math.floor(10000000 + Math.random() * 90000000)}`;
    setActiveSimulatorPhone(randomPhone);
    sendWhatsAppWebhookMessage(randomPhone, 'Hola', 'Nuevo Usuario').then(loadSessions);
  };

  const handleSimulateScenario = async (type: 'CRISIS' | 'PANIC' | 'ANXIETY') => {
    try {
      const created = await simulateScenario(type);
      await loadSessions();
      setActiveSimulatorPhone(created.id);
      setActiveTab('QUEUE');
    } catch (err) {
      console.error('Error simulating scenario:', err);
    }
  };

  const handleReset = async () => {
    if (window.confirm('¿Deseas reiniciar los datos de prueba a su estado inicial?')) {
      await resetSimulation();
      await loadSessions();
    }
  };

  // Counts
  const waitingCount = sessions.filter(
    (s) => s.state === 'WAITING_PSYCHOLOGIST' || s.state === 'CRISIS_ALERT'
  ).length;

  const crisisCount = sessions.filter((s) => s.riskLevel === 'CRISIS').length;

  const myActiveCount = sessions.filter(
    (s) => s.state === 'HUMAN_MODE' && (!s.assignedPsychologistId || s.assignedPsychologistId === currentSpecialist.id)
  ).length;

  const aiCount = sessions.filter((s) => s.state === 'AI_MODE').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* 1. Global Header */}
      <Header
        currentSpecialist={currentSpecialist}
        onSelectSpecialist={setCurrentSpecialist}
        waitingCount={waitingCount}
        crisisCount={crisisCount}
        activeCount={myActiveCount}
        onSimulateScenario={handleSimulateScenario}
        onReset={handleReset}
      />

      {/* 2. Primary Navigation Tabs */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-4 py-2 overflow-x-auto scrollbar-none text-xs sm:text-sm font-semibold">
            
            {/* Bandeja General */}
            <button
              onClick={() => setActiveTab('QUEUE')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'QUEUE'
                  ? 'bg-slate-800 text-teal-300 shadow-md border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>Guardia Pacientes Reales</span>
              {waitingCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono ${
                  crisisCount > 0 ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {waitingCount}
                </span>
              )}
            </button>

            {/* Mis Casos Activos */}
            <button
              onClick={() => setActiveTab('ACTIVE')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'ACTIVE'
                  ? 'bg-slate-800 text-emerald-300 shadow-md border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Mis Pacientes Activos</span>
              {myActiveCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono bg-emerald-500/20 text-emerald-300">
                  {myActiveCount}
                </span>
              )}
            </button>

            {/* Historial Clínico Firebase */}
            <button
              onClick={() => setActiveTab('RECORDS')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'RECORDS'
                  ? 'bg-slate-800 text-teal-300 shadow-md border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Historiales Clínicos (Firebase)</span>
            </button>

            {/* Monitor IA */}
            <button
              onClick={() => setActiveTab('SUPERVISOR')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'SUPERVISOR'
                  ? 'bg-slate-800 text-cyan-300 shadow-md border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>Supervisión IA</span>
              {aiCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-cyan-500/20 text-cyan-300">
                  {aiCount}
                </span>
              )}
            </button>

            {/* Simulador WhatsApp */}
            <button
              onClick={() => setActiveTab('SIMULATOR')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'SIMULATOR'
                  ? 'bg-slate-800 text-teal-300 shadow-md border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Simulador Móvil WhatsApp</span>
            </button>

            {/* Integración & Arquitectura */}
            <button
              data-tab="INTEGRATION"
              onClick={() => setActiveTab('INTEGRATION')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'INTEGRATION'
                  ? 'bg-slate-800 text-teal-300 shadow-md border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <FileCode2 className="w-4 h-4" />
              <span>Integración & Backend</span>
            </button>

          </nav>
        </div>
      </div>

      {/* 3. Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-96 space-y-3">
            <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400">Conectando con la plataforma clínica MindBridge...</p>
          </div>
        ) : (
          <>
            {activeTab === 'QUEUE' && (
              <GeneralQueue
                sessions={sessions}
                onClaim={handleClaim}
                onPreview={(session) => setPreviewModalSession(session)}
                onOpenRecord={(recordId) => {
                  setSelectedRecordId(recordId);
                  setActiveTab('RECORDS');
                }}
              />
            )}

            {activeTab === 'ACTIVE' && (
              <ActiveChat
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSelectSession={(id) => setActiveSessionId(id)}
                currentSpecialist={currentSpecialist}
                onSendMessage={handleSendMessage}
                onTransfer={handleTransfer}
                onSaveNotes={handleSaveNotes}
                onCloseSession={handleCloseSession}
                onOpenReportModal={(session) => setReportModalSession(session)}
                onNavigateToRecord={(recordId) => {
                  setSelectedRecordId(recordId);
                  setActiveTab('RECORDS');
                }}
              />
            )}

            {activeTab === 'RECORDS' && (
              <ClinicalRecordsView
                sessions={sessions}
                initialSelectedRecordId={selectedRecordId}
                onSelectRecord={(id) => setSelectedRecordId(id)}
              />
            )}

            {activeTab === 'SUPERVISOR' && (
              <AiSupervisor
                sessions={sessions}
                onTakeOver={handleClaim}
                onPreview={(session) => setPreviewModalSession(session)}
              />
            )}

            {activeTab === 'SIMULATOR' && (
              <WhatsAppSimulator
                sessions={sessions}
                activePhone={activeSimulatorPhone}
                onSelectPhone={setActiveSimulatorPhone}
                onSendMessage={handleSimulateUserMessage}
                onNewUser={handleNewSimulatedUser}
              />
            )}

            {activeTab === 'INTEGRATION' && <IntegrationDocs />}
          </>
        )}

      </main>

      {/* 4. Preview Chat Modal (Inspection before claim) */}
      {previewModalSession && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full flex flex-col max-h-[80vh] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Historial: {previewModalSession.userName || 'Paciente'}</span>
                  <span className="text-xs text-slate-400 font-mono">({previewModalSession.phoneNumber})</span>
                </h3>
                <p className="text-[11px] text-teal-400">
                  Estado: {previewModalSession.state} | Riesgo: {previewModalSession.riskLevel}
                </p>
              </div>
              <button
                onClick={() => setPreviewModalSession(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-950 text-xs">
              {previewModalSession.messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-3 rounded-xl ${
                    m.sender === 'user'
                      ? 'bg-slate-800 text-white mr-8'
                      : m.sender === 'psychologist'
                      ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-100 ml-8'
                      : 'bg-teal-950/60 border border-teal-500/30 text-teal-200 ml-8'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-bold">
                      {m.sender === 'user' ? previewModalSession.userName : m.sender === 'psychologist' ? 'Psicólogo' : 'Aura (IA)'}
                    </span>
                    <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-850 flex items-center justify-between">
              <button
                onClick={() => setPreviewModalSession(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cerrar
              </button>

              <button
                onClick={() => {
                  const s = previewModalSession;
                  setPreviewModalSession(null);
                  handleClaim(s);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
              >
                Reclamar y Atender Caso
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 5. Clinical Report Modal */}
      {reportModalSession && (
        <ClinicalReportModal
          session={reportModalSession}
          onClose={() => setReportModalSession(null)}
        />
      )}

    </div>
  );
}
