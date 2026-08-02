"use client";

import React, { useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { useNotification } from "@/components/ui/notification";
import { User as UserIcon, Lock, MonitorSmartphone, Loader2, MapPin, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProfileClient({ user, sessionData }: { user: User, sessionData: any }) {
  const { showNotification, NotificationComponent } = useNotification();
  const supabase = createClient();
  const router = useRouter();

  // Profile State
  const [name, setName] = useState(user.user_metadata?.name || "");
  const [username, setUsername] = useState(user.user_metadata?.username || "");
  const [phone, setPhone] = useState(user.user_metadata?.phone || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: name,
          username: username,
          phone: phone,
        }
      });

      if (error) throw error;
      
      showNotification("success", "Profil Diperbarui", "Data profil Anda berhasil disimpan.");
      router.refresh();
    } catch (err: any) {
      showNotification("error", "Gagal Disimpan", err.message || "Gagal memperbarui profil.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) {
      showNotification("warning", "Sandi Tidak Cocok", "Konfirmasi sandi baru tidak sesuai.");
      return;
    }

    if (newPassword.length < 6) {
      showNotification("warning", "Sandi Terlalu Lemah", "Kata sandi minimal 6 karakter.");
      return;
    }

    setIsSavingPassword(true);
    try {
      // Supabase updateUser only requires new password if session is active
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      showNotification("success", "Sandi Diperbarui", "Kata sandi Anda berhasil diubah.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      showNotification("error", "Gagal Diubah", err.message || "Gagal mengubah kata sandi.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
      {NotificationComponent}

      {/* Left Column */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Informasi Pribadi */}
        <div className="bg-[#151515] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
              <UserIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Informasi Pribadi</h3>
              <p className="text-xs text-gray-400">Perbarui data diri publik Anda.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">NAMA LENGKAP</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">USERNAME</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="@"
                  className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">ALAMAT EMAIL</label>
              <input 
                type="email" 
                value={user.email}
                disabled
                className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">NO. WHATSAPP</label>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <p className="text-[10px] font-semibold text-rose-500 mt-1">
                NOTE: Sesuaikan kode negara di awal nomor. <br/>
                <span className="text-gray-500">Contoh: Indonesia 628..., Malaysia 601... (sesuaikan dengan kode negara awalan).</span>
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="bg-[#2B95FF] hover:bg-[#1E74D4] text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(43,149,255,0.2)] disabled:opacity-50 flex items-center justify-center min-w-[160px]"
              >
                {isSavingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>

        {/* Keamanan */}
        <div className="bg-[#151515] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Keamanan</h3>
              <p className="text-xs text-gray-400">Perbarui kata sandi Anda secara berkala.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">KATA SANDI SAAT INI</label>
              <input 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">KATA SANDI BARU</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">KONFIRMASI SANDI BARU</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                onClick={handleSavePassword}
                disabled={isSavingPassword || !newPassword}
                className="bg-[#2B95FF] hover:bg-[#1E74D4] text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(43,149,255,0.2)] disabled:opacity-50 flex items-center justify-center min-w-[160px]"
              >
                {isSavingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Right Column */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Sesi Aktif */}
        <div className="bg-[#151515] border border-white/5 rounded-2xl p-6">
          <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4">SESI AKTIF</h3>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="mt-0.5">
                <MonitorSmartphone className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-1 w-full">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Perangkat Ini</span>
                  <span className="text-[9px] font-bold bg-green-500/20 text-green-500 px-2 py-0.5 rounded uppercase">Online</span>
                </div>
                <div className="text-xs text-gray-400">{sessionData.device}</div>
                
                <div className="pt-2 space-y-1">
                  <div className="flex items-start gap-2 text-xs text-gray-500">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>
                      {sessionData.location}<br/>
                      <span className="text-[10px] break-all">({sessionData.ip})</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Active Now</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
