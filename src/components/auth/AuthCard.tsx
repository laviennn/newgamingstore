'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, X } from 'lucide-react';
import { login, signup, loginWithUsername } from '@/app/actions/auth';
import type { AuthMode } from '@/lib/tenantAuth';

interface AuthCardProps {
  mode: 'login' | 'register';
  authMode?: AuthMode;
  tenantId?: string;
  whatsapp?: string;
}

function buildWhatsappUrl(whatsapp?: string) {
  if (!whatsapp) return null;
  const digits = whatsapp.replace(/[^0-9]/g, '');
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent('Halo Admin, saya ingin mendaftar akun member.')}`;
}

export function AuthCard({
  mode,
  authMode = 'email',
  tenantId,
  whatsapp,
}: AuthCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const isUsernameMode = authMode === 'username' && mode === 'login';
  const waUrl = buildWhatsappUrl(whatsapp);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9+]/g, '');
    setPhone(val);

    if (val.length > 0) {
      if (!/^(08|62|\+62)/.test(val)) {
        setPhoneError('Nomor harus diawali 08, 62, atau +62');
      } else if (val.length < 10 || val.length > 15) {
        setPhoneError('Panjang nomor harus 10-15 digit');
      } else {
        setPhoneError('');
      }
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register' && phoneError) {
      setError('Silakan perbaiki nomor telepon Anda.');
      return;
    }

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      if (isUsernameMode) {
        if (!tenantId) {
          setError('Konfigurasi tenant tidak ditemukan.');
          return;
        }
        const result = await loginWithUsername(formData, tenantId);
        if (result?.error) setError(result.error);
        return;
      }

      const action = mode === 'login' ? login : signup;
      const result = await action(formData);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'>
      <div className='w-full max-w-[1000px] h-[600px] bg-[#121212] rounded-2xl overflow-hidden flex shadow-2xl relative'>
        <div className='hidden md:flex md:w-1/2 relative'>
          <Image
            src='https://assets.newgamingstore.com/login_bg_1778139696.webp'
            alt='NewGamingStore Banner'
            fill
            sizes='(max-width: 768px) 0vw, 500px'
            className='object-cover'
            priority
          />
          <div className='absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/40 to-transparent' />
          <div className='absolute bottom-10 left-10 right-10'>
            <h1 className='text-white text-5xl font-black mb-2 tracking-tight'>
              NewGamingStore
            </h1>
            <p className='text-gray-300 text-sm'>
              NEWGAMINGSTORE | Platform Top Up Game & Voucher Terpercaya
            </p>
          </div>
        </div>

        <div className='w-full md:w-1/2 p-8 md:p-12 relative flex flex-col justify-center overflow-y-auto'>
          <button
            onClick={() => router.push('/')}
            className='absolute top-6 right-6 text-gray-400 hover:text-white transition-colors'>
            <X className='w-6 h-6' />
          </button>

          <div className='mb-8'>
            <h2 className='text-3xl font-bold text-white mb-2'>
              {mode === 'login' ? 'Selamat Datang' : 'Buat Akun'}
            </h2>
            <p className='text-gray-400 text-sm'>
              {mode === 'login'
                ? isUsernameMode
                  ? 'Masuk dengan username dan password Anda.'
                  : 'Silakan masuk untuk melanjutkan.'
                : 'Daftar sekarang untuk memulai.'}
            </p>
          </div>

          {isUsernameMode && (
            <div className='mb-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4'>
              <p className='text-sm text-emerald-200 mb-2'>
                Pendaftaran akun hanya tersedia melalui Admin. Hubungi kami
                untuk mendaftar.
              </p>
              {waUrl ? (
                <a
                  href={waUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-2 text-sm font-semibold text-[#25D366] hover:text-[#1fbd58] transition-colors'>
                  <svg className='w-4 h-4 fill-current' viewBox='0 0 24 24' aria-hidden='true'>
                    <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z' />
                  </svg>
                  Hubungi Admin via WhatsApp
                </a>
              ) : (
                <p className='text-xs text-gray-400'>
                  Hubungi Admin untuk pendaftaran akun.
                </p>
              )}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className='space-y-5'>
            {error && (
              <div className='bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg'>
                {error}
              </div>
            )}

            {mode === 'register' && (
              <>
                <div className='space-y-1.5'>
                  <label className='text-sm font-medium text-gray-300'>
                    Nama Lengkap
                  </label>
                  <input
                    name='name'
                    type='text'
                    placeholder='John Doe'
                    required
                    className='w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors'
                  />
                </div>
                <div className='space-y-1.5'>
                  <label className='text-sm font-medium text-gray-300'>
                    Nomor Telepon (WhatsApp)
                  </label>
                  <input
                    name='phone'
                    type='tel'
                    placeholder='081234567890'
                    value={phone}
                    onChange={handlePhoneChange}
                    required
                    className={`w-full bg-[#1a1a1a] border ${phoneError ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors`}
                  />
                  {phoneError && (
                    <p className='text-xs text-red-500 mt-1'>{phoneError}</p>
                  )}
                </div>
              </>
            )}

            {isUsernameMode ? (
              <div className='space-y-1.5'>
                <label className='text-sm font-medium text-gray-300'>
                  Username
                </label>
                <input
                  name='username'
                  type='text'
                  placeholder='Username'
                  required
                  autoComplete='username'
                  className='w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors'
                />
              </div>
            ) : (
              <div className='space-y-1.5'>
                <label className='text-sm font-medium text-gray-300'>
                  Email
                </label>
                <input
                  name='email'
                  type='text'
                  placeholder='johndoe@example.com'
                  required
                  className='w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors'
                />
              </div>
            )}

            <div className='space-y-1.5 relative'>
              <label className='text-sm font-medium text-gray-300'>
                Password
              </label>
              <div className='relative'>
                <input
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Masukkan password'
                  required
                  autoComplete={
                    isUsernameMode
                      ? 'current-password'
                      : mode === 'login'
                        ? 'current-password'
                        : 'new-password'
                  }
                  className='w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors pr-12'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors'>
                  {showPassword ? (
                    <EyeOff className='w-5 h-5' />
                  ) : (
                    <Eye className='w-5 h-5' />
                  )}
                </button>
              </div>
            </div>

            {mode === 'login' && !isUsernameMode && (
              <div className='flex items-center justify-between'>
                <label className='flex items-center gap-2 cursor-pointer group'>
                  <input
                    type='checkbox'
                    className='w-4 h-4 rounded border-gray-600 bg-[#1a1a1a] text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900'
                  />
                  <span className='text-sm text-gray-400 group-hover:text-white transition-colors'>
                    Ingat Saya
                  </span>
                </label>
                <Link
                  href='#'
                  className='text-sm text-blue-500 hover:text-blue-400 transition-colors'>
                  Lupa Password?
                </Link>
              </div>
            )}

            <button
              type='submit'
              disabled={isPending}
              className='w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
              {isPending
                ? 'MEMPROSES...'
                : mode === 'login'
                  ? 'MASUK SEKARANG'
                  : 'DAFTAR SEKARANG'}
            </button>

            {!isUsernameMode && (
              <div className='text-center mt-6'>
                <span className='text-sm text-gray-400'>
                  {mode === 'login'
                    ? 'Belum punya akun? '
                    : 'Sudah punya akun? '}
                </span>
                <Link
                  href={mode === 'login' ? '/register' : '/login'}
                  className='text-sm text-blue-500 hover:text-blue-400 transition-colors'>
                  {mode === 'login' ? 'Daftar sekarang' : 'Masuk sekarang'}
                </Link>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
