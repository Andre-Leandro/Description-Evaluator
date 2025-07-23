import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Bienvenido al Evaluador de Descripciones</h1>
        <p className="text-gray-600 mb-8">
          Utiliza esta herramienta para evaluar y comparar diferentes descripciones de productos.
          Navega por las diferentes secciones utilizando el menú lateral.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <Link 
            href="/comparacion" 
            className="bg-[#a9cce3] hover:bg-[#5499c7] text-white font-medium py-4 px-6 rounded-lg shadow-sm transition-colors flex items-center justify-between"
          >
            <span>Ir a Comparación</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          
          <Link 
            href="/calificacion" 
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-4 px-6 rounded-lg shadow-sm transition-colors flex items-center justify-between"
          >
            <span>Ir a Calificación</span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}