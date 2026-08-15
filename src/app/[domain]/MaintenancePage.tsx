import { Settings, RefreshCw } from "lucide-react";

export function MaintenancePage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black text-white selection:bg-blue-500/30">
      
      {/* Background Hero Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105"
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
        
        {/* Animated Icon */}
        <div className="relative inline-block mb-6 group">
          <Settings className="w-24 h-24 md:w-32 md:h-32 text-theme-primary animate-[spin_4s_linear_infinite] drop-shadow-[0_0_20px_rgba(37,99,235,0.5)]" />
        </div>

        {/* Text Details */}
        <div className="bg-black/40 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl shadow-blue-900/20 mb-8 transform hover:scale-[1.02] transition-transform duration-500">
          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-blue-600 to-purple-600 mb-4 select-none">
            SERVER MAINTENANCE
          </h1>
          <h2 className="text-xl md:text-2xl font-bold mb-4">Sedang Melakukan Upgrade Sistem</h2>
          <p className="text-gray-400 text-sm md:text-base mb-6 leading-relaxed">
            Mohon maaf, saat ini server sedang dalam perbaikan dan peningkatan kualitas layanan untuk memberikan pengalaman transaksi yang lebih baik. Silakan kembali lagi nanti!
          </p>
          
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-6"></div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-theme-primary hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              Coba Ulang (Refresh)
            </button>
          </div>
        </div>

        {/* Floating Text below card */}
        <div className="mt-8 animate-pulse text-theme-primary opacity-90/60 font-semibold tracking-widest text-sm uppercase">
          SYSTEM_UPGRADE_IN_PROGRESS_
        </div>
      </div>
    </div>
  );
}
