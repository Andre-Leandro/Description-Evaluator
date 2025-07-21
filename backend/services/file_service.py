import os
import pandas as pd
from datetime import datetime

class FileService:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    @staticmethod
    def save_uploaded_csv(file_data, filename=None):
        """Save uploaded CSV file and return file info"""
        try:
            if filename is None:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"archivo_recibido_{timestamp}.csv"
            
            # Ensure csv directory exists
            csv_dir = os.path.join(FileService.BASE_DIR, "csv")
            os.makedirs(csv_dir, exist_ok=True)
            
            # Save file
            file_path = os.path.join(csv_dir, filename)

            # If file_data is bytes, save directly
            if isinstance(file_data, bytes):
                # Comentado todo el bloque de escritura
                # with open(file_path, 'wb') as f:
                #     print("Saving file to directory:", csv_dir)
                #     f.write(file_data)
                print("Debug: Skipping file write for bytes")
            else:
                # Comentado todo el bloque de escritura
                # with open(file_path, 'wb') as f:
                #     print("Saving file to directory:", csv_dir)
                #     f.write(file_data.read())
                print("Debug: Skipping file write for file object")
            
            return {
                "filename": filename,
                "path": file_path,
                "size": 0,  # Cambiado a 0 ya que no se escribe el archivo
                "message": f"Archivo {filename} NO guardado (modo debug)"
            }
        except Exception as e:
            raise Exception(f"Error al guardar archivo: {str(e)}")
    
    @staticmethod
    def read_csv_local(filename):
        """Read local CSV file"""
        file_path = os.path.join(FileService.BASE_DIR, filename)
        return pd.read_csv(file_path)