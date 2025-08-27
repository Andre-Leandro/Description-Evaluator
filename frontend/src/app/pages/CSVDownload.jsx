"use client";
import React, { useState } from "react";

export default function CSVDownload() {
  const [downloading, setDownloading] = useState(false);
  const [downloadResult, setDownloadResult] = useState(null);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);
    setDownloadResult(null);

    try {
      // Simulate download process
      setTimeout(() => {
        // Create sample CSV data
        const csvData = [
          "nombre_producto,descripcion,meta_titulo,meta_descripcion,id_imagen",
          "Producto 1,Descripción del producto 1,Meta título 1,Meta descripción 1,img001",
          "Producto 2,Descripción del producto 2,Meta título 2,Meta descripción 2,img002",
          "Producto 3,Descripción del producto 3,Meta título 3,Meta descripción 3,img003"
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `productos_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        setDownloadResult({
          message: "CSV descargado exitosamente",
          filename: `productos_export_${new Date().toISOString().split('T')[0]}.csv`,
          recordsCount: 3
        });
        setDownloading(false);
      }, 1500);

    } catch (err) {
      setError(err.message);
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Descargar CSV</h2>
        <p className="text-gray-600">Descarga los datos de productos en formato CSV</p>
      </div>

          {/* CSV Format Information */}
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Formato del CSV: <strong>nombre_producto, descripcion, meta_titulo, meta_descripcion, id_imagen</strong>
            </p>
          </div>

      {/* Download Section */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-8 text-center">
        <div className="space-y-4">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Exportar Datos
            </h3>
            <p className="text-gray-600 mb-6">
              Haz clic en el botón para descargar el archivo CSV con todos los datos de productos
            </p>
            
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
            >
              {downloading ? "Preparando descarga..." : "Descargar CSV"}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {downloading && (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <p className="text-gray-600">Preparando archivo CSV...</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {downloadResult && (
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-green-900">
            <p className="font-medium">✅ {downloadResult.message}</p>
            <div className="mt-2 text-sm text-green-700">
              <p>Archivo: {downloadResult.filename}</p>
              <p>Registros exportados: {downloadResult.recordsCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Instrucciones:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• El archivo se descargará automáticamente a tu carpeta de descargas</li>
          <li>• Puedes abrir el archivo con Excel, Google Sheets o cualquier editor de CSV</li>
          <li>• El formato utiliza comas como separador y UTF-8 como codificación</li>
        </ul>
      </div>
        </div>
      </div>
    </div>
  );
}