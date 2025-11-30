import Link from "next/link";
import HADemo from "@/components/HADemo";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
              Smart<span className="text-[#5A8CD3]">Catalog</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Herramienta profesional para evaluar, comparar y optimizar el contenido de tus productos: títulos, descripciones y metadescripciones.
              Potencia la visibilidad y calidad de tu catálogo con análisis inteligente y resultados precisos.
            </p>
            <div className="flex justify-center items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Análisis avanzado
              </span>
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Fácil de usar
              </span>
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Resultados precisos
              </span>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Carga Datos</h3>
              <p className="text-sm text-gray-600">
                Sube tus archivos CSV e imágenes de forma segura
              </p>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-xl">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Compara</h3>
              <p className="text-sm text-gray-600">
                Evalúa y compara diferentes versiones de descripciones
              </p>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Analiza</h3>
              <p className="text-sm text-gray-600">
                Obtén resultados detallados y estadísticas
              </p>
            </div>

            <div className="text-center p-6 bg-orange-50 rounded-xl">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Exporta</h3>
              <p className="text-sm text-gray-600">
                Descarga los resultados en formato CSV
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link
              href="/subir-csv"
              className="group bg-gradient-to-r from-[#5A8CD3] to-[#5A8CD3] 
           hover:from-[#5A8CD3] hover:to-[#4A90E2] 
           text-white font-medium py-6 px-8 rounded-xl 
           transition-all duration-200 flex items-center justify-between 
           transform hover:scale-105 hover:shadow-lg"
            >
              <div className="text-left">
                <span className="text-lg font-semibold">Comenzar</span>
                <p className="text-blue-100 text-sm mt-1">
                  Sube tus datos y comienza a evaluar
                </p>
              </div>
              <svg
                className="w-6 h-6 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>

            <Link
              href="/comparacion"
              className="group bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 font-medium py-6 px-8 rounded-xl transition-all duration-200 flex items-center justify-between transform hover:scale-105"
            >
              <div className="text-left">
                <span className="text-lg font-semibold text-gray-800">
                  Ir a Comparación
                </span>
                <p className="text-gray-500 text-sm mt-1">
                  Evalúa descripciones existentes
                </p>
              </div>
              <svg
                className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>

          {/* High Availability Demo Section - KUBERNETES */}
          <div className="mb-8">
            <HADemo />
          </div>

          {/* Stats or Benefits */}
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-2xl font-bold text-[#5A8CD3] mb-1">
                  100%
                </div>
                <div className="text-sm text-gray-600">Preciso</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  Rápido
                </div>
                <div className="text-sm text-gray-600">
                  Análisis en segundos
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  Fácil
                </div>
                <div className="text-sm text-gray-600">Interfaz intuitiva</div>
              </div>
            </div>
          </div>

          {/* Innovation Section */}
          <div className="mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 border border-indigo-100">
            <div className="text-center">
              <div className="inline-flex items-center bg-white px-4 py-2 rounded-full shadow-sm mb-4">
                <span className="text-sm font-medium text-gray-600">
                  💡 Innovación
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Rompiendo Prejuicios sobre la IA
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                <span className="font-semibold text-[#5A8CD3]">
                  SmartCatalog
                </span>{" "}
                viene a demostrar que no todos los modelos de IA son iguales. A
                través de evaluaciones objetivas y comparaciones reales,
                ayudamos a descubrir cuál modelo realmente genera las mejores
                descripciones para tu negocio.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto mb-3">
                    <span className="text-white text-sm font-bold">🎯</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Datos Reales
                  </h4>
                  <p className="text-sm text-gray-600">
                    Basamos nuestras evaluaciones en métricas objetivas, no en
                    marketing
                  </p>
                </div>

                <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mx-auto mb-3">
                    <span className="text-white text-sm font-bold">⚡</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Sin Sesgos
                  </h4>
                  <p className="text-sm text-gray-600">
                    Cada modelo compite en igualdad de condiciones por tu voto
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white/30 backdrop-blur-sm rounded-lg border border-white/30">
                <p className="text-sm text-gray-700 italic">
                  "La mejor IA es la que funciona para{" "}
                  <span className="font-semibold">tu caso específico</span>, no
                  la que tiene mejor marketing"
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  — Filosofía SmartCatalog
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
