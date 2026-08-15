"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { getDictionary, Language } from "@/lib/dictionary";
import { Currency, formatCurrency } from "@/lib/currencyUtils";

export function RiwayatDepositClient({ initialDeposits, language = "id", currency = "IDR" }: { initialDeposits: any[], language?: Language, currency?: Currency }) {
  const dict = getDictionary(language);
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

    return result;
  }, [initialDeposits, activeFilters]);

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
            <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{dict.member_filter_status}</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-transparent border border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-theme-primary appearance-none transition-colors"
            >
              <option value="" className="bg-[#121212]">Success, Pending...</option>
              <option value="Success" className="bg-[#121212]">Success</option>
              <option value="Pending" className="bg-[#121212]">Pending</option>
              <option value="Processed" className="bg-[#121212]">Processed</option>
              <option value="Failed" className="bg-[#121212]">Failed</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{dict.member_filter_date_from}</label>
            <input 
              type="date" 
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-transparent border border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-theme-primary transition-colors [color-scheme:dark]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{dict.member_filter_date_to}</label>
            <input 
              type="date" 
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-transparent border border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-theme-primary transition-colors [color-scheme:dark]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{dict.member_show_label}</label>
            <div className="relative">
              <select 
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setCurrentPage(1);
                  setActiveFilters(prev => ({ ...prev, limit: Number(e.target.value) }));
                }}
                className="w-full bg-transparent border border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-300 focus:outline-none focus:border-theme-primary appearance-none transition-colors pr-10"
              >
                <option value={5} className="bg-[#121212]">5 {dict.member_rows}</option>
                <option value={10} className="bg-[#121212]">10 {dict.member_rows}</option>
                <option value={50} className="bg-[#121212]">50 {dict.member_rows}</option>
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
            {dict.member_btn_filter}
          </button>
          <button 
            onClick={handleReset}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold text-sm px-6 py-2.5 rounded-full transition-colors"
          >
            {dict.member_btn_reset}
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="py-4 px-6">{dict.member_trx_th_inv}</th>
                <th className="py-4 px-6">{dict.member_dep_current_bal || "JUMLAH DEPOSIT"}</th>
                <th className="py-4 px-6">{dict.member_trx_th_date}</th>
                <th className="py-4 px-6">{dict.member_trx_th_status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 px-6 text-center text-gray-500 text-sm">
                    {dict.member_empty_transactions}
                  </td>
                </tr>
              ) : (
                currentData.map((dep) => {
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
                        {formatCurrency(dep.amount, currency)}
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
                              ? "bg-[var(--accent-glow)] text-theme-primary opacity-90 border-theme-primary/30"
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
      
      {/* Pagination Controls */}
      {filteredData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#121212] border border-white/5 rounded-2xl p-4">
          <div className="text-xs text-gray-400 font-medium">
            {dict.member_showing_label} <span className="text-white font-bold">{startIndex}</span> - <span className="text-white font-bold">{endIndex}</span> {dict.member_of_label} <span className="text-white font-bold">{filteredData.length}</span> {dict.member_data_label}
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
              {dict.member_page_label} {currentPage} {dict.member_of_label} {totalPages}
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
