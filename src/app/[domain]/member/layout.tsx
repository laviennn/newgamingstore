import React from "react";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white py-8 px-4 md:px-8">
      <div className="container mx-auto max-w-7xl">
        {children}
      </div>
    </div>
  );
}
