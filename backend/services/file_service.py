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
                with open(file_path, 'wb') as f:
                    f.write(file_data)
            else:
                # If it's a file object, save its content
                with open(file_path, 'wb') as f:
                    f.write(file_data.read())
            
            return {
                "filename": filename,
                "path": file_path,
                "size": os.path.getsize(file_path),
                "message": f"Archivo {filename} guardado correctamente"
            }
        except Exception as e:
            raise Exception(f"Error al guardar archivo: {str(e)}")
    
    @staticmethod
    def read_csv_local(filename):
        """Read local CSV file"""
        file_path = os.path.join(FileService.BASE_DIR, filename)
        return pd.read_csv(file_path)