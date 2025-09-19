# Módulo de Pagos

Este módulo maneja toda la funcionalidad relacionada con el procesamiento de pagos y ganancias.

## 📁 Estructura

```
payments/
├── controllers/
│   └── PaymentController.js # Controladores de pagos
├── models/
│   └── Payment.js          # Modelo de pago
├── routes/
│   └── paymentRoutes.js    # Rutas de pagos
└── utils/
    └── paymentHelpers.js   # Utilidades de pagos
```

## 💳 Funcionalidades

### PaymentController.js
- `createPayment` - Procesar pago de viaje
- `getPaymentHistory` - Obtener historial de pagos
- `getDriverEarnings` - Obtener ganancias del conductor
- `refundPayment` - Procesar reembolso

### Payment.js (Modelo)
- Esquema de pago con información completa
- Métodos de pago (efectivo, tarjeta, billetera digital)
- Estados de pago (pending, completed, failed, refunded)
- Cálculo automático de comisiones
- Información de reembolsos

### paymentHelpers.js (Utilidades)
- `validatePaymentAmount` - Validar monto del pago
- `validatePaymentMethod` - Validar método de pago
- `simulatePaymentProcessing` - Simular procesamiento
- `simulateRefundProcessing` - Simular reembolso
- `canProcessRefund` - Verificar si se puede reembolsar
- `getPaymentSummary` - Obtener resumen de pagos

## 🛣️ Rutas

| Método | Ruta | Descripción | Autenticación | Rol |
|--------|------|-------------|---------------|-----|
| POST | `/api/payments/` | Procesar pago | Sí | Cualquiera |
| GET | `/api/payments/history` | Historial de pagos | Sí | Cualquiera |
| GET | `/api/payments/earnings` | Ganancias | Sí | Driver |
| POST | `/api/payments/:id/refund` | Reembolsar | Sí | Admin |

## 🔧 Uso

```javascript
// Procesar pago
POST /api/payments/
{
  "tripId": "60d5ec49f1b2c8b1f8e4e1a1",
  "amount": 25.50,
  "paymentMethod": "card",
  "paymentDetails": {
    "cardLast4": "1234",
    "cardBrand": "Visa"
  }
}

// Obtener historial
GET /api/payments/history?page=1&limit=10&status=completed

// Obtener ganancias del conductor
GET /api/payments/earnings?period=month

// Procesar reembolso
POST /api/payments/60d5ec49f1b2c8b1f8e4e1a2/refund
{
  "reason": "Viaje cancelado por error del sistema"
}
```

## 💰 Métodos de Pago

### Efectivo (cash)
- Procesamiento inmediato
- Sin validaciones adicionales
- 100% tasa de éxito

### Tarjeta (card)
- Requiere `cardLast4` y `cardBrand`
- Simulación de procesamiento con 95% éxito
- Validación de datos de tarjeta

### Billetera Digital (digital_wallet)
- Requiere `walletType`
- Simulación con 98% éxito
- Soporte para múltiples billeteras

## 📊 Estados de Pago

1. **pending** - Pago en proceso
2. **completed** - Pago completado exitosamente
3. **failed** - Pago falló
4. **refunded** - Pago reembolsado

## 💵 Estructura de Comisiones

- **Comisión de plataforma**: 20% del monto total
- **Ganancias del conductor**: 80% del monto total
- **Cálculo automático** en el modelo Payment

## 🔄 Reembolsos

- Solo pagos completados pueden ser reembolsados
- Límite de 30 días desde el pago original
- Procesamiento automático según método original
- Registro completo de la transacción de reembolso

## 📈 Reportes y Estadísticas

- Ganancias por período (semana, mes, año)
- Desglose por método de pago
- Comisiones de plataforma
- Ganancias netas del conductor
- Resúmenes automáticos de pagos