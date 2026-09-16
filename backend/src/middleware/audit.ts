import { AuditLog, UserRole } from '../../../shared';

export class AuditLogStore {
  private static logs: AuditLog[] = [
    {
      id: 'AUDIT-INIT-001',
      timestamp: '2026-09-15T06:00:00Z',
      user: 'System Bootstrapper',
      role: 'ADMIN',
      action: 'SYSTEM_INITIALIZATION',
      entity: 'Platform Core',
      oldValue: 'OFFLINE',
      newValue: 'ONLINE',
      notes: 'VajraShield Enterprise Command Platform activated. Sensor telemetry feeds synchronized.'
    },
    {
      id: 'AUDIT-INIT-002',
      timestamp: '2026-09-15T06:20:00Z',
      user: 'VajraWatch Engine',
      role: 'ANALYST',
      action: 'RISK_RECOMPUTATION',
      entity: 'DisasterEvent DIS-2026-UK-082',
      oldValue: 'Score 18.2 (NORMAL)',
      newValue: 'Score 58.4 (ELEVATED)',
      notes: 'Precipitation surge and hydro gauge crest triggered automated severity upgrade.'
    }
  ];

  public static record(user: string, role: UserRole, action: string, entity: string, oldValue: string, newValue: string, notes?: string): AuditLog {
    const entry: AuditLog = {
      id: `AUDIT-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      user,
      role,
      action,
      entity,
      oldValue,
      newValue,
      notes
    };
    this.logs.unshift(entry);
    return entry;
  }

  public static getAll(): AuditLog[] {
    return this.logs;
  }
}
