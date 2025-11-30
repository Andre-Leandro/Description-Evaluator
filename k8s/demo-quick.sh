#!/bin/bash
# 🎯 SCRIPT DE DEMO RÁPIDA - Demostración de Alta Disponibilidad con botón web

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

clear
echo -e "${GREEN}${BOLD}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║      🎯  DEMO KUBERNETES - ALTA DISPONIBILIDAD  🎯            ║
║                                                               ║
║  Demostración visual desde la aplicación web                 ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo -e "${CYAN}📋 GUÍA PARA LA DEMO:${NC}"
echo ""
echo "1. Abre en una terminal:"
echo -e "   ${YELLOW}kubectl get pods -n description-evaluator -w${NC}"
echo ""
echo "2. Abre en tu navegador:"
echo -e "   ${YELLOW}http://localhost:8080${NC}"
echo ""
echo "3. En la página principal verás un panel naranja:"
echo "   '🎯 Demo de Alta Disponibilidad (Kubernetes)'"
echo ""
echo "4. Haz clic en el botón: 💣 Saturar Memoria del Pod"
echo ""
echo "5. En la terminal verás:"
echo "   - Un pod pasará de Running → OOMKilled"
echo "   - Kubernetes creará uno nuevo automáticamente"
echo "   - La app sigue funcionando (sin downtime)"
echo ""
echo "6. Vuelve al navegador y verás:"
echo "   - Un mensaje confirmando que el pod fue saturado"
echo "   - Instrucciones para verificar en kubectl"
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

read -p "¿Abrir la terminal con kubectl y el navegador? (s/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Ss]$ ]]; then
    # Abrir terminal con kubectl watch
    osascript <<EOF
tell application "Terminal"
    do script "cd $(pwd) && kubectl get pods -n description-evaluator -w"
    activate
end tell
EOF
    
    sleep 2
    
    # Abrir navegador
    open http://localhost:8080
    
    echo ""
    echo -e "${GREEN}✅ Terminal y navegador abiertos!${NC}"
    echo ""
    echo -e "${CYAN}Ahora haz clic en el botón de la web y observa la terminal${NC}"
fi

echo ""
echo -e "${YELLOW}💡 TIPS:${NC}"
echo "• Usa dos pantallas: una para la terminal, otra para el navegador"
echo "• Comparte pantalla mostrando ambas ventanas"
echo "• Explica que los otros 2 pods siguen funcionando"
echo "• Menciona que la app nunca dejó de responder"
echo ""
