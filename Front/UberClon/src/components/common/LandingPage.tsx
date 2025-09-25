import React from 'react';
import { Car, UserCheck } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const LandingPage: React.FC = () => {
    const { setShowLogin, setUser } = useAppStore();

    const handleDriverLogin = () => {
        setShowLogin('driver');
    };

    const [selectedService, setSelectedService] = React.useState<string | null>(null);
    const [showDestinationInput, setShowDestinationInput] = React.useState(false);

    const handleServiceSelect = (serviceId: string) => {
        setSelectedService(serviceId);
        // Solo mostrar el input de destino, no autenticar todavía
    };

    const handleDestinationSearch = () => {
        setShowDestinationInput(true);
    };

    const handleActualBooking = () => {
        // Solo aquí crear el usuario y autenticar cuando realmente quiera reservar
        const guestPassenger = {
            id: 'guest-passenger',
            name: 'Usuario',
            email: 'guest@uber.com',
            phone: '+57 300 000 0000',
            rating: 5.0,
            userType: 'passenger' as const
        };
        setUser(guestPassenger);
    };

    // Maneja el acceso/registro del pasajero.
    // Si createGuest es true, crea un usuario pasajero temporal (guest) y lo setea.
    // Si es false/omitido, abre el modal de login para pasajero.
    const handlePassengerAccess = (createGuest?: boolean) => {
        if (createGuest) {
            const guestPassenger = {
                id: 'guest-passenger',
                name: 'Usuario',
                email: 'guest@uber.com',
                phone: '+57 300 000 0000',
                rating: 5.0,
                userType: 'passenger' as const
            };
            setUser(guestPassenger);
            return;
        }

        // Mostrar el login para pasajero (si la app lo usa)
        setShowLogin('passenger');
    };

    const services = [
        { id: 'ride', name: 'Viaje', icon: '🚗' },
        { id: 'moto', name: 'Moto', icon: '🏍️' },
        { id: 'reserve', name: 'Reserve', icon: '🕐' },
        { id: 'teens', name: 'Teens', icon: '👤' }
    ];

    const offers = [
        { id: 'uber-pass', name: 'Uber Pass', color: 'from-blue-400 to-blue-600' },
        { id: 'ofertas', name: 'Ofertas', color: 'from-red-400 to-red-600' },
        { id: 'rewards', name: 'Rewards', color: 'from-orange-400 to-orange-600' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 overflow-hidden">
            {/* Header */}
            <div className="bg-white px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">Uber</h1>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleDriverLogin}
                            className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors flex items-center space-x-2 text-sm font-medium"
                        >
                            <UserCheck className="w-4 h-4" />
                            <span>Conductor</span>
                        </button>
                        <button
                            onClick={() => window.location.href = '/?driver-test=true'}
                            className="bg-blue-500 text-white px-3 py-2 rounded-full hover:bg-blue-600 transition-colors text-sm font-medium"
                            title="Modo de prueba para conductores"
                        >
                            🧪 Test
                        </button>
                        <button
                            onClick={() => window.location.href = '/?route-test=true'}
                            className="bg-green-500 text-white px-3 py-2 rounded-full hover:bg-green-600 transition-colors text-sm font-medium"
                            title="Prueba de rutas"
                        >
                            🗺️ Rutas
                        </button>
                        <button
                            onClick={() => window.location.href = '/?location-test=true'}
                            className="bg-purple-500 text-white px-3 py-2 rounded-full hover:bg-purple-600 transition-colors text-sm font-medium"
                            title="Prueba de ubicación"
                        >
                            📍 GPS
                        </button>
                        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="space-y-3 mb-4">
                    {!showDestinationInput ? (
                        <button
                            onClick={handleDestinationSearch}
                            className="w-full bg-gray-100 rounded-xl px-4 py-4 flex items-center justify-between hover:bg-gray-200 transition-colors"
                        >
                            <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <span className="text-gray-600 text-lg">¿A dónde vas?</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                                <div className="w-4 h-4 bg-black rounded-sm"></div>
                                <span className="text-sm text-gray-700 font-medium">Más tarde</span>
                            </div>
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <div className="bg-gray-100 rounded-xl px-4 py-4">
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="w-3 h-3 bg-black rounded-full"></div>
                                    <span className="text-gray-900 font-medium">Genoy, Pasto, Nariño</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                                    <input
                                        type="text"
                                        placeholder="¿A dónde vas?"
                                        className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 outline-none"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setShowDestinationInput(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleActualBooking}
                                    className="flex-1 bg-black text-white rounded-lg px-4 py-2 font-medium hover:bg-gray-800 transition-colors"
                                >
                                    Continuar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Quick Ride Button - solo mostrar si no está en modo de búsqueda */}
                    {!showDestinationInput && (
                        <button
                            onClick={handleDestinationSearch}
                            className="w-full bg-black text-white rounded-xl px-4 py-3 flex items-center justify-center space-x-2 font-medium hover:bg-gray-800 transition-colors"
                        >
                            <Car className="w-5 h-5" />
                            <span>Buscar conductor ahora</span>
                        </button>
                    )}
                </div>

                {/* Current Location */}
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Genoy</h3>
                        <p className="text-sm text-gray-500">Pasto, Nariño</p>
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
                            className={`flex flex-col items-center space-y-2 p-2 rounded-lg hover:bg-gray-50 relative transition-colors ${
                                selectedService === service.id ? 'bg-blue-50 border-2 border-blue-200' : ''
                            }`}
                        >
                            {service.id === 'ride' && (
                                <div className="absolute -top-1 -left-1 bg-green-500 text-white text-xs px-2 py-1 rounded-md font-medium">
                                    Oferta
                                </div>
                            )}
                            <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                                selectedService === service.id ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                                <div className="text-2xl">{service.icon}</div>
                            </div>
                            <span className={`text-sm font-medium ${
                                selectedService === service.id ? 'text-blue-700' : 'text-gray-900'
                            }`}>{service.name}</span>
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
                            <button
                                onClick={() => handlePassengerAccess(true)}
                                className="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
                            >
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
            <div className="bg-white px-4 py-6 mt-2">
                <h2 className="text-lg font-semibold mb-4">Ahorra a diario</h2>

                <div className="grid grid-cols-3 gap-3 mb-6">
                    {offers.map((offer) => (
                        <button
                            key={offer.id}
                            onClick={() => handlePassengerAccess()}
                            className={`bg-gradient-to-br ${offer.color} rounded-xl p-4 h-24 flex items-end hover:opacity-90 transition-opacity`}
                        >
                            <div className="text-white text-xs font-medium">{offer.name}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};