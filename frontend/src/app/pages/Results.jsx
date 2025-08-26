'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import useProducts from "../../hooks/useProduct";
import React, { useMemo, useState, useEffect } from "react";

export default function Results() {
  const { products, loading, error } = useProducts();
  const [selectedCondition, setSelectedCondition] = useState(2); // Default to condition ID 2 (skip condition 1)

    const conditions = useMemo(() => {
      const allConditions = [];
      const seenConditionIds = new Set();
    
      // Collect all unique conditions from all descriptions across all products
      products.forEach((product, productIndex) => {
        if (product.descriptions && product.descriptions.length > 0) {
          product.descriptions.forEach((description, descIndex) => {
            // Try different possible paths to find the condition
            let condition = null;
            
            // Check possible paths to find the condition
            if (description.condition) {
              condition = description.condition;
            } else if (description.evaluation?.condition) {
              condition = description.evaluation.condition;
            } else if (description.model?.condition) {
              condition = description.model.condition;
            }
            
            if (condition && condition.id && !seenConditionIds.has(condition.id)) {
              console.log(`Found condition in product ${productIndex} description ${descIndex}:`, condition);
              seenConditionIds.add(condition.id);
              allConditions.push({
                id: condition.id,
                name: `Condition ${condition.id}`,
                ...condition
              });
            }
          });
        }
      });
        
      // Always ensure we have at least one condition
      if (allConditions.length === 0) {
        console.warn('No conditions found in the data. Using default condition.');
        // Return a default condition if none found
        return [{ id: 1, name: 'Condition 1' }];
      }
      
      // Sort by ID for consistent ordering
      return allConditions.sort((a, b) => a.id - b.id);
    }, [products]);
  
    // Update selected condition if it doesn't exist in the conditions list
    useEffect(() => {
      const validConditions = conditions.filter(c => c.id > 1);
      if (validConditions.length > 0 && !validConditions.some(c => c.id === selectedCondition)) {
        setSelectedCondition(validConditions[0]?.id || 2);
      }
    }, [conditions, selectedCondition]);

    let filtered = products.filter(product => {
      // Si el producto tiene descripciones, verificamos si alguna coincide con la condición
      if (product.descriptions && product.descriptions.length > 0) {
        return product.descriptions.some(desc => {
          // Buscamos la condición en diferentes ubicaciones posibles
          const condition = desc.condition
          // Si encontramos una condición, verificamos si coincide con la seleccionada
          return condition && condition.id === selectedCondition;
        });
      }
      return false;
    });

    let evaluated = filtered.filter(product => {
      if (!product.evaluations) return false;
    
      return product.evaluations.some(ev =>
        ev.condition?.id === selectedCondition && ev.evaluated === true
      );
    });
    
  console.log("Evaluated products under condition", selectedCondition, evaluated);

  // Contar los votos
  const voteCounts = {};
  evaluated.forEach(product => {
    const evaluation = product.evaluations.find(ev =>
      ev.condition?.id === selectedCondition && ev.evaluated === true
    );
  
    if (evaluation?.model?.name) {
      const modelName = evaluation.model.name;
      voteCounts[modelName] = (voteCounts[modelName] || 0) + 1;
    }
  });
  

  const data = Object.entries(voteCounts).map(([model, count]) => ({
    model,
    count,
  }));

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="text-gray-600">Cargando productos...</p>
    </div>
  );
  if (error) return <div className="text-center text-red-600 p-4">Error: {error}</div>;


  return (
   <div className="max-w-7xl mx-auto space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="text-center mb-10 mt-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
             Resultados de las <span className="text-[#5A8CD3]">Votaciones</span>
            </h1> 
        </div>
            
        <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg">
         {conditions.length > 0 && (
          <div className="relative">
             <select
             id="condition-select"
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(Number(e.target.value))}
            className="border rounded px-3 py-2 pr-10 text-sm bg-white text-gray-800 
                      focus:outline-none focus:ring-2 focus:ring-blue-400 
                      appearance-none text-center [text-align-last:center] w-auto min-w-[120px]"
          >
            {conditions.map(condition => (
              condition.id > 1 && (
                <option key={condition.id} value={condition.id}>
                  {condition.description}
                </option>
              )
            ))}
          </select>

          {/* Flecha custom */}
           <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          </div>
        )}
        <div className="ml-auto">
            <span className="inline-block bg-[#5A8CD3] text-white font-bold px-4 py-2 rounded-xl text-sm">
             {evaluated.length} / {filtered.length}
            </span>
          </div>
      </div>
      </div>
      

      <div className="text-center">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="model" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8">
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    ["#1a5276", "#1f618d", "#2980b9", "#5499c7"][index % 4]
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
    </div>

  );
}
