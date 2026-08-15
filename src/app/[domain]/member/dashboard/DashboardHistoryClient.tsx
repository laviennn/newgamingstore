"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { getDictionary, Language } from "@/lib/dictionary";
import { Currency, formatCurrency } from "@/lib/currencyUtils";

export function DashboardHistoryClient({ mergedHistory, language = "id", currency = "IDR" }: { mergedHistory: any[], language?: Language, currency?: Currency }) {
  const dict = getDictionary(language);
  const [limit, setLimit] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(mergedHistory.length / limit));
  const currentData = mergedHistory.slice((currentPage - 1) * limit, currentPage * limit);
  
  const startIndex = (currentPage - 1) * limit + 1;
  const endIndex = Math.min(currentPage * limit, mergedHistory.length);

  return (
    <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h3 className="text-lg font-bold text-white">{dict.member_recent_transactions}</h3>
        
        {/* Limit Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">{dict.member_show_label}</span>
          <div className="relative">
            <select 
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-transparent border border-white/10 rounded-2xl px-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-theme-primary appearance-none transition-colors pr-10"
            >
              <option value={5} className="bg-[#121212]">5 {dict.member_rows}</option>
              <option value={10} className="bg-[#121212]">10 {dict.member_rows}</option>
              <option value={50} className="bg-[#121212]">50 {dict.member_rows}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {mergedHistory.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          {dict.member_empty_transactions}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">{dict.member_trx_th_inv}</th>
                  <th className="py-3 px-4">{dict.member_trx_th_item}</th>
                  <th className="py-3 px-4">{dict.member_trx_th_target}</th>
                  <th className="py-3 px-4">{dict.member_trx_th_total}</th>
                  <th className="py-3 px-4">{dict.member_trx_th_date}</th>
                  <th className="py-3 px-4 text-right">{dict.member_trx_th_status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {currentData.map((item) => {
                  const isDeposit = item.invoice_id?.startsWith('DEP');
                  
                  const targetFormatted = isDeposit ? '-' : (item.form_data
                    ? Object.values(item.form_data).join(" ")
                    : "-");
                    
                  const itemName = isDeposit ? "Deposit Saldo" : (item.games?.name ? `${item.games.name} Item` : "Top Up Service");
                  const price = isDeposit ? item.amount : item.total_price;
                  const itemCurrency = item.currency || currency;
                  const orderDate = new Date(item.created_at).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 font-semibold text-theme-primary opacity-90">
                        {item.invoice_id || item.transaction_id || item.id.substring(0, 10)}
                      </td>
                      <td className="py-4 px-4 text-gray-200">
                        {itemName}
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-xs">{targetFormatted}</td>
                      <td className="py-4 px-4 font-bold text-white">
                        {formatCurrency(Number(price), itemCurrency)}
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-xs">{orderDate}</td>
                      <td className="py-4 px-4 text-right">
                        <span
                          className={`inline-block px-3 py-1 rounded-md text-xs font-extrabold uppercase border ${
                            item.status === "Success"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : item.status === "Pending"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : item.status === "Processed"
                              ? "bg-[var(--accent-glow)] text-theme-primary opacity-90 border-theme-primary/30"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {mergedHistory.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-4 mt-4">
              <div className="text-xs text-gray-400 font-medium">
                {dict.member_showing_label} <span className="text-white font-bold">{startIndex}</span> - <span className="text-white font-bold">{endIndex}</span> {dict.member_of_label} <span className="text-white font-bold">{mergedHistory.length}</span> {dict.member_data_label}
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
        </>
      )}
    </div>
  );
}
