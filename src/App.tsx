import React, { useState, useEffect, useRef } from 'react';
import { 
  Inbox, 
  MessageSquare, 
  Bot, 
  FileCode2, 
  ShieldAlert, 
  X, 
  User, 
  CheckCircle2, 
  Clock, 
  Phone, 
  Database, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import type { PatientSession, PsychologistProfile, RiskLevel, PsychologistAuthUser } from './types/index.ts';
import { 
  fetchSessions, 
  claimSession, 
  sendPsychologistMessage, 
  transferSession, 
  saveClinicalNotes, 
  closeSession
} from './services/api.ts';
import { Header } from './components/Header.tsx';
import { GeneralQueue } from './components/GeneralQueue.tsx';
import { ActiveChat } from './components/ActiveChat.tsx';
import { AiSupervisor } from './components/AiSupervisor.tsx';
import { IntegrationDocs } from './components/IntegrationDocs.tsx';
import { ClinicalReportModal } from './components/ClinicalReportModal.tsx';
import { ClinicalRecordsView } from './components/ClinicalRecordsView.tsx';
import { PsychologistLogin } from './components/PsychologistLogin.tsx';
import { CreatePsychologistProfile } from './components/CreatePsychologistProfile.tsx';
import { CookieConsentBanner } from './components/CookieConsentBanner.tsx';
import { SubaTechLogo } from './components/SubaTechLogo.tsx';
import { 
  testFirestoreConnection, 
  auth, 
  getStoredPsychologist, 
  getPsychologistFromFirestore,
  logoutPsychologist,
  isUserAdmin,
  createAdminProfile 
} from './lib/firebase.ts';
import { onAuthStateChanged } from 'firebase/auth';

type NavigationTab = 'QUEUE' | 'ACTIVE' | 'SUPERVISOR' | 'RECORDS' | 'INTEGRATION';

export default function App() {
  const [currentUser, setCurrentUser] = useState<PsychologistAuthUser | null>(() => getStoredPsychologist());
  // If user is already in storage, do not show any loading screen
  const [isAuthChecking, setIsAuthChecking] = useState(() => !getStoredPsychologist());
  const [isCompletingProfile, setIsCompletingProfile] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [activeTab, setActiveTab] = useState<NavigationTab>('QUEUE');
  const [sessions, setSessions] = useState<PatientSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [reportModalSession, setReportModalSession] = useState<PatientSession | null>(null);
  const [previewModalSession, setPreviewModalSession] = useState<PatientSession | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navContainerRef = useRef<HTMLElement | null>(null);

  const scrollNav = (direction: 'left' | 'right') => {
    if (navContainerRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      navContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    testFirestoreConnection();

    // Fast safety timeout: never let auth checking block the user for more than 400ms
    const safetyTimer = setTimeout(() => {
      setIsAuthChecking(false);
    }, 400);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(safetyTimer);
      if (firebaseUser) {
        // 1. If administrator (kailabwasd@gmail.com)
        if (isUserAdmin(firebaseUser.email)) {
          const admin = createAdminProfile(
            firebaseUser.email || undefined,
            firebaseUser.displayName || undefined,
            firebaseUser.photoURL || undefined
          );
          setCurrentUser(admin);
          setIsCompletingProfile(false);
          setIsAuthChecking(false);
          return;
        }

        // 2. Try to fetch latest stored profile
        const stored = getStoredPsychologist();
        if (stored && stored.uid === firebaseUser.uid && stored.profileCompleted && stored.license?.trim()) {
          setCurrentUser(stored);
          setIsCompletingProfile(false);
          setIsAuthChecking(false);
          return;
        }

        // 3. Query Firestore with fast timeout
        const remote = await getPsychologistFromFirestore(firebaseUser.uid);
        if (remote && remote.profileCompleted && remote.license?.trim()) {
          localStorage.setItem('psybot_psychologist_session', JSON.stringify(remote));
          setCurrentUser(remote);
          setIsCompletingProfile(false);
        } else {
          // New user without completed registration
          const draft: PsychologistAuthUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(firebaseUser.displayName || firebaseUser.uid)}`,
            provider: firebaseUser.providerData[0]?.providerId || 'google.com',
            role: 'Psicólogo(a) Clínico Titulado(a)',
            license: '',
            specialty: 'Psicología Clínica y Triage de Crisis',
            institution: 'Subred Integrada de Servicios de Salud Norte - Suba',
            phone: '',
            termsAccepted: false,
            profileCompleted: false,
            createdAt: Date.now(),
            lastLoginAt: Date.now(),
          };
          setCurrentUser(draft);
          setIsCompletingProfile(true);
        }
      } else {
        const stored = getStoredPsychologist();
        if (stored && stored.profileCompleted) {
          setCurrentUser(stored);
        } else {
          setCurrentUser(null);
          setIsCompletingProfile(false);
        }
      }
      setIsAuthChecking(false);
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, []);

  // Parse deep-link URL on boot (e.g. ?tab=RECORDS&recordId=CR-525541908231)
  useEffect(() => {
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
    if (!activeSessionId && list.length > 0) {
      const firstHuman = list.find((s) => s.state === 'HUMAN_MODE');
      if (firstHuman) {
        setActiveSessionId(firstHuman.id);
      }
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.profileCompleted) {
      loadSessions().then(() => setIsLoading(false));
      const interval = setInterval(loadSessions, 3000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Logout handler
  const handleLogout = async () => {
    await logoutPsychologist();
    setCurrentUser(null);
    setIsCompletingProfile(false);
    setIsEditingProfile(false);
  };

  // Build currentSpecialist object from authenticated user
  const currentSpecialist: PsychologistProfile = currentUser ? {
    id: currentUser.uid,
    name: currentUser.displayName,
    role: currentUser.role,
    license: currentUser.license,
    avatar: currentUser.photoURL,
    specialty: currentUser.specialty,
    activeCasesCount: sessions.filter(
      (s) => s.state === 'HUMAN_MODE' && (!s.assignedPsychologistId || s.assignedPsychologistId === currentUser.uid || s.assignedPsychologistName === currentUser.displayName)
    ).length,
  } : {
    id: 'anonymous',
    name: 'Psicólogo de Guardia',
    role: 'Psicólogo Clínico',
    license: 'Sin Registro',
    avatar: 'https://images.unsplash.com/photo-1594824813576-a05e263d9061?w=150&auto=format&fit=crop&q=80',
    specialty: 'Triage de Crisis',
    activeCasesCount: 0,
  };

  // Handlers
  const handleClaim = async (session: PatientSession) => {
    if (!currentUser) return;
    try {
      const updated = await claimSession(session.id, currentUser.uid, currentUser.displayName);
      setSessions((prev) => prev.map((s) => (s.id === session.id ? updated : s)));
      setActiveSessionId(session.id);
      setActiveTab('ACTIVE');
    } catch (e) {
      console.error('Error claiming session:', e);
    }
  };

  const handleSendMessage = async (sessionId: string, text: string) => {
    if (!currentUser) return;
    try {
      const updated = await sendPsychologistMessage(sessionId, text, currentUser.displayName);
      setSessions((prev) => prev.map((s) => (s.id === sessionId ? updated : s)));
    } catch (e) {
      console.error('Error sending message:', e);
    }
  };

  const handleTransfer = async (sessionId: string, target: 'AI_MODE' | 'WAITING_PSYCHOLOGIST') => {
    try {
      const updated = await transferSession(sessionId, target);
      setSessions((prev) => prev.map((s) => (s.id === sessionId ? updated : s)));
      if (sessionId === activeSessionId && target === 'AI_MODE') {
        const next = sessions.find((s) => s.id !== sessionId && s.state === 'HUMAN_MODE');
        setActiveSessionId(next ? next.id : null);
      }
    } catch (e) {
      console.error('Error transferring session:', e);
    }
  };

  const handleSaveNotes = async (
    sessionId: string,
    data: {
      clinicalNotes?: string;
      tags?: string[];
      riskLevel?: RiskLevel;
      diagnosticImpressions?: string[];
    }
  ) => {
    try {
      const updated = await saveClinicalNotes(sessionId, data);
      setSessions((prev) => prev.map((s) => (s.id === sessionId ? updated : s)));
    } catch (e) {
      console.error('Error saving notes:', e);
    }
  };

  const handleCloseSession = async (sessionId: string, resolutionNotes: string) => {
    try {
      const updated = await closeSession(sessionId, resolutionNotes);
      setSessions((prev) => prev.map((s) => (s.id === sessionId ? updated : s)));
      const next = sessions.find((s) => s.id !== sessionId && s.state === 'HUMAN_MODE');
      setActiveSessionId(next ? next.id : null);
    } catch (e) {
      console.error('Error closing session:', e);
    }
  };

  // Counts
  const waitingCount = sessions.filter(
    (s) => s.state === 'WAITING_PSYCHOLOGIST' || s.state === 'CRISIS_ALERT'
  ).length;

  const crisisCount = sessions.filter((s) => s.riskLevel === 'CRISIS').length;

  const myActiveCount = sessions.filter(
    (s) => s.state === 'HUMAN_MODE' && (!s.assignedPsychologistId || s.assignedPsychologistId === currentUser?.uid || s.assignedPsychologistName === currentUser?.displayName)
  ).length;

  const aiCount = sessions.filter((s) => s.state === 'AI_MODE').length;

  // 1. Initial authentication check (only if we don't have a currentUser yet)
  if (isAuthChecking && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center space-y-4">
        <SubaTechLogo size="lg" showTagline={false} />
        <div className="w-8 h-8 border-2 border-[#00E5FF] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Iniciando Psybot...</p>
      </div>
    );
  }

  // 2. Unauthenticated Gate: Show Login
  if (!currentUser) {
    return (
      <>
        <PsychologistLogin
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            if (user.isAdmin || user.email === 'kailabwasd@gmail.com') {
              setIsCompletingProfile(false);
            } else {
              setIsCompletingProfile(!user.profileCompleted || !user.license?.trim());
            }
          }}
          onNeedsProfileCompletion={(draft) => {
            if (draft.isAdmin || draft.email === 'kailabwasd@gmail.com') {
              setCurrentUser(draft);
              setIsCompletingProfile(false);
            } else {
              setCurrentUser(draft);
              setIsCompletingProfile(true);
            }
          }}
        />
        <CookieConsentBanner />
      </>
    );
  }

  // 3. User authenticated but must fill out their Sanitary Registration and Clinical Profile (Admin is exempted with full access)
  const isUserAdminRole = Boolean(currentUser.isAdmin || currentUser.email === 'kailabwasd@gmail.com');
  if (!isUserAdminRole && (isCompletingProfile || !currentUser.profileCompleted || !currentUser.license?.trim())) {
    return (
      <>
        <CreatePsychologistProfile
          initialUser={currentUser}
          onProfileSaved={(saved) => {
            setCurrentUser(saved);
            setIsCompletingProfile(false);
          }}
        />
        <CookieConsentBanner />
      </>
    );
  }

  // 4. Authenticated Clinical Dashboard with Bogota.gov.co Style
  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex flex-col font-sans selection:bg-[#FFC800] selection:text-[#0B2545]">
      
      {/* 1. Global Header (GOV.CO + Alcaldía Mayor de Bogotá D.C.) */}
      <Header
        currentUser={currentUser}
        onEditProfile={() => setIsEditingProfile(true)}
        waitingCount={waitingCount}
        crisisCount={crisisCount}
        activeCount={myActiveCount}
        onLogout={handleLogout}
      />

      {/* 2. Primary Navigation Tabs (Portal Institucional Bogotá.gov.co) */}
      <div className="bg-[#0B2545] text-white shadow-md relative group">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative flex items-center">
          {/* Left scroll navigation arrow */}
          <button
            onClick={() => scrollNav('left')}
            className="hidden sm:flex shrink-0 mr-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition active:scale-95 z-10"
            title="Desplazar hacia la izquierda"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <nav 
            ref={navContainerRef as any}
            className="flex-1 flex space-x-1 sm:space-x-2 pt-2 overflow-x-auto nav-scrollbar text-xs sm:text-sm font-semibold scroll-smooth"
          >
            
            {/* Bandeja General */}
            <button
              onClick={() => setActiveTab('QUEUE')}
              className={`px-4 py-2.5 rounded-t-lg transition flex items-center gap-2 whitespace-nowrap shrink-0 border-t-2 ${
                activeTab === 'QUEUE'
                  ? 'bg-[#F4F6F9] text-[#0B2545] font-bold border-t-[#FFC800] shadow-sm'
                  : 'text-slate-200 hover:text-white hover:bg-white/10 border-t-transparent'
              }`}
            >
              <Inbox className="w-4 h-4 text-[#C8102E]" />
              <span>Guardia Triage Pacientes</span>
              {waitingCount > 0 && (
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold font-mono ${
                  crisisCount > 0 ? 'bg-[#C8102E] text-white animate-pulse' : 'bg-[#FFC800] text-[#0B2545]'
                }`}>
                  {waitingCount}
                </span>
              )}
            </button>

            {/* Mis Casos Activos */}
            <button
              onClick={() => setActiveTab('ACTIVE')}
              className={`px-4 py-2.5 rounded-t-lg transition flex items-center gap-2 whitespace-nowrap shrink-0 border-t-2 ${
                activeTab === 'ACTIVE'
                  ? 'bg-[#F4F6F9] text-[#0B2545] font-bold border-t-[#FFC800] shadow-sm'
                  : 'text-slate-200 hover:text-white hover:bg-white/10 border-t-transparent'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Mis Pacientes en Atención</span>
              {myActiveCount > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold font-mono bg-emerald-100 text-emerald-800">
                  {myActiveCount}
                </span>
              )}
            </button>

            {/* Historial Clínico Firebase */}
            <button
              onClick={() => setActiveTab('RECORDS')}
              className={`px-4 py-2.5 rounded-t-lg transition flex items-center gap-2 whitespace-nowrap shrink-0 border-t-2 ${
                activeTab === 'RECORDS'
                  ? 'bg-[#F4F6F9] text-[#0B2545] font-bold border-t-[#FFC800] shadow-sm'
                  : 'text-slate-200 hover:text-white hover:bg-white/10 border-t-transparent'
              }`}
            >
              <Database className="w-4 h-4 text-blue-400" />
              <span>Historias Clínicas Digitales</span>
            </button>

            {/* Monitor IA */}
            <button
              onClick={() => setActiveTab('SUPERVISOR')}
              className={`px-4 py-2.5 rounded-t-lg transition flex items-center gap-2 whitespace-nowrap shrink-0 border-t-2 ${
                activeTab === 'SUPERVISOR'
                  ? 'bg-[#F4F6F9] text-[#0B2545] font-bold border-t-[#FFC800] shadow-sm'
                  : 'text-slate-200 hover:text-white hover:bg-white/10 border-t-transparent'
              }`}
            >
              <Bot className="w-4 h-4 text-purple-400" />
              <span>Supervisor Clínico IA</span>
              {aiCount > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-purple-100 text-purple-900">
                  {aiCount}
                </span>
              )}
            </button>

            {/* Documentación de Integración Twilio */}
            <button
              data-tab="INTEGRATION"
              onClick={() => setActiveTab('INTEGRATION')}
              className={`px-4 py-2.5 rounded-t-lg transition flex items-center gap-2 whitespace-nowrap shrink-0 border-t-2 ${
                activeTab === 'INTEGRATION'
                  ? 'bg-[#F4F6F9] text-[#0B2545] font-bold border-t-[#FFC800] shadow-sm'
                  : 'text-slate-200 hover:text-white hover:bg-white/10 border-t-transparent'
              }`}
            >
              <FileCode2 className="w-4 h-4 text-amber-300" />
              <span>Conexión Twilio & WhatsApp</span>
            </button>
          </nav>

          {/* Right scroll navigation arrow */}
          <button
            onClick={() => scrollNav('right')}
            className="hidden sm:flex shrink-0 ml-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition active:scale-95 z-10"
            title="Desplazar hacia la derecha"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        {/* Franja Bandera de Bogotá D.C. (Amarillo y Rojo) */}
        <div className="bogota-flag-ribbon w-full"></div>
      </div>

      {/* 3. Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* TAB 1: Guardia / Cola General */}
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

        {/* TAB 2: Mis Pacientes Activos */}
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

        {/* TAB 3: Historiales Clínicos (Firebase Firestore) */}
        {activeTab === 'RECORDS' && (
          <ClinicalRecordsView
            sessions={sessions}
            initialSelectedRecordId={selectedRecordId}
            onSelectRecord={(recId) => setSelectedRecordId(recId)}
            currentUser={currentUser}
          />
        )}

        {/* TAB 4: Supervisión IA (Gemini) */}
        {activeTab === 'SUPERVISOR' && (
          <AiSupervisor
            sessions={sessions}
            onTakeOver={(session) => {
              handleClaim(session);
            }}
            onPreview={(session) => setPreviewModalSession(session)}
          />
        )}

        {/* TAB 5: Documentación e Integración Twilio */}
        {activeTab === 'INTEGRATION' && (
          <IntegrationDocs />
        )}

      </main>

      {/* Pie de Página Institucional (Alcaldía Mayor de Bogotá D.C. - Secretaría Distrital de Salud) */}
      <footer className="bg-[#0B2545] text-slate-300 text-xs border-t-4 border-[#C8102E] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-700">
            <div>
              <div className="flex items-center gap-2 mb-2 text-white font-bold text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFC800]"></span>
                <span>ALCALDÍA MAYOR DE BOGOTÁ D.C.</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Secretaría Distrital de Salud · Subred Integrada de Servicios de Salud Norte E.S.E.
                <br />Plataforma Distrital de Orientación Psicológica y Triage Clínico (SubaTECH / Psybot).
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8102E]"></span>
                Líneas de Atención en Salud Mental
              </h4>
              <ul className="space-y-1 text-slate-400 text-xs">
                <li>• <strong className="text-slate-200">Línea 106:</strong> Ayuda emocional 24/7 "El poder de ser escuchado"</li>
                <li>• <strong className="text-slate-200">Línea 123:</strong> Número Único de Seguridad y Emergencias Bogotá</li>
                <li>• <strong className="text-slate-200">Línea Púrpura:</strong> 01 8000 112 137 (Atención distrital a mujeres)</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-2">Canales Distritales Oficiales</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Sede Central: Cra 32 #12-81, Bogotá D.C., Colombia
                <br />Conmutador: (601) 364 9090
                <br />Portales:{' '}
                <a 
                  href="https://bogota.gov.co" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[#FFC800] hover:underline font-semibold"
                >
                  bogota.gov.co
                </a>
                {' · '}
                <a 
                  href="https://www.saludcapital.gov.co" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[#FFC800] hover:underline font-semibold"
                >
                  saludcapital.gov.co
                </a>
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-[11px] gap-2">
            <p>© {new Date().getFullYear()} Alcaldía Mayor de Bogotá D.C. Todos los derechos reservados.</p>
            <div className="flex items-center space-x-3">
              <span className="text-slate-400">SubaTECH · Cocreando la Suba del Futuro</span>
              <span>·</span>
              <span className="text-emerald-400 font-mono">Plataforma Segura SSL/TLS</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Profile Editing Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CreatePsychologistProfile
              initialUser={currentUser}
              isEditing={true}
              onCancel={() => setIsEditingProfile(false)}
              onProfileSaved={(updated) => {
                setCurrentUser(updated);
                setIsEditingProfile(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Clinical Report Modal */}
      {reportModalSession && (
        <ClinicalReportModal
          session={reportModalSession}
          currentUser={currentUser}
          onClose={() => setReportModalSession(null)}
        />
      )}

      {/* Preview Case Modal */}
      {previewModalSession && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 text-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#004884] flex items-center justify-center border border-blue-200">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {previewModalSession.userName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {previewModalSession.phoneNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewModalSession(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-600 font-medium">Nivel de Riesgo Clínico:</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                  previewModalSession.riskLevel === 'CRISIS' 
                    ? 'bg-[#C8102E] text-white animate-pulse' 
                    : previewModalSession.riskLevel === 'ALTO'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-blue-100 text-blue-900'
                }`}>
                  {previewModalSession.riskLevel}
                </span>
              </div>

              <div>
                <p className="text-slate-700 mb-1 font-semibold">Resumen de Triage:</p>
                <p className="text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                  {previewModalSession.triageSummary}
                </p>
              </div>

              <div>
                <p className="text-slate-700 mb-1 font-semibold">Último mensaje recibido vía WhatsApp:</p>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 font-mono text-[11px]">
                  {previewModalSession.messages[previewModalSession.messages.length - 1]?.text}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
              <button
                onClick={() => setPreviewModalSession(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  const s = previewModalSession;
                  setPreviewModalSession(null);
                  handleClaim(s);
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-[#004884] text-white hover:bg-[#003866] flex items-center gap-1.5 shadow-sm transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Asignar a Mi Guardia</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
