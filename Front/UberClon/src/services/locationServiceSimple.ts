// Servicio simplificado de ubicaciones sin dependencias problemáticas

export interface SimpleLocation {
  lat: number;
  lng: number;
  address?: string;
  place_id?: string;
  display_name?: string;
  type?: string;
  importance?: number;
}

// Función de búsqueda simplificada que funciona sin API por ahora
export const searchLocationsSimple = async (query: string, limit: number = 5): Promise<SimpleLocation[]> => {
  // Deshabilitar ubicaciones de prueba - devolver array vacío
  return [];
};