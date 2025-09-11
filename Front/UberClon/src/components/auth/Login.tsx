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
  const [userType, setUserType] = useState<'passenger' | 'driver'>('passenger');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const { setUser } = useAppStore();

  const handleLogin = () => {
    if (!name || !email || !phone) return;

    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      phone,
      rating: 4.8,
      userType
    };

    setUser(user);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-black mb-2">Uber</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Bienvenido
          </h2>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* User Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ¿Cómo quieres usar Uber?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setUserType('passenger')}
                className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors ${
                  userType === 'passenger'
                    ? 'border-black bg-black text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Users className="w-8 h-8 mb-2" />
                <span className="font-medium">Pasajero</span>
              </button>
              
              <button
                onClick={() => setUserType('driver')}
                className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors ${
                  userType === 'driver'
                    ? 'border-black bg-black text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Car className="w-8 h-8 mb-2" />
                <span className="font-medium">Conductor</span>
              </button>
            </div>
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