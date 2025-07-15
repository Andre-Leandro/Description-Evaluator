"use client";

import React, { useState } from "react";
import DescriptionVoting from "./DescriptionVoting";
import ModelIndividualRating from "./ModelIndividualRating";
import Results from "./Results";

export default function MainTabs() {
  const [tab, setTab] = useState("comparacion");

  return (
    <div className="max-w-screen-xl mx-auto py-8 px-4">

      <div className="flex gap-4  ">
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold transition-colors duration-200 border-b-2 ${
            tab === "comparacion"
              ? "bg-[#a9cce3] text-white border-[#a9cce3]"
              : "bg-gray-100 text-gray-700 border-transparent hover:bg-[#a9cce3] hover:text-white"
          }`}
          onClick={() => setTab("comparacion")}
        >
          Comparación de Modelos
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold transition-colors duration-200 border-b-2 ${
            tab === "individual"
              ? "bg-[#a9cce3] text-white border-[#a9cce3]"
              : "bg-gray-100 text-gray-700 border-transparent hover:bg-[#a9cce3] hover:text-white"
          }`}
          onClick={() => setTab("individual")}
        >
          Calificación Individual
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold transition-colors duration-200 border-b-2 ${
            tab === "resultados"
              ? "bg-[#a9cce3] text-white border-[#a9cce3]"
              : "bg-gray-100 text-gray-700 border-transparent hover:bg-[#a9cce3] hover:text-white"
          }`}
          onClick={() => setTab("resultados")}
        >
          Resultados
        </button>
      </div>
      <div className="bg-white rounded-b-xl shadow p-6">
        {tab === "comparacion" && <DescriptionVoting />}
        {tab === "individual" && <ModelIndividualRating />}
        {tab === "resultados" && <Results />}
      </div>
    </div>
  );
}