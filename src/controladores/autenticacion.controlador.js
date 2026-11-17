import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { setCookie, getCookieOptions, limpiarCookie} from '../utilidades/cookie.util.js';


function limpiarString(valor){
    return typeof valor === 'string' ? valor.trim() : '';
}


function crearToken() {
  return jwt.sign(
    { sub: process.env.ADMIN_EMAIL, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '2h', issuer: 'footer-hub', audience: 'footer-hub-admin' }
  );
}

//respuesta es lo que envía el servidor al frontend - html.
//peticion es lo que pide el usuario a traves del HTML al servidor.
// Por ejemplo en el login pide entrar y si las claves están correctas, se abre la puerta a lo demás

export async function login(peticion, respuesta) {

  const email = limpiarString(peticion.body.email).toLowerCase();
  const password = typeof peticion.body.password === 'string' ? peticion.body.password : '';

  const usuarioValido = email === process.env.ADMIN_EMAIL.toLowerCase();
  const passValidada = await bcrypt.compare(password, process.env.ADMIN_PASS_HASH);

  if (!usuarioValido || !passValidada) {
    return respuesta.status(401).json({ error: 'Correo o contraseña incorrecta' });
  }

  // Creo un token y lo pego en las cookies de la computadora del usuario
  const token = crearToken();
  setCookie(respuesta, 'admin_token', token, getCookieOptions());

  //Hay que escribirlo si o si para que de una respuesta y pueda continuar el html
  return respuesta.json({ mensaje: 'Sesión iniciada' });
}

export async function logout(peticion, respuesta) {
  limpiarCookie(respuesta, 'admin_token', getCookieOptions());
  respuesta.json({ mensaje: 'Sesión cerrada.' });
}

export async function tengoSesionAbierta(peticion, respuesta) {

  respuesta.json({ email: peticion.admin.sub });
}