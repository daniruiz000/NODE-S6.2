//  Importamos Mongoose:
import mongoose from "mongoose";

// Conexión a la base de datos:
import { connect } from "../db"; // Importamos el archivo de conexión a la BBDD

// Importamos la función que nos sirve para resetear los users:
import { resetUsers } from "../utils/resetUsers";

//  Función asíncrona para conectar con la BBDD y ejecutar la función de reseteo de datos.
const seedUsers: any = async () => {
  try {
    await connect(); //  Esperamos a que conecte con la BBDD.
    await resetUsers(); //  Esperamos que ejecute la función de reseteo de users.
  } catch (error) {
    //  Si hay error lanzamos el error por consola.
    console.error(error);
  } finally {
    //   Finalmente desconecta de la BBDD.
    await mongoose.disconnect();
  }
};

seedUsers(); //  Llamamos a la función.
