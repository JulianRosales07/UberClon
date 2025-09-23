const User = require('../models/User');
const { sendSuccess, sendError } = require('../../shared/utils/responseHelper');
const { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  sanitizeUser,
  validateEmail,
  validatePassword 
} = require('../../shared/utils/authHelpers');

const register = async (req, res) => {
    try{
        const { name, email, password, phone, role = 'passenger' } = req.body;

        // Verificar si el usuario ya existe
        const existinUser = await User.findOne({ email });
        if (existinUser){
            return sendError(res, 'El usuario ya existe', 400);
        }

        //Hashear la contraseña
        const hashedPassword = await hashPassword(password);

        // Crear nuevo usuario
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role
    });

    const savedUser = await newUser.save();

    // Generar token JWT
    const token = generateToken(savedUser._id, savedUser.role);

    // Remover password de la respuesta
    const userResponse = sanitizeUser(savedUser);

    sendSuccess(res, { user: userResponse, token }, 'Usuario registrado exitosamente', 201);
  } catch (error) {
    sendError(res, error);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 'Credenciales inválidas', 401);
    }

    // Verificar contraseña
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return sendError(res, 'Credenciales inválidas', 401);
    }

    // Generar token JWT
    const token = generateToken(user._id, user.role);

    // Remover password de la respuesta
    const userResponse = sanitizeUser(user);

    sendSuccess(res, { user: userResponse, token }, 'Login exitoso');
  } catch (error) {
    sendError(res, error);
  }
};

const logout = async (req, res) => {
  try {
    // En una implementación real, podrías invalidar el token en una blacklist
    sendSuccess(res, null, 'Logout exitoso');
  } catch (error) {
    sendError(res, error);
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return sendError(res, 'Usuario no encontrado', 404);
    }

    sendSuccess(res, user, 'Perfil obtenido exitosamente');
  } catch (error) {
    sendError(res, error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile
};