import type { PatientSession, RiskLevel } from '../types/index.ts';

export async function fetchSessions(): Promise<PatientSession[]> {
  try {
    const res = await fetch('/api/sessions', {
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch sessions`);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      // Server returned HTML (e.g. while booting or during dev server proxy transition)
      return [];
    }
    const data = await res.json();
    return data.sessions || [];
  } catch (err) {
    console.warn('Waiting for backend sessions endpoint...', err);
    return [];
  }
}

export async function sendWhatsAppWebhookMessage(
  fromNumber: string,
  bodyText: string,
  profileName?: string
): Promise<{ success: boolean; reply: string; session: PatientSession; quickReplies?: string[] }> {
  const res = await fetch('/api/whatsapp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      from: fromNumber,
      body: bodyText,
      profileName,
      isSimulator: true,
    }),
  });
  if (!res.ok) throw new Error('Failed to send webhook message');
  return res.json();
}

export async function claimSession(
  sessionId: string,
  psychologistId: string,
  psychologistName: string
): Promise<PatientSession> {
  const res = await fetch('/api/sessions/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, psychologistId, psychologistName }),
  });
  if (!res.ok) throw new Error('Failed to claim session');
  const data = await res.json();
  return data.session;
}

export async function sendPsychologistMessage(
  sessionId: string,
  text: string,
  psychologistName: string
): Promise<PatientSession> {
  const res = await fetch('/api/sessions/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, text, psychologistName }),
  });
  if (!res.ok) throw new Error('Failed to send psychologist message');
  const data = await res.json();
  return data.session;
}

export async function transferSession(
  sessionId: string,
  target: 'AI_MODE' | 'WAITING_PSYCHOLOGIST'
): Promise<PatientSession> {
  const res = await fetch('/api/sessions/transfer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, target }),
  });
  if (!res.ok) throw new Error('Failed to transfer session');
  const data = await res.json();
  return data.session;
}

export async function saveClinicalNotes(
  sessionId: string,
  data: {
    clinicalNotes?: string;
    tags?: string[];
    riskLevel?: RiskLevel;
    diagnosticImpressions?: string[];
  }
): Promise<PatientSession> {
  const res = await fetch('/api/sessions/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, ...data }),
  });
  if (!res.ok) throw new Error('Failed to save clinical notes');
  const result = await res.json();
  return result.session;
}

export async function closeSession(
  sessionId: string,
  resolutionNotes: string
): Promise<PatientSession> {
  const res = await fetch('/api/sessions/close', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, resolutionNotes }),
  });
  if (!res.ok) throw new Error('Failed to close session');
  const data = await res.json();
  return data.session;
}

export async function simulateScenario(scenarioType: 'CRISIS' | 'PANIC' | 'ANXIETY'): Promise<PatientSession> {
  const res = await fetch('/api/simulate/scenario', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenarioType }),
  });
  if (!res.ok) throw new Error('Failed to simulate scenario');
  const data = await res.json();
  return data.session;
}

export async function resetSimulation(): Promise<void> {
  const res = await fetch('/api/simulate/reset', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset simulation');
}

export async function checkHealth(): Promise<{ status: string; geminiConfigured: boolean; sessionsCount: number }> {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}
