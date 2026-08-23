'use client';

import { useRouter } from 'next/navigation';
import { setAdminTenantCookie } from '@/app/admin/actions';

interface TenantSelectorProps {
  tenants: { id: string; name: string; theme_config?: any }[];
  currentTenantId: string;
}

function getTenantCurrencyInfo(themeConfig: any) {
  const isMulti = !!themeConfig?.multi_currency_enabled;
  const rawLang = themeConfig?.language || 'id';
  const rawCurr = themeConfig?.currency || (rawLang === 'ms' ? 'MYR' : 'IDR');
  const supported: string[] = Array.isArray(themeConfig?.supported_currencies) && themeConfig.supported_currencies.length > 0
    ? themeConfig.supported_currencies
    : [rawCurr];

  const flagMap: Record<string, string> = {
    IDR: '🇮🇩',
    MYR: '🇲🇾',
    SGD: '🇸🇬',
  };

  if (isMulti && supported.length > 1) {
    const flags = supported.map((c) => flagMap[c] || '🌐').join('');
    const labels = supported.join(' • ');
    return {
      isMulti: true,
      flags,
      label: labels,
      badgeClass: 'bg-primary/10 text-primary border-primary/30',
    };
  }

  const singleCurr = supported[0] || rawCurr;
  const isMalaysia = singleCurr === 'MYR' || rawLang === 'ms';
  const isSingapore = singleCurr === 'SGD';
  const flag = flagMap[singleCurr] || (isMalaysia ? '🇲🇾' : isSingapore ? '🇸🇬' : '🇮🇩');
  const label = singleCurr === 'MYR' ? 'MYR (RM)' : singleCurr === 'SGD' ? 'SGD (S$)' : 'IDR (Rp)';

  return {
    isMulti: false,
    flags: flag,
    label,
    badgeClass: isMalaysia 
      ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' 
      : isSingapore
        ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  };
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
  const activeInfo = activeTenant ? getTenantCurrencyInfo(activeTenant.theme_config) : null;

  return (
    <div className="flex items-center gap-2.5">
      <span className="text-sm font-medium text-muted-foreground hidden md:inline-block">Tenant:</span>
      <div className="relative">
        <select 
          value={currentTenantId} 
          onChange={handleValueChange}
          className="appearance-none w-[200px] md:w-[230px] h-9 pl-3.5 pr-8 py-1.5 text-sm font-semibold bg-background/50 border border-border/80 rounded-full shadow-sm hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer"
        >
          <option value="" disabled>Pilih Tenant...</option>
          {tenants.map((t) => {
            const info = getTenantCurrencyInfo(t.theme_config);
            return (
              <option key={t.id} value={t.id}>
                {info.flags} {t.name} {info.isMulti ? `(${info.label})` : ''}
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
      {activeInfo && (
        <div 
          title={`Active Store Currency: ${activeInfo.label}`}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs transition-all ${activeInfo.badgeClass}`}
        >
          <span className="text-sm leading-none tracking-tight">{activeInfo.flags}</span>
          <span className="font-bold">{activeInfo.label}</span>
        </div>
      )}
    </div>
  );
}
