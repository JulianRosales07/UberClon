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

const calculatePlatformFee = (amount, feePercentage = 20) => {
  const fee = amount * (feePercentage / 100);
  return Math.round(fee * 100) / 100;
};

const calculateDriverEarnings = (amount, platformFee) => {
  const earnings = amount - platformFee;
  return Math.round(earnings * 100) / 100;
};

const generateTransactionId = (paymentMethod, paymentId) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 6);
  const method = paymentMethod.substring(0, 4).toUpperCase();
  
  return `${method}_${timestamp}_${random}`;
};

const generateRefundId = (originalTransactionId) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 4);
  
  return `REFUND_${timestamp}_${random}`;
};

const canProcessRefund = (payment) => {
  if (payment.status !== 'completed') {
    return { canRefund: false, reason: 'Solo se pueden reembolsar pagos completados' };
  }

  if (payment.refundedAt) {
    return { canRefund: false, reason: 'Este pago ya fue reembolsado' };
  }

  // Verificar si han pasado más de 30 días
  const daysSincePayment = (new Date() - new Date(payment.processedAt)) / (1000 * 60 * 60 * 24);
  if (daysSincePayment > 30) {
    return { canRefund: false, reason: 'No se pueden reembolsar pagos de más de 30 días' };
  }

  return { canRefund: true };
};

const simulatePaymentProcessing = async (paymentMethod, amount, paymentDetails) => {
  // Simulación de procesamiento de pagos
  // En producción, aquí integrarías con Stripe, PayPal, etc.
  
  return new Promise((resolve) => {
    setTimeout(() => {
      let successRate;
      
      switch (paymentMethod) {
        case 'cash':
          successRate = 1.0; // 100% éxito para efectivo
          break;
        case 'card':
          successRate = 0.95; // 95% éxito para tarjetas
          break;
        case 'digital_wallet':
          successRate = 0.98; // 98% éxito para billeteras digitales
          break;
        default:
          successRate = 0.9;
      }

      const isSuccess = Math.random() < successRate;
      
      if (isSuccess) {
        resolve({
          success: true,
          transactionId: generateTransactionId(paymentMethod, Date.now()),
          processedAt: new Date()
        });
      } else {
        const errors = {
          card: ['Tarjeta declinada', 'Fondos insuficientes', 'Tarjeta expirada'],
          digital_wallet: ['Fondos insuficientes', 'Cuenta suspendida', 'Error de conexión']
        };
        
        const errorMessages = errors[paymentMethod] || ['Error de procesamiento'];
        const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)];
        
        resolve({
          success: false,
          error: randomError
        });
      }
    }, 1000 + Math.random() * 2000); // Simular delay de 1-3 segundos
  });
};

const simulateRefundProcessing = async (payment) => {
  // Simulación de procesamiento de reembolsos
  return new Promise((resolve) => {
    setTimeout(() => {
      const successRate = payment.paymentMethod === 'cash' ? 1.0 : 0.97;
      const isSuccess = Math.random() < successRate;
      
      if (isSuccess) {
        resolve({
          success: true,
          refundId: generateRefundId(payment.transactionId),
          processedAt: new Date()
        });
      } else {
        resolve({
          success: false,
          error: 'Error al procesar reembolso. Intente nuevamente.'
        });
      }
    }, 500 + Math.random() * 1500); // Delay de 0.5-2 segundos
  });
};

const formatPaymentForResponse = (payment) => {
  const paymentObject = payment.toObject ? payment.toObject() : payment;
  
  return {
    ...paymentObject,
    amount: Math.round(paymentObject.amount * 100) / 100,
    platformFee: Math.round(paymentObject.platformFee * 100) / 100,
    driverEarnings: Math.round(paymentObject.driverEarnings * 100) / 100,
    // Ocultar información sensible de tarjetas
    paymentDetails: paymentObject.paymentMethod === 'card' ? {
      cardLast4: paymentObject.paymentDetails?.cardLast4,
      cardBrand: paymentObject.paymentDetails?.cardBrand
    } : paymentObject.paymentDetails
  };
};