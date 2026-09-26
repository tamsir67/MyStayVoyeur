/**
 * Robust LocalStorage helper with QuotaExceededError protection and automatic memory compaction.
 * Prevents "Failed to execute 'setItem' on 'Storage': Setting the value exceeded the quota" crashes.
 */
export const safeStorage = {
  setItem(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (err: any) {
      console.warn(`[SafeStorage] Attention : quota de stockage navigateur dépassé pour '${key}'. Nettoyage préventif en cours...`, err);

      try {
        // Step 1: Evict transient non-critical caches
        localStorage.removeItem('mystay_audit_logs');
        localStorage.removeItem('mystay_make_executions');
        localStorage.removeItem('mystay_messages');
        localStorage.removeItem('mystay_email_auth_receipts');
        
        // Retry saving original value
        localStorage.setItem(key, value);
        return true;
      } catch (retryErr) {
        // Step 2: If still full and trying to save listings, strip huge base64 data URLs from localStorage copy
        if (key === 'mystay_listings') {
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
              const sanitized = parsed.map((item: any) => {
                const cleanedImages = Array.isArray(item.images)
                  ? item.images.map((img: string) => {
                      if (typeof img === 'string' && img.startsWith('data:') && img.length > 500) {
                        // Replace huge base64 with a stable lightweight placeholder for localStorage
                        return 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80';
                      }
                      return img;
                    })
                  : ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'];

                return {
                  ...item,
                  images: cleanedImages,
                  siteImageUrl: typeof item.siteImageUrl === 'string' && item.siteImageUrl.startsWith('data:') && item.siteImageUrl.length > 500
                    ? cleanedImages[0]
                    : item.siteImageUrl
                };
              });

              localStorage.setItem(key, JSON.stringify(sanitized));
              return true;
            }
          } catch (sanitizeErr) {
            console.warn('[SafeStorage] Impossible d\'enregistrer même après assainissement:', sanitizeErr);
          }
        }

        // Return false without crashing the application
        return false;
      }
    }
  },

  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
};
