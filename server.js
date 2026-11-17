import 'dotenv/config';
import express from "express"
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { conectarBD } from './src/config/db.js';
import { manualHelmet } from './src/middleware/seguridad.middleware.js';

import contactoRutas from './src/rutas/contacto.rutas.js';
import autenticacionRutas from './src/rutas/autenticacion.rutas.js';

const miAplicacion = express();
// Para saber donde estamos ubicados siempre, independientemente del sistema operativo o directorio
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUERTO = Number(process.env.PUERTO || 3000);


// Para el caso de que no se configuren las variables de entorno que se necesitan para funcionar

for (const palabraClave of ['PUERTO', 'ADMIN_EMAIL', 'MONGODB_URI']){
    if(!process.env[palabraClave]){
        console.log(`Falta configurar ${palabraClave} en el archivo .env`);
        //sale
        process.exit(1);
    }
}

if (process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET debe tener al menos 32 caracteres.');
  process.exit(1);
}
/**La línea miAplicacion.set('trust proxy', 1); sirve para indicarle a una aplicación en Express.js (Node.js) que está funcionando detrás de un proxy inverso (como Nginx, Cloudflare, Heroku, Render o AWS) y que debe confiar en los encabezados HTTP que este le envía.
El número 1 significa que la aplicación debe confiar únicamente en el primer salto (el proxy más cercano) en la red.

¿Qué problema resuelve?

Cuando subes tu aplicación a producción, el usuario no se conecta directamente a Node.js, sino a un servidor intermediario (proxy). Sin esta línea, Express cree que todas las peticiones vienen de la dirección IP interna del proxy y no del usuario real.
Al activarlo, Express lee las cabeceras X-Forwarded-* que agrega el proxy y logra tres cosas principales:
• Obtener la IP real del usuario. Permite que req.ip devuelva la dirección IP verdadera del visitante en lugar de la IP local del servidor intermediario.
• Detectar correctamente HTTPS. Hace que req.protocol sepa si el usuario entró mediante una conexión segura (https), ya que muchas veces el proxy recibe HTTPS y se comunica con Node.js por HTTP interno.
• Hacer funcionar sesiones y límites de peticiones. Es indispensable para que librerías como express-session (con cookies seguras) o express-rate-limit (para bloquear ataques o spam por IP) funcionen bien en producción.

¿Cuándo debes usarlo y cuándo no?

• Úsalo si vas a desplegar tu proyecto en plataformas en la nube (Render, Vercel, Railway, AWS, Heroku) o si usas un servidor como Nginx o Cloudflare por delante.
• No lo uses si tu aplicación recibe tráfico directo de internet sin ningún intermediario. En ese caso, un atacante podría falsificar las cabeceras HTTP para engañar a tu servidor sobre su dirección IP real. */
miAplicacion.set('trust proxy', 1);
miAplicacion.use(manualHelmet); /** protege tu aplicación web configurando automáticamente encabezados HTTP de seguridad. Su objetivo principal es bloquear ataques comunes del lado del navegador con una sola línea de código. */
miAplicacion.use(express.json({ limit: '20kb' }));
miAplicacion.use(express.urlencoded({ extended: false, limit: '20kb' }));



/**
1. miAplicacion.use(...)

• Registro de middleware. Le indica a tu aplicación de Express.js que ejecute esa función cada vez que llegue una petición HTTP al servidor */

/*
4. { extensions: ['html'] }

• URLs limpias. Esta opción le dice a Express que si alguien pide una ruta sin extensión (por ejemplo, ://tusitio.com/admin), busque automáticamente si existe un archivo llamado admin.html dentro de public.*/




// Montar rutas de la API
miAplicacion.use('/api/admin', autenticacionRutas);
miAplicacion.use('/api', contactoRutas);


//Hay que ponerlas al final

// las rutas del Frontend

// Servir archivos estáticos y Simple Page Application SPA frontend
miAplicacion.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));
/*Es necesario usar path.join(__dirname, 'public') en lugar de escribir simplemente 'public' para evitar que tu aplicación se rompa dependiendo de dónde la ejecutes o en qué sistema operativo corra. */
miAplicacion.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
miAplicacion.get('*path', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));




// Manejador Global de errores

miAplicacion.use((error, peticion, respuesta, siguiente) => {
  console.error(error);
  if (respuesta.headersSent) { // Corregido: headersSent con "s"
    return siguiente(error);
  }
  respuesta.status(500).json({ error: 'Ocurrió un error interno. Intentá nuevamente.' });
});



//Inicialización de servidor y Base de datos


await conectarBD();
miAplicacion.listen(3000, () => console.log(`Servidor funcionando en http://localhost:${PUERTO}`) );