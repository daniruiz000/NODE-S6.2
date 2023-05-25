//  Importamos Mongoose:
import mongoose from "mongoose";

// Conexión a la base de datos:
import { connect } from "../db";
// Importamos la función que nos sirve para resetear los car:
import { resetBrands } from "../utils/resetBrands";

//  Función asíncrona para conectar con la BBDD y ejecutar la función de reseteo de datos.
const seedBrands: any = async () => {
  try {
    await connect(); //  Esperamos a que conecte con la BBDD.
    await resetBrands(); //  Esperamos que ejecute la función de reseteo de cars.
  } catch (error) {
    //  Si hay error lanzamos el error por consola.
    console.error(error);
  } finally {
    //   Finalmente desconecta de la BBDD.
    await mongoose.disconnect();
  }
};

void seedBrands(); //  Llamamos a la función.
