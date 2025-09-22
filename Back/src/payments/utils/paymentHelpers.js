const validatePaymentAmount = (amount) => {
  if (typeof amount !== 'number' || amount <= 0) {
    return { isValid: false, error: 'El monto debe ser un número mayor a 0' };
  }

  if (amount > 10000) {
    return { isValid: false, error: 'El monto excede el límite máximo permitido ($10,000)' };
  }

  return { isValid: true };
};

const validatePaymentMethod = (paymentMethod, paymentDetails) => {
  const validMethods = ['cash', 'card', 'digital_wallet'];
  
  if (!validMethods.includes(paymentMethod)) {
    return { 
      isValid: false, 
      error: `Método de pago inválido. Métodos válidos: ${validMethods.join(', ')}` 
    };
  }

  // Validaciones específicas por método
  if (paymentMethod === 'card') {
    if (!paymentDetails || !paymentDetails.cardLast4 || !paymentDetails.cardBrand) {
      return { 
        isValid: false, 
        error: 'Detalles de tarjeta son requeridos (cardLast4, cardBrand)' 
      };
    }

    if (paymentDetails.cardLast4.length !== 4 || !/^\d{4}$/.test(paymentDetails.cardLast4)) {
      return { 
        isValid: false, 
        error: 'cardLast4 debe ser exactamente 4 dígitos' 
      };
    }
  }

  if (paymentMethod === 'digital_wallet') {
    if (!paymentDetails || !paymentDetails.walletType) {
      return { 
        isValid: false, 
        error: 'Tipo de billetera es requerido para pagos con billetera digital' 
      };
    }
  }

  return { isValid: true };
};
