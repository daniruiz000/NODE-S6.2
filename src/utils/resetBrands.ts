// Importamos los modelos:
import { Brand } from "../models/mongo/Brand";

//  Función de reseteo de documentos de la colección.
export const resetBrands = async (): Promise<void> => {
  try {
    //  Esperamos a que borre los documentos de la collección Car de la BBDD.
    await Brand.collection.drop();
    console.log("Borrados Brands");

    // Creamos 50 Brands aleatoriamente y los vamos añadiendo al array de Brands:
    const brandList = [
      {
        name: "BMW",
        creationYear: 1926,
        country: "Germany",
      },
      {
        name: "Ferrai",
        creationYear: 1924,
        country: "Italy",
      },
      {
        name: "Fiat",
        creationYear: 1935,
        country: "Italy",
      },
      {
        name: "Renault",
        creationYear: 1803,
        country: "France",
      },
    ];

    // const documents = brandList.map((brand) => new Brand(brand));
    await Brand.insertMany(brandList); //  Esperamos a que inserte los nuevos documentos creados en la colección Car de la BBDD.
    console.log("Creados Brands correctamente");
  } catch (error) {
    //  Si hay error lanzamos el error por consola.
    console.error(error);
  }
};

module.exports = { resetBrands }; // Exportamos la función para poder usarla.
