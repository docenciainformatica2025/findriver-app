# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

## [1.3.1] - 2025-12-11
### Corregido
- **Cálculo de Ingreso por Km:** Solucionado error crítico donde el valor se mostraba como $0.
    - Se implementó búsqueda robusta de fecha local (`YYYY-MM-DD`) en el historial del backend para evitar errores de zona horaria.
    - Se corrigió bug de variable no utilizada en `useAdvancedCalculations.js`.
- **Estandarización de Versión:** Unificada la etiqueta de versión a `1.3.1` en Login, Perfil y Modales.
- **Limpieza:** Eliminado código de depuración visible (Debug Footer) de producción.

### Añadido
- **Backend:** Lógica de agregación diaria de kilómetros (`totalKm`) en `statsController.js`.
- **Backend:** Objeto explícito `today` en la respuesta de estadísticas.

## [1.3.0] - 2025-12-10
### Corregido
- **Cálculo CPK (Costo por Km):** Reescribí la lógica de `statsController.js` para usar filtrado en memoria y evitar errores de índices compuestos en Firestore.
- **Dashboard:** El panel ahora consume datos autoritativos del backend (`/stats/cpk`) en lugar de realizar cálculos locales incompletos.

### Seguridad
- **Inyección de Datos:** Scripts de prueba actualizados para dirigirse específicamente al usuario logueado (`antonio_rburgos@msn.com`) y no a usuarios de prueba genéricos.

## [1.0.2] - 2025-12-01
### Base
- Versión inicial estable con funcionalidades básicas de registro de ingresos y gastos.
