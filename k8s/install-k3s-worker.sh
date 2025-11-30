#!/bin/bash
# Script para instalar k3s en un nodo WORKER
# Este script debe ejecutarse en cada servidor que actuará como worker

set -e

echo "================================================"
echo "Instalando k3s en nodo WORKER"
echo "================================================"

# Solicitar información del master
read -p "Ingresa la URL del master (ej: https://192.168.1.100:6443): " K3S_URL
read -p "Ingresa el token del master: " K3S_TOKEN

echo ""
echo "Instalando k3s worker..."

# Instalar k3s como agente (worker)
curl -sfL https://get.k3s.io | K3S_URL=$K3S_URL K3S_TOKEN=$K3S_TOKEN sh -

echo ""
echo "✅ k3s worker instalado correctamente"
echo "================================================"
echo "Este nodo ahora forma parte del cluster"
echo "Verifica desde el master con: kubectl get nodes"
echo "================================================"
