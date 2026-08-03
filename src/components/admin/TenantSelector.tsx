'use client';

import { useRouter } from 'next/navigation';
import { setAdminTenantCookie } from '@/app/admin/actions';

interface TenantSelectorProps {
  tenants: { id: string; name: string }[];
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

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground hidden md:inline-block">Tenant:</span>
      <div className="relative">
        <select 
          value={currentTenantId} 
          onChange={handleValueChange}
          className="appearance-none w-[200px] h-9 px-4 py-1.5 text-sm font-semibold bg-background/50 border border-border/80 rounded-full shadow-sm hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer"
        >
          <option value="" disabled>Pilih Tenant...</option>
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
