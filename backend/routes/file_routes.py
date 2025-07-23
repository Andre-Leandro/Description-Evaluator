from flask import Blueprint, jsonify, request
from services.file_service import FileService

file_routes = Blueprint('files', __name__)

@file_routes.route('/upload-csv', methods=['POST'])
def upload_csv():
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({"error": "No se encontró archivo en la petición"}), 400
        
        file = request.files['file']
        
        # Check if file was selected
        if file.filename == '':
            return jsonify({"error": "No se seleccionó ningún archivo"}), 400
        
        # Check if file is CSV
        if not file.filename.lower().endswith('.csv'):
            return jsonify({"error": "El archivo debe ser formato CSV"}), 400
        
        # Save the file
        result = FileService.save_uploaded_csv(file, file.filename)
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"❌ Error al subir archivo: {e}")
        return jsonify({"error": str(e)}), 500