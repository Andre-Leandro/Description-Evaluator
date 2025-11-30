# 📚 Índice de Documentación - Kubernetes k3s

Bienvenido a la documentación completa de orquestación con k3s para el proyecto Description Evaluator.

## 🚀 Inicio Rápido

**¿Primera vez aquí? Empieza por:**

1. 📄 **[QUICKSTART.md](QUICKSTART.md)** - Guía rápida de 5 minutos
   - TL;DR con comandos esenciales
   - Pasos mínimos para deployment
   - Prueba rápida de HA

## 📖 Documentación Principal

### Para Despliegue Básico

2. 📘 **[README.md](README.md)** - Documentación completa paso a paso
   - Arquitectura del sistema
   - Instalación detallada de k3s
   - Configuración de todos los componentes
   - Pruebas de alta disponibilidad
   - Troubleshooting común
   - Comandos útiles

### Para Validación

3. ✅ **[VALIDATION.md](VALIDATION.md)** - Checklist de validación
   - Checklist paso a paso
   - Criterios de aceptación
   - Comandos de verificación
   - Certificación de cumplimiento

### Para Resumen Ejecutivo

4. 📊 **[SUMMARY.md](SUMMARY.md)** - Resumen ejecutivo
   - Qué se implementó
   - Cómo funciona la HA
   - Diagramas de arquitectura
   - Métricas clave
   - Evidencia de cumplimiento

### Para Producción

5. 🏭 **[PRODUCTION.md](PRODUCTION.md)** - Configuraciones avanzadas
   - Sealed Secrets
   - Persistencia con PVs
   - Network Policies
   - Observabilidad completa (Prometheus, Grafana, Jaeger)
   - CI/CD con GitHub Actions
   - Backups con Velero
   - Best practices

## 🗂️ Archivos de Configuración

### Manifiestos YAML Individuales

Usa estos archivos para despliegues modulares o cuando necesites editar componentes específicos:

| Archivo | Descripción | Componentes |
|---------|-------------|-------------|
| **[namespace.yaml](namespace.yaml)** | Namespace | `description-evaluator` namespace |
| **[redis-deployment.yaml](redis-deployment.yaml)** | Redis | Deployment, ConfigMap, Service |
| **[backend-deployment.yaml](backend-deployment.yaml)** | Backend | Deployment, Secret, ConfigMap, Service |
| **[frontend-deployment.yaml](frontend-deployment.yaml)** | Frontend | Deployment, ConfigMap, Service |
| **[ingress.yaml](ingress.yaml)** | Ingress | Traefik Ingress rules |
| **[hpa.yaml](hpa.yaml)** | Autoscaling | HPA para backend y frontend |
| **[pdb.yaml](pdb.yaml)** | Disruption | PodDisruptionBudgets |

### Manifiestos Consolidados

| Archivo | Descripción | Uso |
|---------|-------------|-----|
| **[all-in-one.yaml](all-in-one.yaml)** | Todos los manifiestos | Deploy completo con un solo archivo: `kubectl apply -f all-in-one.yaml` |

## 🔧 Scripts de Automatización

### Instalación de k3s

| Script | Descripción | Ejecutar en |
|--------|-------------|-------------|
| **[install-k3s-master.sh](install-k3s-master.sh)** | Instala k3s master | Nodo maestro |
| **[install-k3s-worker.sh](install-k3s-worker.sh)** | Une workers al cluster | Cada nodo worker |

### Despliegue y Validación

| Script | Descripción | Cuándo usar |
|--------|-------------|-------------|
| **[deploy.sh](deploy.sh)** | Despliega la aplicación completa | Después de instalar k3s |
| **[verify-installation.sh](verify-installation.sh)** | Verifica estado del cluster y app | Verificación post-instalación |
| **[test-memory-saturation.sh](test-memory-saturation.sh)** | Prueba HA con saturación de memoria | Demostración de HA |

## 📊 Flujo de Trabajo Recomendado

