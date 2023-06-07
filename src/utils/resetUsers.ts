// Importamos el modelo
import { User } from "../models/mongo/User";

// Creamos 50 users aleatoriamente y los vamos añadiendo al array de users:
const userList = [
  {
    firstName: "Noah",
    lastName: "Hoppe",
    phone: "+34 60 902 06 30",
    address: {
      street: "Buckinghamshire",
      number: 176,
      city: "Simi Valley",
    },
    email: "noah@gmail.com",
    password: "noa45678",
  },
  {
    firstName: "Harvey",
    lastName: "Hickle",
    phone: "+34 70 456 38 48",
    address: {
      street: "Bedfordshire",
      number: 76,
      city: "Leesburg",
    },
    email: "harvey@gmail.com",
    password: "har45678",
  },
  {
    firstName: "Todd",
    lastName: "Moore",
    phone: "+34 58 470 62 31",
    address: {
      street: "Cambridgeshire",
      number: 17,
      city: "London",
    },
    email: "todd@gmail.com",
    password: "tod45678",
  },
  {
    firstName: "Luis",
    lastName: "Christiansen",
    phone: "+34 53 637 72 37",
    address: {
      street: "Bedfordshire",
      number: 145,
      city: "Macon-Bibb County",
    },
    email: "luis@gmail.com",
    password: "lui45678",
  },
  {
    firstName: "Teri",
    lastName: "King",
    phone: "+34 53 702 53 19",
    address: {
      street: "Borders",
      number: 136,
      city: "Palm Desert",
    },
    email: "teri@gmail.com",
    password: "ter45678",
  },
];

//  Función de reseteo de documentos de la colección.
export const resetUsers = async (): Promise<void> => {
  try {
    await User.collection.drop(); //  Esperamos a que borre los documentos de la collección users de la BBDD.
    console.log("Borrados users");
    const documents = userList.map((user) => new User(user));
    for (let i = 0; i < documents.length; i++) {
      const document = documents[i];
      await document.save();
    }
    console.log("Creados users correctamente");
  } catch (error) {
    //  Si hay error lanzamos el error por consola.
    console.error(error);
  }
};
