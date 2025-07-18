"use client";
import React, { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import useProducts from "../../hooks/useProduct";
import useVote from "../../hooks/useVote";

export default function DescriptionVoting() {
  const { products, loading, error } = useProducts();
  const [index, setIndex] = useState(0);
  const [votes, setVotes] = useState([]);
  const [finished, setFinished] = useState(false);
  const [part, setPart] = useState(1);
  const { sendVote } = useVote();
  const [filter, setFilter] = useState("all"); // "all" | "evaluated" | "pending"

  const handleVote = async (modelName, modelId) => {
  await sendVote({
    id: currentProduct.id,
    model_id: modelId,
  });
  setVotes((prev) => [...prev, { productId: currentProduct.id, model: modelName }]);
  if (index + 1 < productsByPart.length) {
    setIndex(index + 1);
  } else {
    setFinished(true);
  }
};

  // Dividir el dataset según la parte seleccionada
  const productsByPart = useMemo(() => {
  if (!products.length) return [];
  let filtered = [...products];
  if (part === 1) {
    filtered = filtered.slice(0, 375);
  } else if (part === 2) {
    filtered = filtered.slice(375, 375 + 700);
  } else if (part === 3) {
    filtered = filtered.slice(375 + 700, 375 + 700 + 700);
  }
  if (filter === "evaluated") {
    filtered = filtered.filter((p) => p.evaluated);
  } else if (filter === "pending") {
    filtered = filtered.filter((p) => !p.evaluated);
  }
  return filtered;
}, [products, part, filter]);

  const currentProduct = productsByPart && productsByPart.length > 0 ? productsByPart[index] : null;

  const randomizedOptions = useMemo(() => {
    if (!currentProduct) return [];
    return [...currentProduct.descriptions]
      .map((desc) => ({ ...desc }))
      .sort(() => Math.random() - 0.5);
  }, [index, currentProduct]);

  const results = useMemo(() => {
    const summary = {};
    for (const vote of votes) {
      summary[vote.model] = (summary[vote.model] || 0) + 1;
    }
    return Object.entries(summary).map(([model, count]) => ({ model, count }));
  }, [votes]);

  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Selector de parte y contador */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <label className="font-semibold whitespace-nowrap">Filtrar productos:</label>
          <div className="relative w-56">
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setIndex(0);
              }}
              className="appearance-none border rounded px-3 py-2 w-full pr-10 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="all">Todos</option>
              <option value="evaluated">Solo evaluados</option>
              <option value="pending">Solo pendientes</option>
            </select>
            {/* Icono flechita */}
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        {/* Selector de parte a la izquierda */}
        <div className="flex items-center gap-4 ">
          <label className="font-semibold whitespace-nowrap">Seleccionar parte del dataset:</label>
          <div className="relative w-56">
            <select
              value={part}
              onChange={e => {
                setPart(Number(e.target.value));
                setIndex(0);
                setVotes([]);
                setFinished(false);
              }}
              className="appearance-none border rounded px-3 py-2 w-full pr-10 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value={1}>Parte 1 (1–375)</option>
              <option value={2}>Parte 2 (376–1075)</option>
              <option value={3}>Parte 3 (1076–1775)</option>
            </select>
             {/* Icono flechita */}
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

        {/* Contador bonito a la derecha */}
        <div className="flex items-center gap-2">
          <span className="inline-block bg-[#a9cce3] text-white font-bold px-4 py-2 rounded-xl shadow">
            {productsByPart.length > 0 ? index + 1 : 0} / {productsByPart.length}
          </span>
        </div>
      </div>
      {(!productsByPart.length) ? (<div>No hay productos disponibles.</div>) : 
      !finished ? (
        <>
          <div className="bg-gray-50 p-4 rounded-2xl border space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-lg font-medium text-gray-700">{currentProduct.name}</p>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full shadow ${
                  currentProduct.evaluated
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {currentProduct.evaluated ? "Evaluado" : "Pendiente"}
              </span>
            </div>
            <p className="text-gray-600 italic">{currentProduct.original}</p>
          </div>
         
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {randomizedOptions.map((desc, i) => (
              <div
                key={i}
                onClick={() => handleVote(desc.model, desc.model_id)}
                className="cursor-pointer border rounded-xl p-4 hover:bg-gray-100 transition text-sm"
              >
                <p>{desc.text}</p>
              </div>
            ))}
            <div
              onClick={() => handleVote("Todas bien", 0)}
              className="cursor-pointer border rounded-2xl p-4 hover:bg-gray-100 transition text-sm text-center h-full flex items-center justify-center"
            >
              Todas están bien
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setFinished(true)}
              className="px-4 py-2 bg-[#a9cce3] text-white rounded-xl shadow hover:bg-[#5499c7] transition font-semibold"
            >
              Terminar evaluación
            </button>
          </div>
        </>
      ) : (
        <div className="max-w-7xl mx-auto text-center space-y-6 mt-18 ">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={results}>
              <XAxis dataKey="model" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8">
                {results.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      [
                        "#1a5276",
                        "#1f618d",
                        "#2980b9",
                        "#5499c7",
                      ][index % 4]
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-end">
            <button
              onClick={() => {
                setIndex(0);
                setVotes([]);
                setFinished(false);
              }}
              className="px-4 py-2 bg-[#a9cce3] text-white rounded-xl shadow hover:bg-[#5499c7] transition font-semibold"
            >
              Reiniciar evaluación
            </button>
          </div>
        </div>
      )}
    </div>
  );
}