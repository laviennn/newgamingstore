"use client";

import React, { useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { useNotification } from "@/components/ui/notification";
import { User as UserIcon, Lock, MonitorSmartphone, Loader2, MapPin, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { getDictionary, Language } from "@/lib/dictionary";

export function ProfileClient({ user, sessionData, language = "id" }: { user: User, sessionData: any, language?: Language }) {
  const dict = getDictionary(language);
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
      
      showNotification("success", dict.profile_success_title, dict.profile_success_desc);
      router.refresh();
    } catch (err: any) {
      showNotification("error", dict.profile_err_title, err.message || dict.profile_err_desc);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) {
      showNotification("warning", dict.profile_pwd_unmatch_title, dict.profile_pwd_unmatch_desc);
      return;
    }

    if (newPassword.length < 6) {
      showNotification("warning", dict.profile_pwd_weak_title, dict.profile_pwd_weak_desc);
      return;
    }

    setIsSavingPassword(true);
    try {
      // Supabase updateUser only requires new password if session is active
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      showNotification("success", dict.profile_pwd_success_title, dict.profile_pwd_success_desc);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      showNotification("error", dict.profile_pwd_err_title, err.message || dict.profile_pwd_err_desc);
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
              <h3 className="text-lg font-bold text-white">{dict.profile_personal_info}</h3>
              <p className="text-xs text-gray-400">{dict.profile_personal_desc}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{dict.profile_fullname}</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-theme-card border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-theme-primary transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{dict.profile_username}</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="@"
                  className="w-full bg-theme-card border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-theme-primary transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{dict.profile_email}</label>
              <input 
                type="email" 
                value={user.email}
                disabled
                className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{dict.profile_whatsapp}</label>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-theme-card border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-theme-primary transition-colors"
              />
              <p className="text-[10px] font-semibold text-rose-500 mt-1">
                {dict.profile_whatsapp_note} <br/>
                <span className="text-gray-500">{dict.profile_whatsapp_ex}</span>
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="bg-[#2B95FF] hover:bg-[#1E74D4] text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(43,149,255,0.2)] disabled:opacity-50 flex items-center justify-center min-w-[160px]"
              >
                {isSavingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : dict.profile_btn_save}
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
              <h3 className="text-lg font-bold text-white">{dict.profile_sec_title}</h3>
              <p className="text-xs text-gray-400">{dict.profile_sec_desc}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{dict.profile_pwd_curr}</label>
              <input 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-theme-card border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-theme-primary transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{dict.profile_pwd_new}</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-theme-card border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-theme-primary transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{dict.profile_pwd_confirm}</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-theme-card border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-theme-primary transition-colors"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                onClick={handleSavePassword}
                disabled={isSavingPassword || !newPassword}
                className="bg-[#2B95FF] hover:bg-[#1E74D4] text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(43,149,255,0.2)] disabled:opacity-50 flex items-center justify-center min-w-[160px]"
              >
                {isSavingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : dict.profile_btn_save}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Right Column */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Sesi Aktif */}
        <div className="bg-[#151515] border border-white/5 rounded-2xl p-6">
          <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4">{dict.profile_active_session}</h3>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="mt-0.5">
                <MonitorSmartphone className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-1 w-full">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{dict.profile_this_device}</span>
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
