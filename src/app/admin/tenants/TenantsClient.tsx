"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TenantFormModal } from "@/components/admin/TenantFormModal";

interface TenantsClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialTenants: any[];
}

export function TenantsClient({ initialTenants }: TenantsClientProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedTenant, setSelectedTenant] = React.useState<any>(null);

  const handleAddTenant = () => {
    setSelectedTenant(null);
    setIsModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditTenant = (tenant: any) => {
    setSelectedTenant(tenant);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
        <Button onClick={handleAddTenant}>Add Tenant</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Tenants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm text-left">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 font-medium">Name</th>
                  <th className="h-12 px-4 font-medium">Storefront Domain</th>
                  <th className="h-12 px-4 font-medium">Admin Domain</th>
                  <th className="h-12 px-4 font-medium">Created At</th>
                  <th className="h-12 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {initialTenants.map((t) => (
                  <tr key={t.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 font-medium">{t.name}</td>
                    <td className="p-4 font-mono text-xs">{t.domain}</td>
                    <td className="p-4 font-mono text-xs">{t.admin_domain}</td>
                    <td className="p-4 text-xs">{t.created_at ? new Date(t.created_at).toISOString().split('T')[0] : ''}</td>
                    <td className="p-4 text-right">
                       <Button variant="outline" size="sm" onClick={() => handleEditTenant(t)}>Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <TenantFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tenant={selectedTenant}
      />
    </div>
  );
}
