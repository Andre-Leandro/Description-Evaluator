"use client";

import React, { useState } from "react";
import data from "../description.json";

const MODELS = [
  { value: "claude", label: "Claude" },
  { value: "amazon nova premier", label: "Amazon Nova Premier" },
  { value: "amazon nova micro", label: "Amazon Nova Micro" },
];

export default function ModelIndividualRating() {
  const [selectedModel, setSelectedModel] = useState("claude");
  const [index, setIndex] = useState(0);
  const [votes, setVotes] = useState({});
  const [finished, setFinished] = useState(false);

  const products = data.products.filter((p) =>
    p.descriptions.some((d) => d.model === selectedModel)
  );

  const currentProduct = products[index];

  const handleVote = (up) => {
    setVotes((prev) => ({
      ...prev,
      [currentProduct.id]: up,
    }));
    if (index < products.length - 1) {
      setIndex(index + 1);
    } else {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setIndex(0);
    setVotes({});
    setFinished(false);
  };

  if (finished) {
    const upvotes = Object.values(votes).filter((v) => v === true).length;
    const downvotes = Object.values(votes).filter((v) => v === false).length;
    return (
      <div className="text-center space-y-6">
        <h2 className="text-2xl font-bold mb-4">Resultados</h2>
        <div className="flex justify-center gap-8 text-lg">
          <div className="flex items-center gap-2 text-green-600 font-semibold">
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M3 10l4 4 8-8" />
            </svg>
            {upvotes} Positivos
          </div>
          <div className="flex items-center gap-2 text-red-600 font-semibold">
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M17 10l-4-4-8 8" />
            </svg>
            {downvotes} Negativos
          </div>
        </div>
        <button
          onClick={handleRestart}
          className="px-4 py-2 bg-[#a9cce3] text-white rounded-xl shadow hover:bg-[#5499c7] transition font-semibold"
        >
          Reiniciar evaluación
        </button>
      </div>
    );
  }

  if (!currentProduct) {
    return <div>No hay productos para este modelo.</div>;
  }

  const desc = currentProduct.descriptions.find(
    (d) => d.model === selectedModel
  );

  return (
    <div>
      <div className="mb-6 relative w-64">
        <label className="font-semibold block mb-2">Seleccione un modelo</label>
        <div className="relative">
          <select
            className="appearance-none border rounded px-3 py-2 w-full pr-8 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={selectedModel}
            onChange={(e) => {
              setSelectedModel(e.target.value);
              setIndex(0);
              setVotes({});
              setFinished(false);
            }}
          >
            {MODELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </div>
      </div>
      <div className="bg-gray-50 p-6 rounded-2xl border shadow mb-6">
        <p className="text-lg font-medium text-gray-700 mb-1">
          {currentProduct.name}
        </p>
        <p className="text-gray-600 italic mb-4">{desc.text}</p>
        <div className="flex justify-center gap-8 mt-4">
          <button
            onClick={() => handleVote(true)}
            className="flex flex-col items-center group"
          >
            <svg
              className="w-10 h-10 text-gray-400 group-hover:text-green-500 transition"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 15l7-7 7 7"
              />
            </svg>
            <span className="text-green-600 font-semibold mt-1">Positivo</span>
          </button>
          <button
            onClick={() => handleVote(false)}
            className="flex flex-col items-center group"
          >
            <svg
              className="w-10 h-10 text-gray-400 group-hover:text-red-500 transition"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
            <span className="text-red-600 font-semibold mt-1">Negativo</span>
          </button>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => setFinished(true)}
          className="px-4 py-2 bg-[#a9cce3] text-white rounded-xl shadow hover:bg-[#5499c7] transition font-semibold"
        >
          Terminar evaluación
        </button>
      </div>
    </div>
  );
}