"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getDictionary, Language } from "@/lib/dictionary";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function FaqSection({ faqs, language = 'id' }: { faqs: any[], language?: Language }) {
  const dict = getDictionary(language);
  const [openId, setOpenId] = useState<string | null>(null);

  if (!faqs || faqs.length === 0) return null;

  const toggleFaq = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full py-8 md:py-12">
      <div className="text-center mb-12 max-w-2xl mx-auto space-y-4">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
          {dict.home_faq_title_1} <span className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">{dict.home_faq_title_2}</span>
        </h2>
        <p className="text-sm md:text-base text-slate-400">
          {dict.home_faq_desc}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div 
              key={faq.id} 
              className={`rounded-2xl border transition-all duration-300 ${isOpen ? 'bg-card/80 border-primary/30 shadow-lg shadow-primary/10' : 'bg-card border-border hover:border-primary/50 hover:bg-card/90'}`}
            >
              <button
                className="w-full flex items-center justify-between p-5 md:p-6 text-left"
                onClick={() => toggleFaq(faq.id)}
              >
                <h3 className={`font-bold text-sm md:text-base transition-colors ${isOpen ? 'text-primary' : 'text-foreground'}`}>
                  {faq.question}
                </h3>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-primary shrink-0 ml-4" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-500 shrink-0 ml-4" />
                )}
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="p-5 md:p-6 pt-0 text-sm text-slate-400 leading-relaxed whitespace-pre-wrap border-t border-white/5 mt-2">
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
