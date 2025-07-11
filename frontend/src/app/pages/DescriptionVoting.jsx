"use client";

import React, { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

import useProducts from "../../hooks/useProduct";

export default function DescriptionVoting() {
  const { products, loading, error } = useProducts();
  const [index, setIndex] = useState(0);
  const [votes, setVotes] = useState([]);
  const [finished, setFinished] = useState(false);

  // Hooks siempre arriba, nunca dentro de condicionales
  const currentProduct = products && products.length > 0 ? products[index] : null;

  const handleVote = (model) => {
    setVotes((prev) => [...prev, { productId: currentProduct.id, model }]);
    if (index + 1 < products.length) {
      setIndex(index + 1);
    } else {
      setFinished(true);
    }
  };

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

  // Ahora sí, retornos condicionales
  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!products.length) return <div>No hay productos disponibles.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/*
      <header className="p-6 bg-white sticky top-0 z-10 mb-10 flex flex-col items-center">
        <h1 className="text-3xl font-semibold text-gray-800">
          {finished ? "Resultados de las Evaluaciones" : "Evaluación de Descripciones"}
        </h1>
      </header> 
      **/ }

      {!finished ? (
        <>
          <div className="bg-gray-50 p-4 rounded-2xl border">
            <p className="text-lg font-medium text-gray-700 mb-1">{currentProduct.name}</p>
            <p className="text-gray-600 italic">{currentProduct.original}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {randomizedOptions.map((desc, i) => (
              <div
                key={i}
                onClick={() => handleVote(desc.model)}
                className="cursor-pointer border rounded-xl p-4 hover:bg-gray-100 transition text-sm"
              >
               
                <p>{desc.text}</p>
              </div>
            ))}
            <div
              onClick={() => handleVote("Todas bien")}
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
        <div className="max-w-4xl mx-auto text-center space-y-6 mt-18">
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


