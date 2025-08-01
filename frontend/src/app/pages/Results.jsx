'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import useProducts from "../../hooks/useProduct";
import React, { useMemo, useState, useEffect } from "react";

export default function Results() {
  const { products, loading, error } = useProducts();
  const [selectedCondition, setSelectedCondition] = useState(1); // Default to condition ID 1

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
      if (conditions.length > 0 && !conditions.some(c => c.id === selectedCondition)) {
        setSelectedCondition(conditions[0]?.id || 1);
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

  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div>Error: {error}</div>;


  return (
   <div className="max-w-7xl mx-auto space-y-4 ">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Resultados</h1>
        
        {conditions.length > 0 && (
          <div className="mb-4 text-center">
            <label htmlFor="condition-select" className="mr-2 font-medium text-gray-700">
              Condición:
            </label>
            <select
              id="condition-select"
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(Number(e.target.value))}
              className="border rounded px-3 py-1 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {conditions.map(condition => (
                <option key={condition.id} value={condition.id}>
                  {condition.name}
                </option>
              ))}
            </select>
            {conditions.find(c => c.id === selectedCondition)?.description && (
              <p className="text-sm text-gray-600 mt-1">
                {conditions.find(c => c.id === selectedCondition).description}
              </p>
            )}
          </div>
        )}
      </div>
      <div className="flex justify-end mb-8">
        <span className="inline-block bg-[#a9cce3] text-white font-bold px-4 py-2 rounded-xl shadow">
          Evaluados: {evaluated.length} / {filtered.length}
        </span>
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
