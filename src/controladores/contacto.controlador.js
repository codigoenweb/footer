import { Contacto } from "../modelos/contacto.modelo.js";
import mongoose from 'mongoose';


function limpiarString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}




export async function crearSuscripcion(peticion, respuesta, siguiente) {

  
  try {
    const email = limpiarString(peticion.body.email).toLowerCase();
    if (!validarEmail(email)) {
      return respuesta.status(400).json({ error: 'Ingresá un correo electrónico válido.' });
    }

    
    const yaExiste = await Contacto.findOne({ tipo: 'suscripcion', email });
    if (yaExiste) {
      return respuesta.status(200).json({ mensaje: 'Ese correo ya está suscripto. ¡Gracias!' });
    }
    await Contacto.create({
      tipo: 'suscripcion',
      email,
      fuente: limpiarString(peticion.body.fuente).slice(0, 80) || 'newsletter'
    });
    respuesta.status(201).json({ mensaje: '¡Gracias por suscribirte! Tu correo quedó registrado.' });
  } catch (error) {
    siguiente(error);
  }
}

export async function crearMensaje(peticion, respuesta, siguiente) {
  try {
    const nombre = limpiarString(peticion.body.nombre);
    const email = limpiarString(peticion.body.email).toLowerCase();
    const mensaje = limpiarString(peticion.body.mensaje);

    if (nombre.length < 2 || nombre.length > 100) {
      return respuesta.status(400).json({ error: 'El nombre debe tener entre 2 y 100 caracteres.' });
    }
    if (!validarEmail(email)) {
      return respuesta.status(400).json({ error: 'Ingresá un correo electrónico válido.' });
    }
    if (mensaje.length < 5 || mensaje.length > 5000) {
      return respuesta.status(400).json({ error: 'El mensaje debe tener entre 5 y 5000 caracteres.' });
    }

    await Contacto.create({ tipo: 'mensaje', nombre, email, mensaje, fuente: 'formulario-contacto' });
    respuesta.status(201).json({ mensaje: '¡Mensaje enviado correctamente! Gracias por escribirnos.' });
  } catch (err) {
    siguiente(err);
  }
}

export async function leerContactos(req, res, next) {

  try {
    const tipo = ['suscripcion', 'mensaje'].includes(req.query.tipo) ? req.query.tipo : null;
    const filter = tipo ? { tipo } : {};
    const pagina = Math.max(1, Number.parseInt(req.query.pagina, 10) || 1);
    const limit = 25;

    const [items, total, noleidos] = await Promise.all([
     Contacto.find(filter).sort({ createdAt: -1 }).skip((pagina - 1) * limit).limit(limit).lean(),
     Contacto.countDocuments(filter),
     Contacto.countDocuments({ ...filter, leido: false })
      ]);

   
    res.json({ items, total, noleidos, pagina, cantidadPaginas: Math.max(1, Math.ceil(total / limit)) });


  } catch (err) {
    console.log('error en get datos',err)
    next(err);
  }
}

export async function marcarComoLeido(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Identificador inválido.' });
    }
    const item = await Contacto.findByIdAndUpdate(req.params.id, { leido: true }, { returnDocument: 'after' }).lean();
    if (!item) {
      return res.status(404).json({ error: 'Registro no encontrado.' });
    }
    res.json({ mensaje: 'Marcado como leído.' });
  } catch (err) {
    next(err);
  }
}

export async function eliminarContacto(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Identificador inválido.' });
    }
    const resultado = await Contacto.findByIdAndDelete(req.params.id);
    if (!resultado) {
      return res.status(404).json({ error: 'Registro no encontrado.' });
    }
    res.json({ mensaje: 'Registro eliminado.' });
  } catch (error) {
    next(error);
  }
}