```
┌─────────────────────────────────────────────────────────────┐
│ 1. PREPARACIÓN                                              │
│    └─> Lee QUICKSTART.md o README.md                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. INSTALACIÓN DE K3S                                       │
│    ├─> Master: ./install-k3s-master.sh                     │
│    └─> Workers: ./install-k3s-worker.sh (en cada nodo)     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. CONFIGURACIÓN                                            │
│    └─> Edita backend-deployment.yaml (Secrets)             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. DESPLIEGUE                                               │
│    └─> ./deploy.sh                                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. VERIFICACIÓN                                             │
│    └─> ./verify-installation.sh                            │
│    └─> Sigue VALIDATION.md                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. PRUEBA DE HA                                             │
│    └─> ./test-memory-saturation.sh                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. PRODUCCIÓN (OPCIONAL)                                    │
│    └─> Implementa mejoras de PRODUCTION.md                 │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Casos de Uso por Documento

### "Quiero desplegar rápido"
→ **[QUICKSTART.md](QUICKSTART.md)**

### "Quiero entender todo el sistema"
→ **[README.md](README.md)**

### "Necesito validar que todo funcione"
→ **[VALIDATION.md](VALIDATION.md)**

### "Necesito reportar resultados"
→ **[SUMMARY.md](SUMMARY.md)**

### "Voy a producción"
→ **[PRODUCTION.md](PRODUCTION.md)**

### "Tengo un problema"
→ **[README.md](README.md)** → Sección Troubleshooting

## 🔍 Búsqueda Rápida

### Por Tema

**Instalación**
- Master: `install-k3s-master.sh` + `README.md` sección "Instalación"
- Workers: `install-k3s-worker.sh` + `README.md` sección "Instalación"

**Configuración**
- Secrets: `backend-deployment.yaml` + `README.md` sección "Configuración"
- Ingress: `ingress.yaml` + `README.md` sección "Ingress"

**Alta Disponibilidad**
- Concepto: `README.md` sección "HA" + `SUMMARY.md`
- Pruebas: `test-memory-saturation.sh` + `README.md` sección "Demostración"
- Validación: `VALIDATION.md` Fase 5

**Troubleshooting**
- `README.md` sección "Troubleshooting"
- `PRODUCTION.md` sección "Troubleshooting"

**Monitoreo**
- Básico: `README.md` sección "Monitoreo"
- Avanzado: `PRODUCTION.md` sección "Observabilidad"

**Seguridad**
- `PRODUCTION.md` sección "Seguridad"

## 📞 Soporte y Referencias

### Documentación Oficial
- [k3s Documentation](https://docs.k3s.io/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)

### Archivos de Ayuda en Este Proyecto
- Logs: Ver `README.md` comandos de logs
- Métricas: Ver `README.md` sección "Monitoreo"
- Validación: `verify-installation.sh`

## 🗺️ Mapa del Repositorio k8s/

```
k8s/
│
├── 📚 DOCUMENTACIÓN
│   ├── INDEX.md (este archivo) ← EMPIEZA AQUÍ
│   ├── QUICKSTART.md           ← Inicio rápido
│   ├── README.md               ← Guía completa
│   ├── VALIDATION.md           ← Checklist
│   ├── SUMMARY.md              ← Resumen ejecutivo
│   └── PRODUCTION.md           ← Producción avanzada
│
├── 📄 MANIFIESTOS INDIVIDUALES
│   ├── namespace.yaml
│   ├── redis-deployment.yaml
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── ingress.yaml
│   ├── hpa.yaml
│   └── pdb.yaml
│
├── 📦 MANIFIESTOS CONSOLIDADOS
│   └── all-in-one.yaml
│
└── 🔧 SCRIPTS
    ├── install-k3s-master.sh
    ├── install-k3s-worker.sh
    ├── deploy.sh
    ├── verify-installation.sh
    └── test-memory-saturation.sh
```

## ✨ Características Destacadas

### 🚀 Simplicidad
- Scripts automatizados para todo
- Documentación clara paso a paso
- Comandos copy-paste listos

### 🛡️ Alta Disponibilidad
- 3 réplicas de backend
- Anti-affinity entre nodos
- Health checks automáticos
- Failover en <30 segundos

### 📊 Observabilidad
- Métricas con metrics-server
- Logs centralizados
- Eventos de Kubernetes

### 🔒 Seguridad
- Secrets para credenciales
- RBAC por defecto
- Network isolation con namespaces

### 📈 Escalabilidad
- HPA automático
- Scaling manual simple
- Agregar nodos on-demand

## 🎓 Niveles de Experiencia

### Principiante
1. Lee **QUICKSTART.md**
2. Sigue los comandos exactamente
3. Usa `verify-installation.sh` para validar
4. Si hay problemas, revisa **README.md** Troubleshooting

### Intermedio
1. Lee **README.md** completo
2. Entiende cada componente
3. Personaliza los YAMLs según necesites
4. Sigue **VALIDATION.md** para validación completa

### Avanzado
1. Implementa **PRODUCTION.md**
2. Personaliza la arquitectura
3. Agrega observabilidad completa
4. Implementa CI/CD

## 🏆 Checklist de Dominio

- [ ] Instalé k3s en master y workers
- [ ] Desplegué la aplicación con todos los componentes
- [ ] Verifiqué que los pods están distribuidos en diferentes nodos
- [ ] Probé el failover con saturación de memoria
- [ ] El servicio se mantuvo disponible durante la prueba
- [ ] Entiendo cómo funciona HPA
- [ ] Sé cómo ver logs y métricas
- [ ] Puedo escalar la aplicación manualmente
- [ ] Completé VALIDATION.md

**Si marcaste todos ✅, eres un experto en k3s HA! 🎉**

---

## 📬 Contribuciones

Si encuentras mejoras o tienes sugerencias:
1. Documenta el cambio
2. Actualiza los archivos relevantes
3. Verifica con `verify-installation.sh`
4. Actualiza este índice si es necesario

---

**¡Gracias por usar esta documentación! Los perritos te lo agradecen 🐕💚**
