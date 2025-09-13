import React, { useState } from 'react';
import { Button } from '../common/Button';
import { useAppStore } from '../../store/useAppStore';
import { Car, Users } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  rating: number;
  userType: 'passenger' | 'driver';
}

export const Login: React.FC = () => {
  const { setUser, setShowLogin } = useAppStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleLogin = () => {
    if (!name || !email || !phone) return;

    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      phone,
      rating: 4.8,
      userType: 'driver' // Solo para conductores
    };

    setUser(user);
  };

  const handleBack = () => {
    setShowLogin(null); // Volver a la página principal
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-4xl font-bold text-black">Uber</h1>
            <div className="w-10"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Iniciar sesión como Conductor
          </h2>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Driver Icon */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-black rounded-full mx-auto flex items-center justify-center mb-4">
              <Car className="w-10 h-10 text-white" />
            </div>
            <p className="text-gray-600">Ingresa tus datos para comenzar a conducir</p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre completo
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-black focus:border-black"
                placeholder="Tu nombre completo"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-black focus:border-black"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-black focus:border-black"
                placeholder="+57 300 123 4567"
              />
            </div>
          </div>

          <div className="mt-6">
            <Button
              onClick={handleLogin}
              className="w-full"
              disabled={!name || !email || !phone}
            >
              Continuar
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};