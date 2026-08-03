"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

export function RiwayatTransaksiClient({ initialOrders }: { initialOrders: any[] }) {
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [limit, setLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Actually applied filters (on 'Filter Data' click)
  const [activeFilters, setActiveFilters] = useState({
    status: "",
    dateFrom: "",
    dateTo: "",
    limit: 10
  });

  const handleFilter = () => {
    setCurrentPage(1);
    setActiveFilters({
      status: statusFilter,
      dateFrom: dateFrom,
      dateTo: dateTo,
      limit: limit
    });
  };

  const handleReset = () => {
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
    setLimit(10);
    setCurrentPage(1);
    setActiveFilters({
      status: "",
      dateFrom: "",
      dateTo: "",
      limit: 10
    });
  };

  const filteredData = useMemo(() => {
    let result = [...initialOrders];

    if (activeFilters.status) {
      result = result.filter(o => o.status.toLowerCase() === activeFilters.status.toLowerCase());
    }

    if (activeFilters.dateFrom) {
      result = result.filter(o => new Date(o.created_at) >= new Date(activeFilters.dateFrom));
    }

    if (activeFilters.dateTo) {
      const toDate = new Date(activeFilters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(o => new Date(o.created_at) <= toDate);
    }

    return result;
  }, [initialOrders, activeFilters]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / activeFilters.limit));
  const currentData = filteredData.slice((currentPage - 1) * activeFilters.limit, currentPage * activeFilters.limit);
  
  const startIndex = (currentPage - 1) * activeFilters.limit + 1;
  const endIndex = Math.min(currentPage * activeFilters.limit, filteredData.length);

  return (
    <div className="space-y-6">
      
      {/* Filters Section */}
      <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">STATUS</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-transparent border border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500 appearance-none transition-colors"
            >
              <option value="" className="bg-[#121212]">Success, Pending...</option>
              <option value="Success" className="bg-[#121212]">Success</option>
              <option value="Pending" className="bg-[#121212]">Pending</option>
              <option value="Processed" className="bg-[#121212]">Processed</option>
              <option value="Failed" className="bg-[#121212]">Failed</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">DARI TANGGAL</label>
            <input 
              type="date" 
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-transparent border border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500 transition-colors [color-scheme:dark]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">SAMPAI TANGGAL</label>
            <input 
              type="date" 
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-transparent border border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500 transition-colors [color-scheme:dark]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">TAMPILKAN</label>
            <div className="relative">
              <select 
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setCurrentPage(1);
                  setActiveFilters(prev => ({ ...prev, limit: Number(e.target.value) }));
                }}
                className="w-full bg-transparent border border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500 appearance-none transition-colors pr-10"
              >
                <option value={5} className="bg-[#121212]">5 Baris</option>
                <option value={10} className="bg-[#121212]">10 Baris</option>
                <option value={50} className="bg-[#121212]">50 Baris</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleFilter}
            className="bg-blue-500 hover:bg-blue-400 text-white font-semibold text-sm px-6 py-2.5 rounded-full transition-all shadow-lg shadow-blue-500/20"
          >
            Filter Data
          </button>
          <button 
            onClick={handleReset}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold text-sm px-6 py-2.5 rounded-full transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="py-4 px-6">NOMOR INVOICE</th>
                <th className="py-4 px-6">ITEM / GAME</th>
                <th className="py-4 px-6">TARGET</th>
                <th className="py-4 px-6">TOTAL BAYAR</th>
                <th className="py-4 px-6">TANGGAL</th>
                <th className="py-4 px-6">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 px-6 text-center text-gray-500 text-sm">
                    Tidak ada riwayat transaksi yang ditemukan.
                  </td>
                </tr>
              ) : (
                currentData.map((order) => {
                  const orderDate = new Date(order.created_at);
                  const formattedDate = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}-${String(orderDate.getDate()).padStart(2, '0')} ${String(orderDate.getHours()).padStart(2, '0')}:${String(orderDate.getMinutes()).padStart(2, '0')}:${String(orderDate.getSeconds()).padStart(2, '0')}`;
                  
                  const targetFormatted = order.form_data
                    ? Object.values(order.form_data).join(" ")
                    : "-";

                  return (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-5 px-6">
                        <Link href={`/checkout/${order.id}`} className="font-semibold text-[#2B95FF] hover:underline text-sm tracking-wide">
                          {order.transaction_id || order.id.substring(0, 10)}
                        </Link>
                      </td>
                      <td className="py-5 px-6 font-medium text-white text-sm">
                        {order.games?.name ? `${order.games.name} Item` : "Top Up Service"}
                      </td>
                      <td className="py-5 px-6 text-gray-400 text-sm font-medium">
                        {targetFormatted}
                      </td>
                      <td className="py-5 px-6 font-bold text-white text-sm">
                        Rp {Number(order.total_price).toLocaleString('id-ID')}
                      </td>
                      <td className="py-5 px-6 text-gray-400 text-xs font-medium">
                        {formattedDate}
                      </td>
                      <td className="py-5 px-6">
                        <span
                          className={`inline-block px-3 py-1 rounded-md text-[10px] font-extrabold uppercase border ${
                            order.status === "Success"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : order.status === "Pending"
                              ? "bg-[#D9A32D]/10 text-[#D9A32D] border-[#D9A32D]/30"
                              : order.status === "Processed"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination Controls */}
      {filteredData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#121212] border border-white/5 rounded-2xl p-4">
          <div className="text-xs text-gray-400 font-medium">
            Menampilkan <span className="text-white font-bold">{startIndex}</span> - <span className="text-white font-bold">{endIndex}</span> dari <span className="text-white font-bold">{filteredData.length}</span> data
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-xs font-bold text-gray-300 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
              Halaman {currentPage} dari {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}
