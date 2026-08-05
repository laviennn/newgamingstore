'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Loader2 } from 'lucide-react';
import { saveTenant } from '@/app/admin/(authenticated)/tenants/actions';
import { useNotification } from '@/components/ui/notification';

interface TenantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tenant?: any;
}

export function TenantFormModal({
  isOpen,
  onClose,
  tenant,
}: TenantFormModalProps) {
  const { showNotification, NotificationComponent } = useNotification();
  const [loading, setLoading] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<string>('email');
  const [prevTenant, setPrevTenant] =
    React.useState<TenantFormModalProps['tenant']>(null);

  // Sync authMode state when tenant prop changes
  if (tenant !== prevTenant) {
    setPrevTenant(tenant);
    setAuthMode(tenant?.auth_mode || 'email');
  }

  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await saveTenant(formData, tenant?.id);

    setLoading(false);

    if (result.error) {
      showNotification('error', 'Failed to Save', result.error);
    } else {
      showNotification(
        'success',
        'Success',
        `Tenant successfully ${tenant ? 'updated' : 'added'}!`,
      );
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  return (
    <>
      {NotificationComponent}
      {/* Backdrop */}
      <div
        className='fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity'
        onClick={onClose}
      />

      {/* Modal */}
      <div className='fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-xl bg-background p-6 shadow-2xl animate-in zoom-in-95 duration-200 border'>
        <div className='flex items-center justify-between mb-5'>
          <h2 className='text-xl font-bold'>
            {tenant ? 'Edit Tenant' : 'Add New Tenant'}
          </h2>
          <button
            onClick={onClose}
            className='rounded-full p-2 hover:bg-muted transition-colors'>
            <X className='h-4 w-4' />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className='space-y-4'>
          <div className='space-y-2'>
            <label
              htmlFor='name'
              className='text-sm font-medium'>
              Tenant Name
            </label>
            <Input
              id='name'
              name='name'
              placeholder='e.g., Alpha Gaming'
              defaultValue={tenant?.name || ''}
              required
            />
          </div>
          <div className='space-y-2'>
            <label
              htmlFor='domain'
              className='text-sm font-medium'>
              Storefront Domain
            </label>
            <Input
              id='domain'
              name='domain'
              placeholder='e.g., alpha.localhost'
              defaultValue={tenant?.domain || ''}
              required
            />
            <p className='text-xs text-muted-foreground'>
              This domain will be used to route users to this tenant&apos;s
              storefront.
            </p>
          </div>
          <div className='space-y-2'>
            <label
              htmlFor='admin_domain'
              className='text-sm font-medium'>
              Admin Domain
            </label>
            <Input
              id='admin_domain'
              name='admin_domain'
              placeholder='e.g., admin.alpha.localhost'
              defaultValue={tenant?.admin_domain || ''}
              required
            />
            <p className='text-xs text-muted-foreground'>
              This domain will be used for the tenant&apos;s admin dashboard.
            </p>
          </div>
          {/* Auth Mode */}
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Auth Mode</label>
            <div className='grid grid-cols-2 gap-2'>
              <label
                className={`relative flex flex-col gap-1 p-3 rounded-lg border-2 cursor-pointer transition-colors ${authMode === 'email' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <input
                  type='radio'
                  name='auth_mode'
                  value='email'
                  checked={authMode === 'email'}
                  onChange={() => setAuthMode('email')}
                  className='sr-only'
                />
                <span className='text-sm font-semibold'>Email Auth</span>
                <span className='text-xs text-muted-foreground'>
                  Login & Register dengan Email + Password (default)
                </span>
              </label>
              <label
                className={`relative flex flex-col gap-1 p-3 rounded-lg border-2 cursor-pointer transition-colors ${authMode === 'username' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <input
                  type='radio'
                  name='auth_mode'
                  value='username'
                  checked={authMode === 'username'}
                  onChange={() => setAuthMode('username')}
                  className='sr-only'
                />
                <span className='text-sm font-semibold'>Username Auth</span>
                <span className='text-xs text-muted-foreground'>
                  Login via Username + Password. Register hanya melalui BO
                  Admin.
                </span>
              </label>
            </div>
          </div>

          <div className='flex items-center justify-between p-4 border rounded-lg bg-muted/20'>
            <div className='space-y-0.5'>
              <label className='text-sm font-medium'>Maintenance Mode</label>
              <p className='text-xs text-muted-foreground'>
                Aktifkan untuk memblokir akses ke Storefront (menampilkan
                Maintenance Page).
              </p>
            </div>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                name='is_maintenance'
                className='sr-only peer'
                defaultChecked={tenant?.is_maintenance || false}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className='mt-6 flex justify-end gap-3'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              disabled={loading}>
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={loading}
              className='min-w-[120px]'>
              {loading ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                'Save Tenant'
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
