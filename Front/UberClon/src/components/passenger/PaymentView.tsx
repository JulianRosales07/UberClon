import React, { useState } from 'react';
import { Star, CreditCard, Smartphone, DollarSign, Check, ArrowLeft, Receipt, Gift } from 'lucide-react';
import { Button } from '../common/Button';
import { useAppStore } from '../../store/useAppStore';

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface Trip {
  id: string;
  passengerId: string;
  driverId?: string;
  pickup: Location;
  destination: Location;
  status: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  fare: number;
  estimatedTime: number;
  distance: number;
  createdAt: Date;
  completedAt?: Date;
}

interface PaymentViewProps {
  trip: Trip;
  onPaymentComplete: () => void;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'cash' | 'digital';
  name: string;
  details: string;
  icon: React.ReactNode;
  available: boolean;
}

export const PaymentView: React.FC<PaymentViewProps> = ({ trip, onPaymentComplete }) => {
  const { setCurrentTrip } = useAppStore();
  const [selectedPayment, setSelectedPayment] = useState<string>('card1');
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [tip, setTip] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card1',
      type: 'card',
      name: 'Tarjeta de Crédito',
      details: '**** **** **** 1234',
      icon: <CreditCard className="w-5 h-5" />,
      available: true
    },
    {
      id: 'card2',
      type: 'card',
      name: 'Tarjeta de Débito',
      details: '**** **** **** 5678',
      icon: <CreditCard className="w-5 h-5" />,
      available: true
    },
    {
      id: 'digital1',
      type: 'digital',
      name: 'Nequi',
      details: 'Cuenta vinculada',
      icon: <Smartphone className="w-5 h-5" />,
      available: true
    },
    {
      id: 'cash',
      type: 'cash',
      name: 'Efectivo',
      details: 'Pagar al conductor',
      icon: <DollarSign className="w-5 h-5" />,
      available: true
    }
  ];

  const tipOptions = [0, 1000, 2000, 3000, 5000];

  const totalAmount = trip.fare + tip;

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simular procesamiento de pago
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsProcessing(false);
    setPaymentComplete(true);
    
    // Completar el viaje después de mostrar confirmación
    setTimeout(() => {
      onPaymentComplete();
    }, 2000);
  };

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  if (paymentComplete) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-green-50 p-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">¡Pago Exitoso!</h2>
          <p className="text-green-700 mb-4">Tu viaje ha sido completado</p>
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <p className="text-gray-600">Total pagado:</p>
            <p className="text-2xl font-bold text-gray-900">${totalAmount.toLocaleString()}</p>
          </div>
          <p className="text-sm text-green-600">
            Recibirás un recibo por email
          </p>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-blue-50 p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-bold text-blue-800 mb-2">Procesando pago...</h2>
          <p className="text-blue-700">Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <button
          onClick={() => setCurrentTrip(null)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold">Pago del viaje</h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Trip Summary */}
        <div className="bg-white p-6 mb-4">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <Receipt className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Viaje completado</h3>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString()} • {trip.distance} km
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Tarifa base:</span>
              <span className="font-semibold">${(trip.fare - 3000).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tarifa mínima:</span>
              <span className="font-semibold">$3,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Distancia ({trip.distance} km):</span>
              <span className="font-semibold">${((trip.fare - 3000)).toLocaleString()}</span>
            </div>
            {tip > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Propina:</span>
                <span className="font-semibold">+${tip.toLocaleString()}</span>
              </div>
            )}
            <hr className="my-2" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Driver Rating */}
        <div className="bg-white p-6 mb-4">
          <h3 className="font-semibold text-gray-900 mb-4">Califica tu viaje</h3>
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-lg">👨‍💼</span>
            </div>
            <div>
              <h4 className="font-semibold">Juan Carlos Pérez</h4>
              <p className="text-sm text-gray-500">Toyota Corolla Blanco</p>
            </div>
          </div>

          <div className="flex justify-center space-x-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRatingClick(star)}
                className="p-1"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comparte tu experiencia (opcional)"
            className="w-full p-3 border border-gray-300 rounded-lg resize-none"
            rows={3}
          />
        </div>

        {/* Tip Selection */}
        <div className="bg-white p-6 mb-4">
          <div className="flex items-center space-x-2 mb-4">
            <Gift className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Agregar propina</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {tipOptions.map((tipAmount) => (
              <button
                key={tipAmount}
                onClick={() => setTip(tipAmount)}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  tip === tipAmount
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {tipAmount === 0 ? 'Sin propina' : `$${tipAmount.toLocaleString()}`}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 mb-4">
          <h3 className="font-semibold text-gray-900 mb-4">Método de pago</h3>
          
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                disabled={!method.available}
                className={`w-full flex items-center space-x-4 p-4 rounded-lg border transition-colors ${
                  selectedPayment === method.id
                    ? 'border-blue-500 bg-blue-50'
                    : method.available
                    ? 'border-gray-300 hover:border-gray-400'
                    : 'border-gray-200 bg-gray-50 opacity-50'
                }`}
              >
                <div className={`${
                  selectedPayment === method.id ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {method.icon}
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-medium text-gray-900">{method.name}</h4>
                  <p className="text-sm text-gray-500">{method.details}</p>
                </div>
                {selectedPayment === method.id && (
                  <Check className="w-5 h-5 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Button */}
      <div className="bg-white p-6 border-t border-gray-200">
        <Button
          onClick={handlePayment}
          disabled={rating === 0}
          className="w-full text-lg py-4"
        >
          {rating === 0 
            ? 'Califica para continuar' 
            : `Pagar $${totalAmount.toLocaleString()}`
          }
        </Button>
        
        {rating === 0 && (
          <p className="text-sm text-gray-500 text-center mt-2">
            Por favor califica tu experiencia antes de pagar
          </p>
        )}
      </div>
    </div>
  );
};