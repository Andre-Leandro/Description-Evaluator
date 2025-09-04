"use client";
import React, { useState } from "react";

export default function CSVUpload() {
  const [activeTab, setActiveTab] = useState("products");
  const [productImportMethod, setProductImportMethod] = useState("csv");
  const [imageImportMethod, setImageImportMethod] = useState("local");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [dbConnectionString, setDbConnectionString] = useState("");
  const [s3Config, setS3Config] = useState({
    accessKeyId: "",
    secretAccessKey: "",
    region: "",
    bucketName: ""
  });
  
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
  
  const handleS3Upload = async () => {
    // Validar campos de S3
    if (!s3Config.accessKeyId || !s3Config.secretAccessKey || !s3Config.region || !s3Config.bucketName) {
      setError("Por favor completa todos los campos de configuración de S3");
      return;
    }
    
    setUploading(true);
    setError(null);
    setUploadResult(null);
    
    try {
      // Aquí iría la lógica real para subir a S3
      // Simulamos por ahora
      console.log("Conectando a S3 con:", s3Config);
      
      setTimeout(() => {
        setUploadResult({
          message: "Conexión a S3 configurada exitosamente",
          bucketName: s3Config.bucketName,
          region: s3Config.region
        });
        setUploading(false);
      }, 2000);
      
    } catch (err) {
      setError(err.message || "Error al conectar con Amazon S3");
      setUploading(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    
    if (activeTab === "products") {
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
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Cargar Datos</h2>
            <p className="text-gray-600">Selecciona el tipo de archivo que deseas subir</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "products"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Subir Productos
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

          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex justify-center gap-4 mb-4">
                <button
                  onClick={() => setProductImportMethod("csv")}
                  className={`flex items-center gap-2 px-4 py-3 rounded-md border ${
                    productImportMethod === "csv" 
                      ? "bg-blue-50 border-blue-300 text-blue-700" 
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="font-medium">Cargar archivo CSV</span>
                </button>
                <button
                  onClick={() => setProductImportMethod("db")}
                  className={`flex items-center gap-2 px-4 py-3 rounded-md border ${
                    productImportMethod === "db" 
                      ? "bg-blue-50 border-blue-300 text-blue-700" 
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7zm0 5h16" />
                  </svg>
                  <span className="font-medium">Conectar a Base de Datos</span>
                </button>
              </div>

              {productImportMethod === "csv" && (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">
                      Formato del CSV: <strong>nombre_producto, id_imagen</strong>
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
                      className="px-6 py-2 bg-[#5A8CD3] text-white rounded-lg hover:bg-[#4A7AB8] disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                    >
                      {uploading ? "Subiendo..." : "Subir CSV"}
                    </button>
                  </div>
                </div>
              )}
              
              {productImportMethod === "db" && (
                <div className="space-y-6 max-w-2xl mx-auto pt-2">
                 
                  
                  <div className="space-y-2">
                    <div>
                      <input
                        id="connection-string"
                        type="text"
                        placeholder="postgresql://user:password@host:port/database"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={dbConnectionString}
                        onChange={(e) => setDbConnectionString(e.target.value)}
                      />
                      <p className="mt-1 text-xs text-gray-500 pt-3 pb-1">
                        Introduce los datos de conexión de tu base de datos.
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-2 border-t border-gray-200 pt-4">
                      <h4 className="font-medium text-gray-800">Requisitos de la base de datos:</h4>
                      <ul className="space-y-1 text-sm text-gray-600 list-disc pl-5">
                        <li>La tabla debe contener columnas: <strong>nombre_producto, id_imagen</strong></li>
                        <li>El formato de fecha debe ser YYYY-MM-DD</li>
                      </ul>
                    </div>
                    
                    <div className="pt-4 flex justify-center">
                      <button
                        onClick={() => {
                          // Aquí iría la lógica para conectar a la DB
                          console.log("Conectando a DB:", dbConnectionString);
                        }}
                        disabled={!dbConnectionString || uploading}
                        className="px-6 py-2 bg-[#5A8CD3] text-white rounded-lg hover:bg-[#4A7AB8] disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                      >
                        Conectar a Base de Datos
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "images" && (
            <div className="space-y-6">
              <div className="flex justify-center gap-4 mb-4">
                <button
                  onClick={() => setImageImportMethod("local")}
                  className={`flex items-center gap-2 px-4 py-3 rounded-md border ${
                    imageImportMethod === "local" 
                      ? "bg-blue-50 border-blue-300 text-blue-700" 
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">Cargar imágenes locales</span>
                </button>
                <button
                  onClick={() => setImageImportMethod("s3")}
                  className={`flex items-center gap-2 px-4 py-3 rounded-md border ${
                    imageImportMethod === "s3" 
                      ? "bg-blue-50 border-blue-300 text-blue-700" 
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                  <span className="font-medium">Conectar a Amazon S3</span>
                </button>
              </div>

              {imageImportMethod === "local" && (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">
                      Se permiten archivos PNG, JPEG, JPG, WEBP, TIFF, BMP
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
                      className="px-6 py-2 bg-[#5A8CD3] text-white rounded-lg hover:bg-[#4A7AB8] disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                    >
                      {uploading ? "Subiendo..." : "Subir Imágenes"}
                    </button>
                  </div>
                </div>
              )}
              
              {imageImportMethod === "s3" && (
                <div className="space-y-6 max-w-2xl mx-auto">
                
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="access-key-id" className="block text-sm font-medium text-gray-700 mb-1">
                          Access Key ID
                        </label>
                        <input
                          id="access-key-id"
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={s3Config.accessKeyId}
                          onChange={(e) => setS3Config({...s3Config, accessKeyId: e.target.value})}
                        />
                      </div>
                      <div>
                        <label htmlFor="secret-access-key" className="block text-sm font-medium text-gray-700 mb-1">
                          Secret Access Key
                        </label>
                        <input
                          id="secret-access-key"
                          type="password"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={s3Config.secretAccessKey}
                          onChange={(e) => setS3Config({...s3Config, secretAccessKey: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                          Región de AWS
                        </label>
                        <select
                          id="region"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={s3Config.region}
                          onChange={(e) => setS3Config({...s3Config, region: e.target.value})}
                        >
                          <option value="">Selecciona una región</option>
                          <option value="us-east-1">US East (N. Virginia)</option>
                          <option value="us-east-2">US East (Ohio)</option>
                          <option value="us-west-1">US West (N. California)</option>
                          <option value="us-west-2">US West (Oregon)</option>
                          <option value="eu-west-1">EU (Ireland)</option>
                          <option value="eu-central-1">EU (Frankfurt)</option>
                          <option value="sa-east-1">South America (São Paulo)</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="bucket-name" className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre del Bucket
                        </label>
                        <input
                          id="bucket-name"
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={s3Config.bucketName}
                          onChange={(e) => setS3Config({...s3Config, bucketName: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 border-t border-gray-200 pt-4">
                      <h4 className="font-medium text-gray-800">Información importante:</h4>
                      <ul className="space-y-1 text-sm text-gray-600 list-disc pl-5">
                        <li>Asegúrate de que tu bucket tenga los permisos adecuados configurados</li>
                        <li>Las imágenes deben estar en formato PNG, JPEG o JPG</li>
                        <li>Recomendamos usar una política IAM con acceso limitado</li>
                      </ul>
                    </div>
                    
                    <div className="pt-4 flex justify-center">
                      <button
                        onClick={handleS3Upload}
                        disabled={!s3Config.accessKeyId || !s3Config.secretAccessKey || !s3Config.region || !s3Config.bucketName || uploading}
                        className="px-6 py-2 bg-[#5A8CD3] text-white rounded-lg hover:bg-[#4A7AB8] disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                      >
                        Conectar a S3
                      </button>
                    </div>
                  </div>
                </div>
              )}
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