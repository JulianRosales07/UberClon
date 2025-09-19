# Módulo de Ubicaciones

Este módulo maneja la funcionalidad de ubicaciones para la aplicación UberClone, utilizando la API de Nominatim de OpenStreetMap.

## Características

- **Búsqueda de ubicaciones**: Buscar lugares por texto usando la API de Nominatim
- **Geocodificación inversa**: Obtener direcciones desde coordenadas
- **Cálculo de distancias**: Calcular distancia entre dos puntos usando la fórmula de Haversine
- **Cache local**: Almacenar ubicaciones frecuentemente buscadas en MongoDB

## API Endpoints

### GET /api/locations/search
Buscar ubicaciones por texto.

**Parámetros:**
- `query` (string, requerido): Texto a buscar
- `limit` (number, opcional): Límite de resultados (default: 5)

**Ejemplo:**
```
GET /api/locations/search?query=Plaza de Armas Lima&limit=5
```

### GET /api/locations/details/:lat/:lon
Obtener detalles de una ubicación por coordenadas.

**Parámetros:**
- `lat` (number): Latitud
- `lon` (number): Longitud

**Ejemplo:**
```
GET /api/locations/details/-12.0464/-77.0428
```

### POST /api/locations/distance
Calcular distancia entre dos puntos.

**Body:**
```json
{
  "originLat": -12.0464,
  "originLon": -77.0428,
  "destLat": -12.0500,
  "destLon": -77.0450
}
```

## Uso en el Frontend

### Buscar ubicaciones
```javascript
const searchLocations = async (query) => {
  try {
    const response = await fetch(`/api/locations/search?query=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error searching locations:', error);
  }
};
```

### Calcular distancia
```javascript
const calculateDistance = async (origin, destination) => {
  try {
    const response = await fetch('/api/locations/distance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        originLat: origin.lat,
        originLon: origin.lon,
        destLat: destination.lat,
        destLon: destination.lon
      })
    });
    const data = await response.json();
    return data.data.distance;
  } catch (error) {
    console.error('Error calculating distance:', error);
  }
};
```

## Configuración

### Variables de entorno
No se requieren variables de entorno adicionales. El módulo usa la API pública de Nominatim.

### Dependencias
- `axios`: Para realizar peticiones HTTP a la API de Nominatim
- `mongoose`: Para el modelo de datos de ubicaciones

## Limitaciones de la API de Nominatim

- **Rate limiting**: Máximo 1 petición por segundo
- **User-Agent**: Requerido en todas las peticiones
- **Uso justo**: No hacer peticiones masivas o automatizadas

## Mejoras futuras

1. **Cache inteligente**: Implementar cache Redis para mejorar el rendimiento
2. **Autocompletado**: Implementar sugerencias en tiempo real
3. **Favoritos**: Permitir a los usuarios guardar ubicaciones favoritas
4. **Historial**: Mantener historial de ubicaciones buscadas por usuario
5. **Validación avanzada**: Validar que las ubicaciones sean accesibles por vehículos