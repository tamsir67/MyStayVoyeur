export interface AirtableStatusData {
  baseId: string;
  hasToken: boolean;
  maskedToken: string | null;
  inviteLink: string;
  syncMode: 'airtable' | 'supabase' | 'local';
  autoSync: boolean;
  lastSyncAt: string | null;
  lastSyncStatus: 'idle' | 'success' | 'error';
  stats: {
    listings: number;
    bookings: number;
    users: number;
    reviews: number;
    messages: number;
  };
  tables: {
    listings: string;
    bookings: string;
    users: string;
    reviews: string;
    messages: string;
  };
}

export interface AirtableLogItem {
  id: string;
  timestamp: string;
  action: 'TEST' | 'PUSH' | 'PULL' | 'AUTO_SYNC' | 'IMPORT';
  status: 'success' | 'error' | 'warning';
  table: string;
  recordsCount?: number;
  durationMs: number;
  details: string;
}

// Fonction utilitaire garantissant qu'une réponse HTML n'explose pas l'application
async function safeFetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const text = await res.text();
    const cleanSample = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);
    throw new Error(
      `Le serveur a renvoyé du contenu non-JSON (${res.status} ${res.statusText}). Réponse: "${cleanSample || 'page HTML'}"`
    );
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || `Erreur serveur (${res.status})`);
  }
  return data as T;
}

// Garantit que toutes les propriétés attendues existent, quelle que soit la source
// (serveur Express ou fonction serverless /api), pour éviter les
// "Cannot read properties of undefined".
function normalizeStatus(raw?: Partial<AirtableStatusData> & { tokenMasked?: string | null }): AirtableStatusData {
  const r = raw || {};
  return {
    baseId: r.baseId || 'appIt4PVIpjgrmhri',
    hasToken: Boolean(r.hasToken),
    maskedToken: r.maskedToken ?? r.tokenMasked ?? null,
    inviteLink: r.inviteLink || '',
    syncMode: r.syncMode || 'airtable',
    autoSync: r.autoSync ?? true,
    lastSyncAt: r.lastSyncAt ?? null,
    lastSyncStatus: r.lastSyncStatus || 'idle',
    stats: {
      listings: r.stats?.listings ?? 0,
      bookings: r.stats?.bookings ?? 0,
      users: r.stats?.users ?? 0,
      reviews: r.stats?.reviews ?? 0,
      messages: r.stats?.messages ?? 0,
    },
    tables: {
      listings: r.tables?.listings || 'Listings',
      bookings: r.tables?.bookings || 'Bookings',
      users: r.tables?.users || 'Users',
      reviews: r.tables?.reviews || 'Reviews',
      messages: r.tables?.messages || 'messages',
    },
  };
}

export const airtableService = {
  async getConfig(): Promise<{ success: boolean; data: AirtableStatusData; logs: AirtableLogItem[] }> {
    const res = await safeFetchJson<{ success: boolean; data?: Partial<AirtableStatusData> & { tokenMasked?: string | null }; logs?: AirtableLogItem[] }>('/api/airtable/config');
    return {
      success: Boolean(res?.success),
      data: normalizeStatus(res?.data),
      logs: Array.isArray(res?.logs) ? res.logs : []
    };
  },

  async updateConfig(payload: {
    baseId?: string;
    token?: string;
    syncMode?: 'airtable' | 'supabase' | 'local';
    autoSync?: boolean;
    tables?: Record<string, string>;
  }): Promise<any> {
    return safeFetchJson('/api/airtable/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  async testConnection(baseId?: string, token?: string): Promise<{
    success: boolean;
    message: string;
    accessibleTables: string[];
    missingTables: string[];
    statusCode?: number;
    details?: any;
  }> {
    return safeFetchJson('/api/airtable/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseId, token })
    });
  },

  async syncPush(): Promise<{
    success: boolean;
    message: string;
    syncedCounts: { listings: number; bookings: number; users: number; reviews: number; messages: number };
    errors: string[];
  }> {
    return safeFetchJson('/api/airtable/sync-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  async syncPull(): Promise<{
    success: boolean;
    message: string;
    importedCounts: { listings: number; bookings: number; users: number; reviews: number; messages: number };
    errors: string[];
  }> {
    return safeFetchJson('/api/airtable/sync-pull', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
  },

  getExportCsvUrl(table: 'listings' | 'bookings' | 'users' | 'reviews' | 'messages'): string {
    return `/api/airtable/export-csv/${table}`;
  },

  async importData(table: string, records: any[]): Promise<any> {
    return safeFetchJson('/api/airtable/import-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, records })
    });
  }
};
