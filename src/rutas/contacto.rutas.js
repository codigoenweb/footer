import{ Router} from 'express';
import { crearMensaje, crearSuscripcion,leerContactos, marcarComoLeido, eliminarContacto } from '../controladores/contacto.controlador.js';
import { publicLimiter } from '../middleware/seguridad.middleware.js';
import { requireAuth } from '../middleware/autenticacion.middleware.js';

const enrutador = Router();


//El limiter es para que no insista mas de 30 veces

enrutador.post('/suscripciones',publicLimiter, crearSuscripcion);
enrutador.post('/mensajes',publicLimiter, crearMensaje);



//parte privada que solamente ve el administrador.
enrutador.get('/admin/contactos', requireAuth, leerContactos);
enrutador.patch('/admin/contactos/:id/leido', requireAuth, marcarComoLeido);
enrutador.delete('/admin/contactos/:id', requireAuth, eliminarContacto);


export default enrutador;