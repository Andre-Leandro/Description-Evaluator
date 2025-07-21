"use client";
import React, { useState } from "react";

export default function CSVUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
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

  const handleUpload = async () => {
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

      const response = await fetch(`${API_URL}/upload-csv`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al subir archivo");
      }

      const result = await response.json();
      setUploadResult(result);
      setSelectedFile(null);
      // Reset file input
      document.getElementById("csvFileInput").value = "";
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === "text/csv") {
      setSelectedFile(file);
      setError(null);
    } else {
      setError("Por favor arrastra un archivo CSV válido");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Subir Archivo CSV</h2>
        <p className="text-gray-600">Selecciona o arrastra un archivo CSV para subir al servidor</p>
      </div>

      {/* Drag and Drop Area */}
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

      {/* Selected File Info */}
      {selectedFile && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900">{selectedFile.name}</p>
              <p className="text-sm text-blue-700">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-blue-600 hover:text-blue-500"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="text-center">
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className={`px-6 py-3 rounded-lg font-medium transition ${
            !selectedFile || uploading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#a9cce3] text-white hover:bg-[#5499c7]"
          }`}
        >
          {uploading ? "Subiendo..." : "Subir Archivo"}
        </button>
      </div>

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
              <p>Archivo: {uploadResult.filename}</p>
              <p>Tamaño: {(uploadResult.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}