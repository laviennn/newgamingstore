import React from "react";
import { MemberSidebar } from "@/components/storefront/MemberSidebar";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white py-8 px-4 md:px-8">
      <div className="container mx-auto max-w-7xl flex flex-col md:flex-row gap-6">
        <MemberSidebar />
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
