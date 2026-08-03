"use client";

import { Wrench, RefreshCw } from "lucide-react";

interface MaintenanceViewProps {
  tenantName: string;
}

export function MaintenanceView({ tenantName }: MaintenanceViewProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black text-white selection:bg-orange-500/30">
      
      {/* Background Hero Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30 scale-105"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80"></div>
      </div>

      {/* Decorative Grid */}
      <div className="absolute inset-0 z-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-2xl px-6 text-center">
        
        {/* Maintenance Icon */}
        <div className="relative inline-block mb-6 group">
          <div className="p-6 rounded-full bg-orange-600/20 border border-orange-500/30 backdrop-blur-sm shadow-[0_0_30px_rgba(249,115,22,0.3)]">
            <Wrench className="w-20 h-20 text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.8)] animate-pulse" />
          </div>
        </div>

        {/* Text Details */}
        <div className="bg-black/50 backdrop-blur-md border border-orange-500/20 p-8 rounded-3xl shadow-2xl shadow-orange-900/20 mb-8 transform hover:scale-[1.02] transition-transform duration-500">
          <h2 className="text-3xl md:text-4xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 uppercase tracking-wide">
            Server Maintenance
          </h2>
          <p className="text-gray-300 text-sm md:text-lg mb-6 leading-relaxed">
            Sistem <span className="font-semibold text-orange-400">{tenantName}</span> saat ini sedang dalam perbaikan berkala untuk meningkatkan pengalaman dan stabilitas permainan Anda. Kami akan segera kembali!
          </p>
          
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-orange-500/30 to-transparent my-6"></div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] transition-all group"
            >
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              Coba Muat Ulang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
