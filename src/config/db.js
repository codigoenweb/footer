import mongoose from "mongoose";

export async function conectarBD() {
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Base de datos conectada');
}