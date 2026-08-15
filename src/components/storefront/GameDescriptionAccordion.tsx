"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { getDictionary, Language } from "@/lib/dictionary";

export function GameDescriptionAccordion({ description, language = "id" }: { description: string, language?: Language }) {
  const dict = getDictionary(language);
  const [isOpen, setIsOpen] = useState(true); // Open by default

  return (
    <div className="border-2 border-primary/20 rounded-2xl bg-card overflow-hidden shadow-lg mt-8">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center justify-between bg-primary/5 px-5 py-4 font-bold transition-colors hover:bg-primary/10"
      >
        {dict.game_guide_btn.replace('Lihat ', '')}
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-primary" />
        ) : (
          <ChevronDown className="h-5 w-5 text-primary" />
        )}
      </div>
      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="px-5 py-5 text-sm leading-relaxed text-muted-foreground whitespace-pre-line border-t border-primary/10 bg-background/50">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
}
