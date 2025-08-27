# Imagen base de Python
FROM python:3.11-slim

# Crear un directorio de trabajo en el contenedor
WORKDIR /backend

# Copiar requirements.txt al contenedor
COPY requirements.txt .

# Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código de la API
COPY . .

# Exponer el puerto donde correrá Flask
EXPOSE 5000

# Variable de entorno para Flask
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0

# Comando para arrancar la API
CMD ["flask", "run"]
