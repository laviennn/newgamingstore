"use client";

import { useState, useMemo } from "react";
import { Search, ChevronDown, Download, RefreshCcw, LayoutGrid, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export function PricesClient({ initialGames, initialProducts }: { initialGames: any[], initialProducts: any[] }) {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fix image urls
  const fixUrl = (url: string | null) => {
    if (!url) return '';
    return url.replace('pub-3646a3a5b32742faa2d3d52cb23ae4ff.r2.dev', 'assets.newgamingstore.com');
  };

  const games = initialGames.map(g => ({ ...g, image_url: fixUrl(g.image_url) }));

  // Helper to generate a fake SKU
  const getSKU = (gameName: string, productId: string) => {
    const initials = gameName.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase();
    const shortId = productId.substring(0, 4).toUpperCase();
    return `${initials}-${shortId}`;
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = initialProducts;

    if (selectedGameId) {
      result = result.filter(p => p.game_id === selectedGameId);
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => {
        const sku = getSKU(p.games?.name || "UNK", p.id).toLowerCase();
        return p.name.toLowerCase().includes(query) || sku.includes(query);
      });
    }

    return result;
  }, [initialProducts, selectedGameId, searchQuery]);

  // Format currency
  const formatIDR = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  // Simulate refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <div className="pt-20 pb-12 px-4 text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Daftar Harga Layanan
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          Temukan harga terbaik untuk semua game favorit Anda. Kami menawarkan berbagai level keanggotaan dengan diskon eksklusif yang menguntungkan.
        </p>
      </div>

      <div className="container mx-auto px-4 max-w-7xl space-y-8">
        
        {/* Game Filter Section */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <LayoutGrid className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-bold text-white">Filter Game</h2>
              </div>
              <p className="text-sm text-gray-500">Pilih kategori game untuk menyaring tabel.</p>
            </div>
            
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Cari game favoritmu..."
                className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                onChange={(e) => {
                  // This is just a visual search for games if we wanted to filter the game list
                  // But for simplicity, we'll keep the UI identical to the reference
                }}
              />
            </div>
          </div>

          <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide snap-x">
            {/* SEMUA Button */}
            <button 
              onClick={() => setSelectedGameId(null)}
              className={`snap-start shrink-0 flex flex-col items-center gap-2 group w-24`}
            >
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${selectedGameId === null ? 'bg-blue-600 border-2 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-gray-800 border border-gray-700 group-hover:border-gray-500'}`}>
                <LayoutGrid className={`w-8 h-8 ${selectedGameId === null ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
              </div>
              <span className={`text-[10px] font-bold tracking-wider ${selectedGameId === null ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>SEMUA</span>
            </button>

            {/* Game List */}
            {games.map(game => (
              <button 
                key={game.id}
                onClick={() => setSelectedGameId(game.id)}
                className="snap-start shrink-0 flex flex-col items-center gap-2 group w-24"
              >
                <div className={`relative w-20 h-20 rounded-2xl overflow-hidden transition-all ${selectedGameId === game.id ? 'border-2 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105' : 'border border-transparent group-hover:border-gray-600'}`}>
                  {game.image_url ? (
                    <Image src={game.image_url} alt={game.name} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <LayoutGrid className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                  {/* Overlay for non-selected */}
                  {selectedGameId !== game.id && (
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
                  )}
                </div>
                <span className={`text-[10px] font-bold text-center truncate w-full px-1 ${selectedGameId === game.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                  {game.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col lg:flex-row justify-between gap-4 items-center bg-[#0d0d0d] p-4 rounded-xl border border-white/5">
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Cari Layanan/SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div className="relative w-full sm:w-48">
              <select className="w-full bg-white/5 border border-white/10 rounded-lg pl-4 pr-10 py-2 text-sm text-white appearance-none focus:outline-none focus:border-blue-500 cursor-pointer">
                <option value="all">Semua Kategori</option>
                {/* Mock Categories */}
                <option value="topup">Top Up Instant</option>
                <option value="voucher">Voucher Game</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <div className="relative w-20">
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-3 pr-8 py-2 text-sm text-white appearance-none cursor-pointer"
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <button className="flex items-center gap-2 bg-[#123123] hover:bg-[#1a4a34] text-[#4ade80] border border-[#4ade80]/30 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              <Download className="w-4 h-4" /> Excel
            </button>
            <button className="flex items-center gap-2 bg-[#112440] hover:bg-[#1a365d] text-[#60a5fa] border border-[#60a5fa]/30 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              <Download className="w-4 h-4" /> CSV
            </button>
            <button 
              onClick={handleRefresh}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 transition-colors"
            >
              <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* Excel CSV Text */}
        <p className="text-sm text-gray-400 font-medium">Excel CSV</p>

        {/* Table */}
        <div className="bg-[#111111] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#1a1a1a] border-b border-gray-800 text-gray-300 text-sm">
                  <th className="py-4 px-6 font-bold">Kode / SKU</th>
                  <th className="py-4 px-6 font-bold">Nama Layanan</th>
                  <th className="py-4 px-6 font-bold text-gray-400">Harga Tamu</th>
                  <th className="py-4 px-6 font-bold">Member</th>
                  <th className="py-4 px-6 font-bold">Platinum</th>
                  <th className="py-4 px-6 font-bold">Gold</th>
                  <th className="py-4 px-6 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filteredProducts.slice(0, rowsPerPage).map((product) => {
                  const sku = getSKU(product.games?.name || "UNK", product.id);
                  const price = product.price;
                  
                  // Calculate mock tier prices
                  const memberPrice = Math.floor(price * 0.98); // -2%
                  const platinumPrice = Math.floor(price * 0.96); // -4%
                  const goldPrice = Math.floor(price * 0.94); // -6%

                  return (
                    <tr key={product.id} className="hover:bg-white/5 transition-colors group text-sm">
                      <td className="py-3 px-6">
                        <span className="bg-[#1a1a1a] text-gray-400 text-xs px-2 py-1 rounded border border-gray-800 font-mono">
                          {sku}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-gray-300 font-medium">{product.name}</td>
                      <td className="py-3 px-6 text-gray-500 font-mono">{formatIDR(price)}</td>
                      <td className="py-3 px-6 text-white font-bold font-mono">{formatIDR(memberPrice)}</td>
                      <td className="py-3 px-6 text-[#38bdf8] font-bold font-mono">{formatIDR(platinumPrice)}</td>
                      <td className="py-3 px-6 text-[#fbbf24] font-bold font-mono">{formatIDR(goldPrice)}</td>
                      <td className="py-3 px-6 text-center">
                        <span className="inline-flex items-center justify-center gap-1 bg-[#123123] text-[#4ade80] border border-[#4ade80]/20 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider">
                          <CheckCircle2 className="w-3 h-3" /> READY
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      Tidak ada layanan yang sesuai dengan filter/pencarian Anda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          {filteredProducts.length > 0 && (
            <div className="bg-[#0a0a0a] border-t border-gray-800 p-4 flex items-center justify-between text-sm text-gray-400">
              <p>Menampilkan {Math.min(filteredProducts.length, rowsPerPage)} dari {filteredProducts.length} layanan</p>
              <div className="flex gap-1">
                <button className="px-3 py-1 border border-gray-800 rounded bg-[#111111] hover:bg-white/5 transition-colors disabled:opacity-50" disabled>Prev</button>
                <button className="px-3 py-1 border border-blue-500/30 rounded bg-blue-500/10 text-blue-400 font-bold">1</button>
                <button className="px-3 py-1 border border-gray-800 rounded bg-[#111111] hover:bg-white/5 transition-colors disabled:opacity-50" disabled={filteredProducts.length <= rowsPerPage}>Next</button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
