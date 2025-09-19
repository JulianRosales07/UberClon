# Módulo de Autenticación

Este módulo maneja toda la funcionalidad relacionada con la autenticación y autorización de usuarios.

## 📁 Estructura

```
auth/
├── controllers/
│   └── AuthController.js    # Controladores de autenticación
├── models/
│   └── User.js             # Modelo de usuario
├── routes/
│   └── authRoutes.js       # Rutas de autenticación
└── utils/
    └── authHelpers.js      # Utilidades de autenticación
```

## 🔐 Funcionalidades

### AuthController.js
- `register` - Registro de nuevos usuarios
- `login` - Inicio de sesión
- `logout` - Cierre de sesión
- `getProfile` - Obtener perfil del usuario

### User.js (Modelo)
- Esquema de usuario con roles (passenger, driver, admin)
- Información específica de conductores
- Validaciones de email y teléfono
- Índices para optimización

### authHelpers.js (Utilidades)
- `hashPassword` - Hashear contraseñas
- `comparePassword` - Comparar contraseñas
- `generateToken` - Generar tokens JWT
- `verifyToken` - Verificar tokens JWT
- `sanitizeUser` - Limpiar datos sensibles
- `validateEmail` - Validar formato de email
- `validatePassword` - Validar fortaleza de contraseña

## 🛣️ Rutas

| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| POST | `/api/auth/register` | Registrar usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| POST | `/api/auth/logout` | Cerrar sesión | Sí |
| GET | `/api/auth/profile` | Obtener perfil | Sí |

## 🔧 Uso

```javascript
// Registro
POST /api/auth/register
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "passenger"
}

// Login
POST /api/auth/login
{
  "email": "juan@example.com",
  "password": "password123"
}
```

## 🛡️ Seguridad

- Contraseñas hasheadas con bcrypt (12 rounds)
- Tokens JWT con expiración de 24 horas
- Validación de entrada en todos los endpoints
- Sanitización de respuestas (sin contraseñas)