'use client';

import { useRouter } from 'next/navigation';
import { setAdminTenantCookie } from '@/app/admin/actions';

interface TenantSelectorProps {
  tenants: { id: string; name: string; theme_config?: any }[];
  currentTenantId: string;
}

export function TenantSelector({ tenants, currentTenantId }: TenantSelectorProps) {
  const router = useRouter();

  const handleValueChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTenantId = e.target.value;
    if (newTenantId !== currentTenantId) {
      await setAdminTenantCookie(newTenantId);
      router.refresh();
    }
  };

  if (!tenants || tenants.length === 0) return null;

  const activeTenant = tenants.find((t) => t.id === currentTenantId);
  const rawLang = activeTenant?.theme_config?.language || 'id';
  const rawCurr = activeTenant?.theme_config?.currency || (rawLang === 'ms' ? 'MYR' : 'IDR');
  const isMalaysia = rawCurr === 'MYR' || rawLang === 'ms';
  const activeFlag = isMalaysia ? '🇲🇾' : '🇮🇩';
  const activeCurrencyLabel = isMalaysia ? 'MYR (RM)' : 'IDR (Rp)';

  return (
    <div className="flex items-center gap-2.5">
      <span className="text-sm font-medium text-muted-foreground hidden md:inline-block">Tenant:</span>
      <div className="relative">
        <select 
          value={currentTenantId} 
          onChange={handleValueChange}
          className="appearance-none w-[190px] md:w-[210px] h-9 pl-3.5 pr-8 py-1.5 text-sm font-semibold bg-background/50 border border-border/80 rounded-full shadow-sm hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer"
        >
          <option value="" disabled>Pilih Tenant...</option>
          {tenants.map((t) => {
            const tLang = t.theme_config?.language || 'id';
            const tCurr = t.theme_config?.currency || (tLang === 'ms' ? 'MYR' : 'IDR');
            const tFlag = tCurr === 'MYR' || tLang === 'ms' ? '🇲🇾' : '🇮🇩';
            return (
              <option key={t.id} value={t.id}>
                {tFlag} {t.name}
              </option>
            );
          })}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Active Currency & Flag Representative Badge */}
      {activeTenant && (
        <div 
          title={`Active Store Currency: ${activeCurrencyLabel}`}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs transition-all ${
            isMalaysia 
              ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' 
              : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
          }`}
        >
          <span className="text-sm leading-none">{activeFlag}</span>
          <span className="font-bold">{activeCurrencyLabel}</span>
        </div>
      )}
    </div>
  );
}
