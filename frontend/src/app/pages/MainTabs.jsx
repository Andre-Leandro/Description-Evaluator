"use client";

import React, { useState } from "react";
import DescriptionVoting from "./DescriptionVoting";
import ModelIndividualRating from "./ModelIndividualRating";

export default function MainTabs() {
  const [tab, setTab] = useState("comparacion");

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex gap-4 mb-8">
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold ${tab === "comparacion" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          onClick={() => setTab("comparacion")}
        >
          Comparación de Modelos
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold ${tab === "individual" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
          onClick={() => setTab("individual")}
        >
          Calificación Individual
        </button>
      </div>
      <div className="bg-white rounded-b-xl shadow p-6">
        {tab === "comparacion" && <DescriptionVoting />}
        {tab === "individual" && <ModelIndividualRating />}
      </div>
    </div>
  );
}