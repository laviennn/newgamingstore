"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, X } from "lucide-react";
import { login, signup } from "@/app/actions/auth";

interface AuthCardProps {
  mode: "login" | "register";
}

export function AuthCard({ mode }: AuthCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9+]/g, '');
    setPhone(val);
    
    if (val.length > 0) {
      if (!/^(08|62|\+62)/.test(val)) {
        setPhoneError("Nomor harus diawali 08, 62, atau +62");
      } else if (val.length < 10 || val.length > 15) {
        setPhoneError("Panjang nomor harus 10-15 digit");
      } else {
        setPhoneError("");
      }
    } else {
      setPhoneError("");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    if (mode === "register" && phoneError) {
      setError("Silakan perbaiki nomor telepon Anda.");
      return;
    }

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const action = mode === "login" ? login : signup;
      const result = await action(formData);

      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-[1000px] h-[600px] bg-[#121212] rounded-2xl overflow-hidden flex shadow-2xl relative">

        {/* Left Side: Background Banner (Desktop Only) */}
        <div className="hidden md:flex md:w-1/2 relative">
          <Image
            src="https://assets.newgamingstore.com/login_bg_1778139696.webp"
            alt="NewGamingStore Banner"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/40 to-transparent" />
          <div className="absolute bottom-10 left-10 right-10">
            <h1 className="text-white text-5xl font-black mb-2 tracking-tight">NewGamingStore</h1>
            <p className="text-gray-300 text-sm">
              NEWGAMINGSTORE | Platform Top Up Game & Voucher Terpercaya
            </p>
          </div>
        </div>

        {/* Right Side: Form Content */}
        <div className="w-full md:w-1/2 p-8 md:p-12 relative flex flex-col justify-center">

          <button
            onClick={() => router.push("/")}
            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              {mode === "login" ? "Selamat Datang" : "Buat Akun"}
            </h2>
            <p className="text-gray-400 text-sm">
              {mode === "login"
                ? "Silakan masuk untuk melanjutkan."
                : "Daftar sekarang untuk memulai."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            {mode === "register" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300">Nama Lengkap</label>
                  <input
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300">Nomor Telepon (WhatsApp)</label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="081234567890"
                    value={phone}
                    onChange={handlePhoneChange}
                    required
                    className={`w-full bg-[#1a1a1a] border ${phoneError ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors`}
                  />
                  {phoneError && (
                    <p className="text-xs text-red-500 mt-1">{phoneError}</p>
                  )}
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Email</label>
              <input
                name="email"
                type="text"
                placeholder="johndoe@example.com"
                required
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5 relative">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  required
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {mode === "login" && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-600 bg-[#1a1a1a] text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                  />
                  <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                    Ingat Saya
                  </span>
                </label>
                <Link href="#" className="text-sm text-blue-500 hover:text-blue-400 transition-colors">
                  Lupa Password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending
                ? "MEMPROSES..."
                : mode === "login"
                  ? "MASUK SEKARANG"
                  : "DAFTAR SEKARANG"}
            </button>

            <div className="text-center mt-6">
              <span className="text-sm text-gray-400">
                {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
              </span>
              <Link
                href={mode === "login" ? "/register" : "/login"}
                className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
              >
                {mode === "login" ? "Daftar sekarang" : "Masuk sekarang"}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
