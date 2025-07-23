"use client";

import React, { useState } from "react";
import dynamic from 'next/dynamic';
import DescriptionVoting from "./DescriptionVoting";
import ModelIndividualRating from "./ModelIndividualRating";
import Results from "./Results";
import CSVUpload from "./CSVUpload";

// Dynamically import Sidebar with SSR disabled to avoid hydration issues
const Sidebar = dynamic(() => import('@/components/Sidebar'), {
  ssr: false,
  loading: () => (
    <div className="w-16 h-screen bg-white border-r border-gray-200 flex items-center justify-center">
      <div className="animate-pulse w-8 h-8 bg-gray-200 rounded"></div>
    </div>
  ),
});

export default function MainTabs() {
  const [activeTab, setActiveTab] = useState("comparacion");

  return (
    <>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6">
            {activeTab === "comparacion" && <DescriptionVoting />}
            {activeTab === "individual" && <ModelIndividualRating />}
            {activeTab === "resultados" && <Results />}
            {activeTab === "upload" && <CSVUpload />}
          </div>
        </div>
      </main>
    </>
  );
}