"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
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
        
        {/* Glitch Effect 404 */}
        <div className="relative inline-block mb-6 group">
          <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-blue-600 to-purple-600 drop-shadow-[0_0_20px_rgba(37,99,235,0.3)] select-none">
            404
          </h1>
          <h1 className="absolute top-0 left-0 w-full text-8xl md:text-9xl font-black text-blue-500 opacity-50 blur-[2px] -translate-x-1 translate-y-1 group-hover:-translate-x-2 group-hover:translate-y-2 transition-transform duration-300">
            404
          </h1>
          <h1 className="absolute top-0 left-0 w-full text-8xl md:text-9xl font-black text-purple-500 opacity-50 blur-[2px] translate-x-1 -translate-y-1 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-300">
            404
          </h1>
        </div>

        {/* Text Details */}
        <div className="bg-black/40 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl shadow-blue-900/20 mb-8 transform hover:scale-[1.02] transition-transform duration-500">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Misi Gagal: Zona Tidak Ditemukan</h2>
          <p className="text-gray-400 text-sm md:text-base mb-6 leading-relaxed">
            Sepertinya Anda tersesat di luar batas peta permainan. Halaman yang Anda cari mungkin telah dihapus, dipindahkan, atau Anda salah memasukkan URL.
          </p>
          
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-6"></div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => window.history.back()} 
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold flex items-center justify-center gap-2 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Kembali
            </button>
            <Link 
              href="/" 
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all"
            >
              <Home className="w-5 h-5" />
              Basecamp Utama
            </Link>
          </div>
        </div>
        
      </div>
      
    </div>
  );
}
