"use client";

import React, { useState } from "react";
import data from "../description.json";

export default function ModelIndividualRating() {
  const [selectedModel, setSelectedModel] = useState("claude");
  const [votes, setVotes] = useState({});

  const handleVote = (productId, up) => {
    setVotes((prev) => ({
      ...prev,
      [productId]: up,
    }));
  };

  return (
    <div>
      <div className="mb-6">
        <label className="font-semibold mr-2">Elegí un modelo:</label>
        <select
          className="border rounded px-3 py-2"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          <option value="claude">Claude</option>
          <option value="amazon nova premier">Amazon Nova Premier</option>
          <option value="amazon nova micro">Amazon Nova Micro</option>
        </select>
      </div>
      <div className="space-y-4">
        {data.products.map((product) => {
          const desc = product.descriptions.find((d) => d.model === selectedModel);
          if (!desc) return null;
          return (
            <div key={product.id} className="border rounded-xl p-4 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{product.name}</p>
                <p className="italic text-gray-600">{desc.text}</p>
              </div>
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 rounded-full bg-gradient-to-r from-green-400 to-green-600 text-white shadow hover:from-green-500 hover:to-green-700 transition font-semibold ${votes[product.id] === true ? "ring-2 ring-green-500" : ""}`}
                  onClick={() => handleVote(product.id, true)}
                >
                  👍
                </button>
                <button
                  className={`px-3 py-1 rounded-full bg-gradient-to-r from-red-400 to-red-600 text-white shadow hover:from-red-500 hover:to-red-700 transition font-semibold ${votes[product.id] === false ? "ring-2 ring-red-500" : ""}`}
                  onClick={() => handleVote(product.id, false)}
                >
                  👎
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}