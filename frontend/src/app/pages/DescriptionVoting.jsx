"use client";
import React, { useMemo, useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import useProducts from "../../hooks/useProduct";
import useVote from "../../hooks/useVote";
import { ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function DescriptionVoting() {
  const { products, loading, error } = useProducts();
  const [index, setIndex] = useState(0);
  const [votes, setVotes] = useState([]);
  const [skipped, setSkipped] = useState([]); // Track skipped questions
  const [finished, setFinished] = useState(false);
  const [part, setPart] = useState(1);
  const { sendVote } = useVote();
  const [filter, setFilter] = useState("all"); // "all" | "evaluated" | "pending"
  const [showSidebar, setShowSidebar] = useState(false); // Sidebar visibility
  const [selectedCondition, setSelectedCondition] = useState(1); // Default to condition ID 1
  const [open, setOpen] = useState(false);

  const getImageUrl = (path) => {
    const { data } = supabase
      .storage
      .from("SmartCatalog")
      .getPublicUrl(`imagenes/${path}.png`);
    return data.publicUrl;
  };
  
  // Helper function to check if product is evaluated for specific condition
  const isProductEvaluatedForCondition = (product, conditionId) => {
    if (!product.evaluations || !product.evaluations.length) return false;
    return product.evaluations.some(evaluation => 
      evaluation.condition?.id === conditionId && evaluation.evaluated === true
    );
  };

  // Helper function to get the voted model for a product and condition
  const getVotedModelForProduct = (product, conditionId) => {
    if (!product.evaluations || !product.evaluations.length) return null;
    const evaluation = product.evaluations.find(evaluation => 
      evaluation.condition?.id === conditionId && evaluation.evaluated === true
    );
    return evaluation?.model || null;
  };
  


  const handleVote = async (modelName, modelId) => {
    if (!currentProduct) return;

    try {
      // Enviar el voto al servidor
      await sendVote({
        id: currentProduct.id,
        model_id: modelId,
        condition_id: selectedCondition
      });
      
      // Actualizar el estado local de votos
      const newVote = { 
        productId: currentProduct.id, 
        model: modelName,
        conditionId: selectedCondition,
        timestamp: new Date().toISOString()
      };
      
      setVotes((prev) => [...prev, newVote]);
      
      // Actualizar el estado de los productos para reflejar el voto
      // Esto es necesario para que el filtro "evaluated" funcione correctamente
      const updatedProducts = products.map(p => {
        if (p.id === currentProduct.id) {
          return { ...p, evaluated: true };
        }
        return p;
      });
      
      // Actualizar el índice o marcar como terminado
      if (index + 1 < productsByPart.length) {
        setIndex(index + 1);
      } else {
        setFinished(true);
      }
    } catch (error) {
      console.error("Error submitting vote:", error);
      // El hook useVote ya maneja el error, pero podemos agregar un toast o alerta aquí si es necesario
    }
  };

  const handleSkip = () => {
    // Mark as skipped with a default lightly selected option (first option)
    const defaultOption = randomizedOptions.length > 0 ? randomizedOptions[0] : { model: "Skip", model_id: -1 };
    setSkipped((prev) => [...prev, { 
      productId: currentProduct.id, 
      model: defaultOption.model,
      model_id: defaultOption.model_id,
      index: index
    }]);
    if (index + 1 < productsByPart.length) {
      setIndex(index + 1);
    } else {
      setFinished(true);
    }
  };

  const goToQuestion = (questionIndex) => {
    setIndex(questionIndex);
    setShowSidebar(false);
  };

  // Extract unique conditions from all descriptions
  const conditions = useMemo(() => {
    const allConditions = [];
    const seenConditionIds = new Set();
    
    // Collect all unique conditions from all descriptions across all products
    products.forEach((product) => {
      if (product.descriptions && product.descriptions.length > 0) {
        product.descriptions.forEach((description) => {
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
      return [{ id: 2, name: 'Condition 2' }];
    }
    
    // Sort with condition 2 first, then others by ID
    return allConditions.sort((a, b) => {
      if (a.id === 2) return -1;
      if (b.id === 2) return 1;
      return a.id - b.id;
    });
  }, [products]);

  // Set default condition to 2 if available, otherwise use first condition
  useEffect(() => {
    if (conditions.length > 0) {
      const condition2 = conditions.find(c => c.id === 2);
      setSelectedCondition(condition2 ? 2 : conditions[0]?.id);
    }
  }, [conditions]);

  // Filtrar productos por la condición 2
  const productsByPart = useMemo(() => {
    if (!products.length) return [];
    
    // Filtramos solo los productos que tengan descripciones para la condición 2
    let filtered = products.filter(product => {
      if (product.descriptions && product.descriptions.length > 0) {
        return product.descriptions.some(desc => {
          const condition = desc.condition || 
                          (desc.evaluation && desc.evaluation.condition) || 
                          (desc.model && desc.model.condition);
          
          // Solo incluir productos de la condición 2
          return condition && condition.id === 2;
        });
      }
      return false;
    });

    // Luego aplicamos el filtro de parte (part 1, 2 o 3)
    if (part === 1) {
      filtered = filtered.slice(0, 375);
    } else if (part === 2) {
      filtered = filtered.slice(375, 375 + 700);
    } else if (part === 3) {
      filtered = filtered.slice(375 + 700, 375 + 700 + 700);
    }

    // Finalmente aplicamos el filtro de estado (evaluated/pending)
    if (filter === "evaluated") {
      filtered = filtered.filter((p) => isProductEvaluatedForCondition(p, selectedCondition));
    } else if (filter === "pending") {
      filtered = filtered.filter((p) => !isProductEvaluatedForCondition(p, selectedCondition));
    }
    
    return filtered;
  }, [products, part, filter, selectedCondition]);

  const currentProduct = productsByPart && productsByPart.length > 0 ? productsByPart[index] : null;

  const randomizedOptions = useMemo(() => {
    if (!currentProduct || !currentProduct.descriptions) return [];
  
    // Filtrar por condición
    const filtered = currentProduct.descriptions.filter(desc => {
      const condition = desc.condition || 
                        (desc.evaluation && desc.evaluation.condition) || 
                        (desc.model && desc.model.condition);
      return condition && condition.id === selectedCondition;
    });
  
    // Aleatorizar
    return [...filtered].sort(() => Math.random() - 0.5);
  }, [index, currentProduct, selectedCondition]);
  

  const results = useMemo(() => {
    const summary = {};
    // Count votes
    for (const vote of votes) {
      summary[vote.model] = (summary[vote.model] || 0) + 1;
    }
    // Count skipped (with lightly selected option)
    for (const skip of skipped) {
      const key = `${skip.model} (saltado)`;
      summary[key] = (summary[key] || 0) + 1;
    }
    return Object.entries(summary).map(([model, count]) => ({ model, count }));
  }, [votes, skipped]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="text-gray-600">Cargando productos...</p>
    </div>
  );
  if (error) return <div className="text-center text-red-600 p-4">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-2xl mb-4 shadow-lg p-4 space-y-6 relative">
        <div className="text-center mt-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Evaluación </h2>
        <p className="text-gray-600">Elija la opción que mejor se ajusta a sus necesidades</p>
      </div>
        
        <div className="flex flex-wrap items-center gap-4 p-2 rounded-lg">
  
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
          {/* Filter dropdown */}
          {conditions.length > 0 && (
          <div className="relative">
             <select
            id="condition-select"
             value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setIndex(0);
              }}
            className="border rounded px-3 py-2 pr-10 text-sm bg-white text-gray-800 
                      focus:outline-none focus:ring-2 focus:ring-blue-400 
                      appearance-none text-center [text-align-last:center] w-auto min-w-[120px]"
          >
             <option value="all">Todos</option>
              <option value="evaluated">Evaluados</option>
              <option value="pending">Pendientes</option>
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

          

          {/* Navigation button */}
          <button
            onClick={() => setShowSidebar(true)}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span>Navegación</span>
          </button>

          {/* Product counter */}
          <div className="ml-auto">
            <span className="inline-block bg-[#5A8CD3] text-white font-bold px-4 py-2 rounded-xl text-sm">
              {productsByPart.length > 0 ? index + 1 : 0} / {productsByPart.length}
            </span>
          </div>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <div 
        className={`fixed right-0 top-0 h-full w-80 bg-white shadow-lg z-50 overflow-y-auto transform transition-transform duration-300 ${
          showSidebar ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Navegación de Preguntas</h3>
            <button
              onClick={() => setShowSidebar(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-5 gap-2">
            {productsByPart.map((product, idx) => {
              const isAnswered = votes.some(v => v.productId === product.id && v.conditionId === selectedCondition) || 
                                isProductEvaluatedForCondition(product, selectedCondition);
              const isSkipped = skipped.some(s => s.productId === product.id);
              const isCurrent = idx === index;
              
              return (
                <button
                  key={product.id}
                  onClick={() => goToQuestion(idx)}
                  className={`w-10 h-10 rounded text-sm font-medium transition ${
                    isCurrent 
                      ? "bg-blue-500 text-white" 
                      : isAnswered 
                        ? "bg-green-100 text-green-800" 
                        : isSkipped
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Header with navigation and filters */}
      
      {!productsByPart.length ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
          <p className="text-gray-600">No hay productos disponibles para mostrar.</p>
        </div>
      ) : !finished ? (
        <>
          <div className="space-y-4">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border">
            
      {/* Fila principal */}
      <div className="flex justify-between items-center">
        {/* Nombre con flechita */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center space-x-2 text-lg sm:text-xl font-medium text-gray-800 cursor-pointer focus:outline-none"
        >
          <span>{currentProduct.name}</span>
          {open ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {/* Estado evaluado/pendiente */}
        <span
          className={`text-xs sm:text-sm font-semibold px-3 py-1 rounded-full ${
            isProductEvaluatedForCondition(currentProduct, selectedCondition)
              ? "bg-green-50 text-green-700 border border-green-100"
              : "bg-yellow-50 text-yellow-700 border border-yellow-100"
          }`}
        >
          {isProductEvaluatedForCondition(currentProduct, selectedCondition) ? "✓ Evaluado" : "⏳ Pendiente"}
        </span>
      </div>

      {/* Imagen desplegable */}
      {open && (
        <div className="flex justify-center mt-4">
          <div className="bg-white p-4 rounded-lg  ">
            <img
              src= {getImageUrl(currentProduct.id)}
              alt="Imagen del producto" 
              className="w-auto h-[20rem] object-cover rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {randomizedOptions.map((desc, i) => {
                const votedModel = getVotedModelForProduct(currentProduct, selectedCondition);
                const isVoted = votedModel && votedModel.name === desc.model?.name;
                
                return (
                  <div
                    key={i}
                    onClick={() => handleVote(desc.model?.name, desc.model?.id)}
                    className={`cursor-pointer border rounded-xl p-4 hover:bg-gray-50 transition text-sm sm:text-base ${
                      isVoted 
                        ? "bg-gray-100 border-gray-300 shadow-md" // Darker/shadowed appearance for voted option
                        : "bg-white"
                    }`}
                  >
                    <p className={`${isVoted ? "text-gray-700 font-medium" : "text-gray-800"}`}>
                      {desc.generated_description}
                    </p>
                    {isVoted && (
                      <div className="mt-2 flex items-center text-xs text-green-600">
                        <span className="mr-1">✓</span>
                        <span>Opción votada</span>
                      </div>
                    )}
                  </div>
                );
              })}
              <div 
                onClick={() => handleVote("Todas bien", 0)}
                className={`cursor-pointer border rounded-xl p-4 hover:bg-gray-50 transition text-sm sm:text-base text-center h-full flex flex-col items-center justify-center ${
                  (() => {
                    const votedModel = getVotedModelForProduct(currentProduct, selectedCondition);
                    const isVoted = votedModel && votedModel.name === "Todas bien";
                    return isVoted 
                      ? "bg-gray-100 border-gray-300 shadow-md" // Darker/shadowed appearance for voted option
                      : "bg-white";
                  })()
                }`}
              >
                <span className={`${
                  (() => {
                    const votedModel = getVotedModelForProduct(currentProduct, selectedCondition);
                    const isVoted = votedModel && votedModel.name === "Todas bien";
                    return isVoted ? "text-gray-700 font-medium" : "text-gray-700";
                  })()
                }`}>
                  Todas están bien
                </span>
                {(() => {
                  const votedModel = getVotedModelForProduct(currentProduct, selectedCondition);
                  const isVoted = votedModel && votedModel.name === "Todas bien";
                  return isVoted && (
                    <div className="mt-2 flex items-center text-xs text-green-600">
                      <span className="mr-1">✓</span>
                      <span>Opción votada</span>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 mt-6 mb-6">
          
            <button
              onClick={handleSkip}
              className="px-4 py-2 bg-[#5A8CD3] text-white rounded-xl hover:bg-[#4A90E2] transition font-semibold"
            >
               Saltar producto
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
                setSkipped([]);
                setFinished(false);
              }}
              className="px-4 py-2 bg-[#a9cce3] text-white rounded-xl hover:bg-[#5499c7] transition font-semibold"
            >
              Reiniciar evaluación
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}