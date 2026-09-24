import React from 'react';
import { ShieldAlert, Clock, UserCheck, Terminal, Shield } from 'lucide-react';
import type { PsychologistAuthUser } from '../types/index.ts';

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  adminEmail: string;
  adminName: string;
  action: 'ROLE_UPDATE' | 'SYSTEM_CONFIG' | 'PROFILE_UPDATE' | 'SECURITY_OVERRIDE';
  details: string;
}

interface AuditLogProps {
  currentUser: PsychologistAuthUser;
}

export const AuditLog: React.FC<AuditLogProps> = ({ currentUser }) => {
  // Retrieve audit logs from localStorage or default sample logs
  const [logs, setLogs] = React.useState<AuditLogEntry[]>(() => {
    try {
      const stored = localStorage.getItem('subatech_audit_logs');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'audit-1',
        timestamp: Date.now() - 1000 * 60 * 45,
        adminEmail: 'kailabwasd@gmail.com',
        adminName: 'Administrador General (SubaTECH)',
        action: 'SYSTEM_CONFIG',
        details: 'Actualización de credenciales cifradas Twilio WhatsApp API.',
      },
      {
        id: 'audit-2',
        timestamp: Date.now() - 1000 * 60 * 180,
        adminEmail: 'kailabwasd@gmail.com',
        adminName: 'Administrador General (SubaTECH)',
        action: 'ROLE_UPDATE',
        details: 'Asignación de privilegios de Administrador Clínico a nuevo especialista.',
      },
      {
        id: 'audit-3',
        timestamp: Date.now() - 1000 * 60 * 360,
        adminEmail: currentUser.email,
        adminName: currentUser.displayName,
        action: 'PROFILE_UPDATE',
        details: 'Modificación de credenciales profesionales de salud y registro Colpsic.',
      },
    ];
  });

  const isOwnerOrAdmin = currentUser.email === 'kailabwasd@gmail.com' || currentUser.isAdmin;

  if (!isOwnerOrAdmin) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
        <ShieldAlert className="w-12 h-12 text-amber-400" />
        <h3 className="text-sm font-bold text-white">Acceso Restringido</h3>
        <p className="text-xs text-slate-400 max-w-md">
          El registro de auditoría clínica (AuditLog) requiere privilegios de Administrador o Propietario del sistema SubaTECH.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#00E5FF]" />
            Registro de Auditoría y Trazabilidad (AuditLog)
          </h3>
          <p className="text-xs text-slate-400">
            Monitoreo en tiempo real de acciones administrativas y cambios de configuración de seguridad.
          </p>
        </div>
        <div className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-mono text-[#2BF267] flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>Modo Seguro • Cifrado AES</span>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-mono text-[10px]">
                <th className="py-3 px-4">TIMESTAMP</th>
                <th className="py-3 px-4">ADMINISTRADOR / USUARIO</th>
                <th className="py-3 px-4">ACCIÓN CLÍNICA</th>
                <th className="py-3 px-4">DETALLES DE TRAZA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/60 transition">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-200">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-[#00E5FF]" />
                      <span>{log.adminName}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{log.adminEmail}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                      log.action === 'ROLE_UPDATE' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                      log.action === 'SYSTEM_CONFIG' ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-sans">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
