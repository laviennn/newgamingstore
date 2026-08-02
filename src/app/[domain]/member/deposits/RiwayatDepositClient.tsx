"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export function RiwayatDepositClient({ initialDeposits }: { initialDeposits: any[] }) {
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [limit, setLimit] = useState(10);
  
  // Actually applied filters (on 'Filter Data' click)
  const [activeFilters, setActiveFilters] = useState({
    status: "",
    dateFrom: "",
    dateTo: "",
    limit: 10
  });

  const handleFilter = () => {
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
    setActiveFilters({
      status: "",
      dateFrom: "",
      dateTo: "",
      limit: 10
    });
  };

  const filteredData = useMemo(() => {
    let result = [...initialDeposits];

    if (activeFilters.status) {
      result = result.filter(d => d.status.toLowerCase() === activeFilters.status.toLowerCase());
    }

    if (activeFilters.dateFrom) {
      result = result.filter(d => new Date(d.created_at) >= new Date(activeFilters.dateFrom));
    }

    if (activeFilters.dateTo) {
      const toDate = new Date(activeFilters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(d => new Date(d.created_at) <= toDate);
    }

    return result.slice(0, activeFilters.limit);
  }, [initialDeposits, activeFilters]);

  return (
    <div className="space-y-6">
      
      {/* Filters Section */}
      <div className="bg-[#151515] border border-white/5 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">STATUS</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500 appearance-none transition-colors"
            >
              <option value="" className="bg-[#151515]">Success, Pending...</option>
              <option value="Success" className="bg-[#151515]">Success</option>
              <option value="Pending" className="bg-[#151515]">Pending</option>
              <option value="Processed" className="bg-[#151515]">Processed</option>
              <option value="Failed" className="bg-[#151515]">Failed</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">DARI TANGGAL</label>
            <input 
              type="date" 
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500 transition-colors [color-scheme:dark]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">SAMPAI TANGGAL</label>
            <input 
              type="date" 
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500 transition-colors [color-scheme:dark]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">TAMPILKAN</label>
            <div className="relative">
              <select 
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500 appearance-none transition-colors pr-10"
              >
                <option value={10} className="bg-[#151515]">10 Baris</option>
                <option value={20} className="bg-[#151515]">20 Baris</option>
                <option value={50} className="bg-[#151515]">50 Baris</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleFilter}
            className="bg-[#2B95FF] hover:bg-[#1E74D4] text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(43,149,255,0.4)]"
          >
            Filter Data
          </button>
          <button 
            onClick={handleReset}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[#1F2023] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="py-4 px-6">NOMOR INVOICE</th>
                <th className="py-4 px-6">JUMLAH DEPOSIT</th>
                <th className="py-4 px-6">TANGGAL</th>
                <th className="py-4 px-6">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 px-6 text-center text-gray-500 text-sm">
                    Tidak ada data mutasi yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredData.map((dep) => {
                  const depositDate = new Date(dep.created_at);
                  const formattedDate = `${depositDate.getFullYear()}-${String(depositDate.getMonth() + 1).padStart(2, '0')}-${String(depositDate.getDate()).padStart(2, '0')} ${String(depositDate.getHours()).padStart(2, '0')}:${String(depositDate.getMinutes()).padStart(2, '0')}:${String(depositDate.getSeconds()).padStart(2, '0')}`;

                  return (
                    <tr key={dep.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-5 px-6">
                        <Link href={`/deposit-checkout/${dep.invoice_id}`} className="font-semibold text-[#2B95FF] hover:underline text-sm tracking-wide">
                          {dep.invoice_id}
                        </Link>
                      </td>
                      <td className="py-5 px-6 font-bold text-white text-sm">
                        Rp {Number(dep.amount).toLocaleString('id-ID')}
                      </td>
                      <td className="py-5 px-6 text-gray-400 text-xs font-medium">
                        {formattedDate}
                      </td>
                      <td className="py-5 px-6">
                        <span
                          className={`inline-block px-3 py-1 rounded-md text-[10px] font-extrabold uppercase border ${
                            dep.status === "Success"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : dep.status === "Pending"
                              ? "bg-[#D9A32D]/10 text-[#D9A32D] border-[#D9A32D]/30"
                              : dep.status === "Processed"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          }`}
                        >
                          {dep.status}
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
      
      <div className="text-xs text-gray-500 mt-2 px-2">
        Menampilkan {filteredData.length > 0 ? 1 : 0} sampai {filteredData.length} dari {initialDeposits.length} data
      </div>
      
    </div>
  );
}
