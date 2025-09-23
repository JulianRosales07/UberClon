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
  // Ubicaciones predefinidas de Pasto
  const pastoLocations: SimpleLocation[] = [
    { lat: 1.216386, lng: -77.288671, address: 'Centro Comercial Unicentro, Pasto', display_name: 'Centro Comercial Unicentro, Pasto' },
    { lat: 1.226829, lng: -77.282465, address: 'Avenida de los Estudiantes, Pasto', display_name: 'Avenida de los Estudiantes, Pasto' },
    { lat: 1.223802, lng: -77.283742, address: 'Universidad Mariana, Pasto', display_name: 'Universidad Mariana, Pasto' },
    { lat: 1.205879, lng: -77.260628, address: 'Centro Comercial Único, Pasto', display_name: 'Centro Comercial Único, Pasto' },
    { lat: 1.204400, lng: -77.293005, address: 'Tamasagra, Pasto', display_name: 'Tamasagra, Pasto' },
    { lat: 1.198087, lng: -77.278660, address: 'Estadio Libertad, Pasto', display_name: 'Estadio Libertad, Pasto' },
    { lat: 1.218915, lng: -77.281944, address: 'Parque Infantil, Pasto', display_name: 'Parque Infantil, Pasto' },
    { lat: 1.220019, lng: -77.298537, address: 'Alvernia, Pasto', display_name: 'Alvernia, Pasto' },
    { lat: 1.223789, lng: -77.283255, address: 'Centro de Pasto, Nariño', display_name: 'Centro de Pasto, Nariño' },
    { lat: 1.214567, lng: -77.275432, address: 'Terminal de Transportes, Pasto', display_name: 'Terminal de Transportes, Pasto' }
  ];

  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 300));

  // Filtrar por query
  const filtered = pastoLocations.filter(location =>
    location.address?.toLowerCase().includes(query.toLowerCase()) ||
    location.display_name?.toLowerCase().includes(query.toLowerCase())
  );

  return filtered.slice(0, limit);
};