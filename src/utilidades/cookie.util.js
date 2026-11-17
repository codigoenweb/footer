import crypto from 'node:crypto';

const SECRET = process.env.JWT_SECRET;

export function firmarCookie(valor) {
  const hmac = crypto.createHmac('sha256', SECRET).update(valor).digest('hex');
  return `${valor}.${hmac}`;
}

export function descifrarCookie(tokenFirmado) {
  if (typeof tokenFirmado !== 'string') return false;
  const ultimoPuntoIndex = tokenFirmado.lastIndexOf('.');
  if (ultimoPuntoIndex === -1) return false;

  const tokenSinFirmar = tokenFirmado.slice(0, ultimoPuntoIndex);
  const laFirma = tokenFirmado.slice(ultimoPuntoIndex + 1);


  //Hash-based Message Authentication Code
  const hmacEsperado = crypto.createHmac('sha256', SECRET).update(tokenSinFirmar).digest('hex');

  const firmaBuffer = Buffer.from(laFirma, 'hex');
  const esperadoBuffer = Buffer.from(hmacEsperado, 'hex');

  if (firmaBuffer.length !== esperadoBuffer.length) return false;
  if (!crypto.timingSafeEqual(firmaBuffer, esperadoBuffer)) return false;

  return tokenSinFirmar;
}

export function analizarCookies(peticion) {
  const lista = {};
  const cookieEncabezado = peticion.headers.cookie;
  if (!cookieEncabezado) return lista;

  cookieEncabezado.split(';').forEach(cookie => {
    const partes = cookie.split('=');
    const nombre = partes.shift().trim();
    const valor = decodeURIComponent(partes.join('='));
    lista[nombre] = valor;
  });

  return lista;
}

export function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
    maxAge: 2 * 60 * 60 * 1000 // 2 horas
  };
}

export function setCookie(respuesta, nombre, valor, options = {}) {
  const valorFirmado = firmarCookie(valor);
  let cookieString = `${nombre}=${encodeURIComponent(valorFirmado)}`;

  if (options.maxAge) cookieString += `; Max-Age=${Math.floor(options.maxAge / 1000)}`;
  if (options.path) cookieString += `; Path=${options.path}`;
  if (options.httpOnly) cookieString += `; HttpOnly`;
  if (options.secure) cookieString += `; Secure`;
  if (options.sameSite) cookieString += `; SameSite=${options.sameSite}`;

  respuesta.setHeader('Set-Cookie', cookieString);
}

export function limpiarCookie(respuesta, nombre, options = {}) {
  let cookieString = `${nombre}=; Max-Age=0`;
  if (options.path) cookieString += `; Path=${options.path}`;
  if (options.httpOnly) cookieString += `; HttpOnly`;
  if (options.secure) cookieString += `; Secure`;
  if (options.sameSite) cookieString += `; SameSite=${options.sameSite}`;

  respuesta.setHeader('Set-Cookie', cookieString);
}
/**
3. ¿Qué hace cada propiedad dentro de options?

Tu función toma esas propiedades y las traduce al formato de texto que exige el encabezado HTTP Set-Cookie:
• maxAge: Define cuánto tiempo dura la cookie en milisegundos (por eso tu código lo divide por 1000, ya que el estándar HTTP Max-Age espera segundos). Si no lo ponés, la cookie se borra al cerrar el navegador.
• path: Indica en qué rutas de tu web se envía la cookie. Si ponés '/', sirve para todo el sitio.
• httpOnly: Si es true, impide que el código JavaScript del navegador (document.cookie) pueda leer la cookie. Protege contra ataques XSS.
• secure: Si es true, el navegador solo enviará la cookie si la conexión usa HTTPS. (Ojo: en localhost sin HTTPS puede hacer que el navegador ignore la cookie si está en true).
• sameSite: Controla si la cookie se envía cuando el usuario viene desde otro sitio web ('Strict', 'Lax' o 'None'). Protege contra ataques CSRF. */