const validatePaymentAmount = (amount) => {
  if (typeof amount !== 'number' || amount <= 0) {
    return { isValid: false, error: 'El monto debe ser un número mayor a 0' };
  }

  if (amount > 10000) {
    return { isValid: false, error: 'El monto excede el límite máximo permitido ($10,000)' };
  }

  return { isValid: true };
};
