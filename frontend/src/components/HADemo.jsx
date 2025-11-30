'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';

export default function HADemo() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const triggerStressTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/stress-memory`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setResult({
          success: true,
          message: 'Pod saturado exitosamente! Kubernetes debería recrearlo automáticamente.',
          data: data,
        });
      } else {
        setResult({
          success: true,
          message: '⚠️ El pod se cayó por Out of Memory (esperado). Kubernetes lo está recreando...',
        });
      }
    } catch (err) {
      // Es esperado que falle porque el pod se cae
      setResult({
        success: true,
        message: '💥 Pod eliminado por saturación de memoria! Verifica que Kubernetes lo recree automáticamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            🎯 Demo de Alta Disponibilidad (Kubernetes)
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Haz clic en el botón para saturar la memoria de un pod del backend (hasta 100%).
            Esto simulará un fallo y demostrará cómo Kubernetes recrea automáticamente el pod
            mientras los otros pods siguen funcionando sin interrupción.
          </p>

          <div className="bg-white rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Qué esperar:
            </h4>
            <ul className="text-sm text-gray-600 space-y-1 ml-6 list-disc">
              <li>El pod alcanzará el límite de memoria (512MB) y será eliminado (OOMKilled)</li>
              <li>Kubernetes detectará la falta de pods y creará uno nuevo automáticamente</li>
              <li>Los otros 2 pods del backend seguirán funcionando normalmente</li>
              <li>La aplicación NO tendrá downtime gracias a la alta disponibilidad</li>
            </ul>
          </div>

          <button
            onClick={triggerStressTest}
            disabled={loading}
            className={`
              flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold
              transition-all duration-200 transform hover:scale-105
              ${loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-xl'
              }
              text-white
            `}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Saturando memoria...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>💣 Saturar Memoria del Pod</span>
              </>
            )}
          </button>

          {result && (
            <div className={`mt-4 p-4 rounded-lg ${result.success ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
              <p className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.message}
              </p>
              {result.data && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>Estado: {result.data.status}</p>
                  {result.data.allocated_mb && <p>Memoria alocada: ~{result.data.allocated_mb}MB</p>}
                </div>
              )}
              <div className="mt-3 text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">
                <p className="font-semibold mb-1">📊 Para verificar en tu terminal:</p>
                <code className="block bg-gray-100 p-2 rounded text-xs">
                  kubectl get pods -n description-evaluator -w
                </code>
                <p className="mt-2 text-xs text-gray-600">
                  Verás el pod pasar de Running → OOMKilled → Terminating, y un nuevo pod siendo creado.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-800 font-semibold">Error:</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
