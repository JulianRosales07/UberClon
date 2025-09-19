import React, { useState } from 'react';
import { Search, Clock, Car, Bike, Calendar, User, Grid, Activity, UserCircle, Home, ArrowLeft, LogOut, Menu, X, MapPin, UserCheck } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface Location {
    lat: number;
    lng: number;
    address?: string;
}

interface QuickDestination {
    id: string;
    name: string;
    address: string;
    distance: string;
    price: number;
    estimatedTime: number;
    coordinates: { lat: number; lng: number };
}

interface HomeScreenProps {
    onGoToMap: () => void;
    onSearch: () => void;
    onQuickRide: (destination?: QuickDestination) => void;
    currentLocation?: Location | null;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
    onGoToMap,
    onSearch,
    onQuickRide
}) => {
    const { logout, user } = useAppStore();
    const [showQuickOptions, setShowQuickOptions] = useState(false);
    const [isSearchingDriver, setIsSearchingDriver] = useState(false);

    const services = [
        { id: 'ride', name: 'Viaje', icon: Car, hasOffer: true },
        { id: 'moto', name: 'Moto', icon: Bike, hasOffer: false },
        { id: 'reserve', name: 'Reserve', icon: Calendar, hasOffer: false },
        { id: 'teens', name: 'Teens', icon: User, hasOffer: false }
    ];

    const quickDestinations = [
        {
            id: '1',
            name: 'Unicentro',
            address: 'Centro Comercial Unicentro',
            distance: '1.6 km',
            price: 6500,
            estimatedTime: 6,
            coordinates: { lat: 1.216386, lng: -77.288671 }
        },
        {
            id: '2',
            name: 'Avenida de los Estudiantes',
            address: 'Avenida de los Estudiantes',
            distance: '750 m',
            price: 4500,
            estimatedTime: 3,
            coordinates: { lat: 1.226829, lng: -77.282465 }
        },
        {
            id: '3',
            name: 'Universidad Mariana',
            address: 'Universidad Mariana',
            distance: '150 m',
            price: 3500,
            estimatedTime: 1,
            coordinates: { lat: 1.223802, lng: -77.283742 }
        },
        {
            id: '4',
            name: 'Único',
            address: 'Centro Comercial Único',
            distance: '4.1 km',
            price: 12800,
            estimatedTime: 14,
            coordinates: { lat: 1.205879, lng: -77.260628 }
        },
        {
            id: '5',
            name: 'Tamasagra',
            address: 'Tamasagra',
            distance: '3.1 km',
            price: 10500,
            estimatedTime: 11,
            coordinates: { lat: 1.204400, lng: -77.293005 }
        },
        {
            id: '6',
            name: 'Estadio Libertad',
            address: 'Estadio Libertad',
            distance: '4.2 km',
            price: 13000,
            estimatedTime: 14,
            coordinates: { lat: 1.198087, lng: -77.278660 }
        },
        {
            id: '7',
            name: 'Parque Infantil',
            address: 'Parque Infantil',
            distance: '750 m',
            price: 4500,
            estimatedTime: 3,
            coordinates: { lat: 1.218915, lng: -77.281944 }
        },
        {
            id: '8',
            name: 'Alvernia',
            address: 'Alvernia',
            distance: '2.4 km',
            price: 8500,
            estimatedTime: 8,
            coordinates: { lat: 1.220019, lng: -77.298537 }
        }
    ];

    const handleServiceSelect = (serviceId: string) => {
        if (serviceId === 'ride') {
            onGoToMap();
        }
    };

    const handleLogout = () => {
        logout();
    };

    const handleDriverLogin = () => {
        logout(); // Cerrar sesión actual y volver a la página de inicio
    };

    const handleQuickRideClick = () => {
        setShowQuickOptions(true);
    };

    const handleQuickDestinationSelect = async (destination: QuickDestination) => {
        setShowQuickOptions(false);
        // En lugar de buscar conductor inmediatamente, ir al mapa para mostrar la ruta
        onQuickRide(destination);
    };

    return (
        <div className="h-screen bg-gray-50 flex flex-col">


            {/* Header */}
            <div className="bg-white px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">Uber</h1>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleDriverLogin}
                            className="bg-black text-white px-3 py-2 rounded-full hover:bg-gray-800 transition-colors flex items-center space-x-2 text-sm font-medium"
                            title="Iniciar sesión como conductor"
                        >
                            <UserCheck className="w-4 h-4" />
                            <span>Conductor</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            title="Cerrar sesión"
                        >
                            <LogOut className="w-6 h-6 text-gray-600" />
                        </button>
                        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <Menu className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="space-y-3 mb-4">
                    <button
                        onClick={onSearch}
                        className="w-full bg-gray-100 rounded-xl px-4 py-4 flex items-center justify-between"
                    >
                        <div className="flex items-center space-x-3">
                            <Search className="w-5 h-5 text-gray-600" />
                            <span className="text-gray-600 text-lg">¿A dónde vas?</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                            <div className="w-4 h-4 bg-black rounded-sm"></div>
                            <span className="text-sm text-gray-700 font-medium">Más tarde</span>
                        </div>
                    </button>

                    {/* Quick Ride Button */}
                    <button
                        onClick={handleQuickRideClick}
                        className="w-full bg-black text-white rounded-xl px-4 py-3 flex items-center justify-center space-x-2 font-medium"
                    >
                        <Car className="w-5 h-5" />
                        <span>Buscar conductor ahora</span>
                    </button>
                </div>

                {/* Current Location */}
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Centro de Pasto</h3>
                        <p className="text-sm text-gray-500">Ubicación Actual - Pasto, Nariño</p>
                    </div>
                </div>
            </div>

            {/* Services Section */}
            <div className="bg-white px-4 py-6 mt-2">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Sugerencias</h2>
                    <button className="text-sm text-gray-600">Ver todo</button>
                </div>

                <div className="grid grid-cols-4 gap-3">
                    {services.map((service) => (
                        <button
                            key={service.id}
                            onClick={() => handleServiceSelect(service.id)}
                            className="flex flex-col items-center space-y-2 p-2 rounded-lg hover:bg-gray-50 relative"
                        >
                            {service.hasOffer && (
                                <div className="absolute -top-1 -left-1 bg-green-500 text-white text-xs px-2 py-1 rounded-md font-medium">
                                    Oferta
                                </div>
                            )}
                            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                                {service.id === 'ride' && (
                                    <div className="text-2xl">🚗</div>
                                )}
                                {service.id === 'moto' && (
                                    <div className="text-2xl">🏍️</div>
                                )}
                                {service.id === 'reserve' && (
                                    <div className="text-2xl">🕐</div>
                                )}
                                {service.id === 'teens' && (
                                    <div className="text-2xl">👤</div>
                                )}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{service.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Promotion Banner */}
            <div className="bg-white mx-4 my-2 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-green-400 via-green-500 to-teal-400 p-6 relative">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 pr-4">
                            <h3 className="text-white font-bold text-lg mb-3 leading-tight">
                                El ahorro de 35% en Economy vence pronto.
                            </h3>
                            <button className="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold text-sm">
                                Reservar ahora
                            </button>
                        </div>
                        <div className="relative">
                            <div className="w-20 h-20 bg-green-300 bg-opacity-50 rounded-full flex items-center justify-center">
                                <div className="text-3xl">🚗</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Savings Section */}
            <div className="bg-white px-4 py-6 mt-2 flex-1">
                <h2 className="text-lg font-semibold mb-4">Ahorra a diario</h2>

                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-4 h-24 flex items-end">
                        <div className="text-white text-xs font-medium">Uber Pass</div>
                    </div>
                    <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-xl p-4 h-24 flex items-end">
                        <div className="text-white text-xs font-medium">Ofertas</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl p-4 h-24 flex items-end">
                        <div className="text-white text-xs font-medium">Rewards</div>
                    </div>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="bg-white border-t border-gray-100 px-4 py-3">
                <div className="flex justify-around">
                    <button className="flex flex-col items-center py-1">
                        <Home className="w-6 h-6 mb-1 text-black" />
                        <span className="text-xs font-medium text-black">Inicio</span>
                    </button>

                    <button className="flex flex-col items-center py-1">
                        <Grid className="w-6 h-6 mb-1 text-gray-400" />
                        <span className="text-xs text-gray-400">Opciones</span>
                    </button>

                    <button className="flex flex-col items-center py-1">
                        <Activity className="w-6 h-6 mb-1 text-gray-400" />
                        <span className="text-xs text-gray-400">Actividad</span>
                    </button>

                    <button className="flex flex-col items-center py-1">
                        <UserCircle className="w-6 h-6 mb-1 text-gray-400" />
                        <span className="text-xs text-gray-400">Cuenta</span>
                    </button>
                </div>
            </div>

            {/* Quick Ride Options Modal */}
            {showQuickOptions && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
                    <div className="bg-white w-full rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">¿A dónde quieres ir?</h2>
                            <button
                                onClick={() => setShowQuickOptions(false)}
                                className="p-2 rounded-full hover:bg-gray-100"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {quickDestinations.map((destination) => (
                                <button
                                    key={destination.id}
                                    onClick={() => handleQuickDestinationSelect(destination)}
                                    className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                                            <MapPin className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-semibold text-gray-900">{destination.name}</h3>
                                            <p className="text-sm text-gray-500">{destination.address}</p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <span className="text-xs text-gray-400">{destination.distance}</span>
                                                <span className="text-xs text-gray-300">•</span>
                                                <span className="text-xs text-gray-400">{destination.estimatedTime} min</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg text-gray-900">${destination.price.toLocaleString()}</p>
                                        <p className="text-xs text-gray-500">UberX</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    setShowQuickOptions(false);
                                    onSearch();
                                }}
                                className="w-full bg-gray-100 rounded-xl px-4 py-3 flex items-center justify-center space-x-2"
                            >
                                <Search className="w-5 h-5 text-gray-600" />
                                <span className="text-gray-700 font-medium">Buscar otro destino</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Searching Driver Modal */}
            {isSearchingDriver && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-3xl p-8 mx-4 max-w-sm w-full text-center">
                        <div className="mb-6">
                            <div className="w-20 h-20 bg-black rounded-full mx-auto mb-4 flex items-center justify-center">
                                <Car className="w-10 h-10 text-white animate-pulse" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Buscando conductor...</h3>
                            <p className="text-gray-600">Te conectaremos con un conductor cercano</p>
                        </div>

                        <div className="space-y-2 text-sm text-gray-500">
                            <p>• Buscando conductores disponibles</p>
                            <p>• Tiempo estimado: 2-5 minutos</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};