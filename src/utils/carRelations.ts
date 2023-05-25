// Importamos los modelos:
import { Brand } from "../models/Brand";
import { Car } from "../models/Car";
import { User } from "../models/User";

import { generateRandom } from "../utils/generateRandom";

//  Función de reseteo de documentos de la colección.
export const carRelations: any = async () => {
  try {
    //  Recuperamos users, cars y brands
    const cars = await Car.find();
    if (!cars.length) {
      console.error("No hay coches en la BBDD.");
      return;
    }
    const users = await User.find();
    if (!users.length) {
      console.error("No hay usuarios en la BBDD.");
      return;
    }
    const brands = await Brand.find();
    if (!brands.length) {
      console.error("No hay marcas en la BBDD.");
      return;
    }

    for (let i = 0; i < cars.length; i++) {
      const car = cars[i];
      const randomBrand = brands[generateRandom(0, brands.length)];
      const randomUser = users[generateRandom(0, users.length)];
      car.owner = randomUser as unknown as any;
      car.brand = randomBrand as unknown as any;
      await car.save();
    }
    console.log("Relaciones entre colecciones creadas correctamente");
  } catch (error) {
    //  Si hay error lanzamos el error por consola.
    console.error(error);
  }
};
