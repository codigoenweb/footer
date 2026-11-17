import jwt from 'jsonwebtoken';
import { analizarCookies, descifrarCookie, getCookieOptions, limpiarCookie } from '../utilidades/cookie.util.js';

export function requireAuth(req, res, next) {

  const cookies = analizarCookies(req);


  const tokenFirmado = cookies.admin_token;



  if (!tokenFirmado) {
    return res.status(401).json({ error: 'Sesión no iniciada.' });
  }

  const token = descifrarCookie(tokenFirmado);
  if (!token) {
    limpiarCookie(res, 'admin_token', getCookieOptions());
    return res.status(401).json({ error: 'Firma de cookie inválida o alterada.' });
  }

  try {
    const datosCargados= jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'footer-hub',
      audience: 'footer-hub-admin'
    });

    if ( datosCargados.role !== 'admin' ||  datosCargados.sub !== process.env.ADMIN_EMAIL) {
      throw new Error('invalid');
    }

    req.admin = datosCargados;
    next();
  } catch {
    limpiarCookie(res, 'admin_token', getCookieOptions());
    return res.status(401).json({ error: 'Sesión vencida o inválida.' });
  }
}