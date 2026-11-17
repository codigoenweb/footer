import { Router } from "express";
import { login,logout, tengoSesionAbierta } from "../controladores/autenticacion.controlador.js";
import {requireAuth} from "../middleware/autenticacion.middleware.js";
import { authLimiter } from "../middleware/seguridad.middleware.js";


const enrutador = Router();

enrutador.post('/login', authLimiter,login); //el Limiter para que no esté probando claves
enrutador.post('/logout', logout);
enrutador.get('/sesion', requireAuth,tengoSesionAbierta);




export default enrutador;