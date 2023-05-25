// Importamos los modelos:
import { Car } from "../models/Car";

//  Función de reseteo de documentos de la colección.
export const resetCars = async (): Promise<void> => {
  try {
    //  Esperamos a que borre los documentos de la collección Car de la BBDD.
    await Car.collection.drop();
    console.log("Borrados Cars");

    // Creamos 50 Cars aleatoriamente y los vamos añadiendo al array de Cars:
    const carList = [
      {
        model: "Spyder",
        plate: "6314JOT",
        power: 115,
      },
      {
        model: "Mustang",
        plate: "8351AUK",
        power: 241,
      },
      {
        model: "Aventador",
        plate: "2656BMW",
        power: 161,
      },
      {
        model: "Clio",
        plate: "2642RGB",
        power: 90,
      },
      {
        model: "TT",
        plate: "1245JJP",
        power: 300,
      },
      {
        model: "Focus",
        plate: "9854LDM",
        power: 125,
      },
      {
        model: "Landero",
        plate: "5621FGN",
        power: 161,
      },
      {
        model: "Fiesta",
        plate: "2365NMJ",
        power: 80,
      },
    ];

    await Car.insertMany(carList); //  Esperamos a que inserte los nuevos documentos creados en la colección Car de la BBDD.
    console.log("Creados Cars correctamente");
  } catch (error) {
    //  Si hay error lanzamos el error por consola.
    console.error(error);
  }
};
