"use client";
import React, { useState } from "react";

export default function CSVUpload() {
  const [activeTab, setActiveTab] = useState("csv");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
      setSelectedFile(file);
      setError(null);
    } else {
      setError("Por favor selecciona un archivo CSV válido");
      setSelectedFile(null);
    }
  };

  const handleImagesSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => 
      file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/jpg"
    );
    
    if (validFiles.length !== files.length) {
      setError("Solo se permiten archivos PNG y JPEG");
    } else {
      setError(null);
    }
    
    setSelectedImages(validFiles);
  };

  const handleCSVUpload = async () => {
    if (!selectedFile) {
      setError("Por favor selecciona un archivo");
      return;
    }

    setUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Simulate upload for now
      setTimeout(() => {
        setUploadResult({
          message: "Archivo CSV procesado exitosamente",
          filename: selectedFile.name,
          size: selectedFile.size,
          rowsProcessed: Math.floor(Math.random() * 100) + 50
        });
        setSelectedFile(null);
        setUploading(false);
        document.getElementById("csvFileInput").value = "";
      }, 2000);

    } catch (err) {
      setError(err.message);
      setUploading(false);
    }
  };

  const handleImagesUpload = async () => {
    if (!selectedImages.length) {
      setError("Por favor selecciona imágenes");
      return;
    }

    setUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      // Simulate upload for now
      setTimeout(() => {
        setUploadResult({
          message: "Imágenes procesadas exitosamente",
          filesCount: selectedImages.length,
          size: selectedImages.reduce((total, file) => total + file.size, 0)
        });
        setSelectedImages([]);
        setUploading(false);
        document.getElementById("imagesInput").value = "";
      }, 2000);

    } catch (err) {
      setError(err.message);
      setUploading(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    
    if (activeTab === "csv") {
      const file = files[0];
      if (file && file.type === "text/csv") {
        setSelectedFile(file);
        setError(null);
      } else {
        setError("Por favor arrastra un archivo CSV válido");
      }
    } else {
      const validFiles = files.filter(file => 
        file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/jpg"
      );
      
      if (validFiles.length !== files.length) {
        setError("Solo se permiten archivos PNG y JPEG");
      } else {
        setError(null);
      }
      
      setSelectedImages(validFiles);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cargar Datos</h2>
        <p className="text-gray-600">Selecciona el tipo de archivo que deseas subir</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("csv")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "csv"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Subir CSV
        </button>
        <button
          onClick={() => setActiveTab("images")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "images"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Subir Imágenes
        </button>
      </div>

      {activeTab === "csv" && (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Formato del CSV: <strong>nombre producto, id de la imagen</strong>
            </p>
          </div>

          {/* CSV Drag and Drop Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition"
          >
            <div className="space-y-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <div>
                <p className="text-gray-600">Arrastra tu archivo CSV aquí o</p>
                <label htmlFor="csvFileInput" className="cursor-pointer text-blue-600 hover:text-blue-500">
                  <span className="font-medium">haz clic para seleccionar</span>
                  <input
                    id="csvFileInput"
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Selected CSV File Info */}
          {selectedFile && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-800 font-medium">{selectedFile.name}</p>
                  <p className="text-blue-600 text-sm">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* CSV Upload Button */}
          <div className="text-center">
            <button
              onClick={handleCSVUpload}
              disabled={!selectedFile || uploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {uploading ? "Subiendo..." : "Subir CSV"}
            </button>
          </div>
        </div>
      )}

      {activeTab === "images" && (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Solo se permiten archivos PNG y JPEG
            </p>
          </div>

          {/* Images Drag and Drop Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition"
          >
            <div className="space-y-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div>
                <p className="text-gray-600">Arrastra tus imágenes aquí o</p>
                <label htmlFor="imagesInput" className="cursor-pointer text-blue-600 hover:text-blue-500">
                  <span className="font-medium">haz clic para seleccionar carpeta</span>
                  <input
                    id="imagesInput"
                    type="file"
                    accept=".png,.jpeg,.jpg"
                    multiple
                    webkitdirectory=""
                    onChange={handleImagesSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Selected Images Info */}
          {selectedImages.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-800 font-medium">{selectedImages.length} imágenes seleccionadas</p>
                  <p className="text-green-600 text-sm">
                    {(selectedImages.reduce((total, file) => total + file.size, 0) / 1024 / 1024).toFixed(2)} MB total
                  </p>
                </div>
                <button
                  onClick={() => setSelectedImages([])}
                  className="text-green-600 hover:text-green-800"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Images Upload Button */}
          <div className="text-center">
            <button
              onClick={handleImagesUpload}
              disabled={!selectedImages.length || uploading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {uploading ? "Subiendo..." : "Subir Imágenes"}
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {uploading && (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Procesando archivos...</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {uploadResult && (
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-green-900">
            <p className="font-medium">✅ {uploadResult.message}</p>
            <div className="mt-2 text-sm text-green-700">
              {uploadResult.filename && <p>Archivo: {uploadResult.filename}</p>}
              {uploadResult.size && <p>Tamaño: {(uploadResult.size / 1024).toFixed(2)} KB</p>}
              {uploadResult.rowsProcessed && <p>Filas procesadas: {uploadResult.rowsProcessed}</p>}
              {uploadResult.filesCount && <p>Archivos procesados: {uploadResult.filesCount}</p>}
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}