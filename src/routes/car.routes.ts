// Importamos express:
import express from "express";

// Importamos el modelo que nos sirve tanto para importar datos como para leerlos:
import { Car } from "../models/Car";

// Importamos la función que nos sirve para resetear los book:
import { resetCars } from "../utils/resetCars";
import { resetBrands } from "../utils/resetBrands";
import { resetUsers } from "../utils/resetUsers";
import { carRelations } from "../utils/carRelations";

import {
  type Request,
  type Response,
  type NextFunction,
} from "express";

// Router propio de car:
export const carRouter = express.Router();

//  ------------------------------------------------------------------------------------------

// Middleware previo al get de cars para comprobar los parametros:

carRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("Estamos en el Middleware que comprueba los parámetros");

    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
      req.query.page = page as any;
      req.query.limit = limit as any;
      next();
    } else {
      console.log("Parametros no validos:");
      console.log(JSON.stringify(req.query));
      res.status(400).json({ error: "Params are not valid" });
    }
  } catch (error) {
    next(error);
  }
});

//  ------------------------------------------------------------------------------------------

/*  Ruta para recuperar todos los cars de manera paginada en función de un limite de elementos a mostrar
por página para no saturar al navegador (CRUD: READ):
*/

carRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page as any;
    const limit = req.query.limit as any;
    const cars = await Car.find() // Devolvemos los cars si funciona. Con modelo.find().
      .limit(limit) // La función limit se ejecuta sobre el .find() y le dice que coga un número limitado de elementos, coge desde el inicio a no ser que le añadamos...
      .skip((page - 1) * limit) // La función skip() se ejecuta sobre el .find() y se salta un número determinado de elementos y con este cálculo podemos paginar en función del limit.
      .populate(["owner", "brand"]); // Con populate le indicamos que si recoge un id en la propiedad señalada rellene con los campos de datos que contenga ese id
    //  Creamos una respuesta más completa con info de la API y los datos solicitados por el car:
    const totalElements = await Car.countDocuments(); //  Esperamos aque realice el conteo del número total de elementos con modelo.countDocuments()
    const totalPagesByLimit = Math.ceil(totalElements / limit); // Para saber el número total de páginas que se generan en función del limit. Math.ceil() nos elimina los decimales.

    // Respuesta Completa:
    const response = {
      totalItems: totalElements,
      totalPages: totalPagesByLimit,
      currentPage: page,
      data: cars,
    };
    // Enviamos la respuesta como un json.
    res.json(response);
  } catch (error) {
    next(error);
  }
});

/* Ejemplo de REQ indicando que queremos la página 4 estableciendo un limite de 10 elementos
 por página (limit = 10 , pages = 4):
 http://localhost:3000/user?limit=10&page=4 */

//  ------------------------------------------------------------------------------------------

//  Ruta para recuperar un car en concreto a través de su id ( modelo.findById()) (CRUD: READ):

carRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id; //  Recogemos el id de los parametros de la ruta.
    const car = await Car.findById(id).populate(["owner", "brand"]); //  Buscamos un documentos con un id determinado dentro de nuestro modelo con modelo.findById(id a buscar).
    if (car) {
      res.json(car); //  Si existe el car lo mandamos como respuesta en modo json.
    } else {
      res.status(404).json({}); //    Si no existe el car se manda un json vacio y un código 400.
    }
  } catch (error) {
    next(error);
  }
});

// Ejemplo de REQ:
// http://localhost:3000/user/id del car a buscar

// Ejemplo de REQ:
// http://localhost:3000/user/name/nombre del car a buscar

//  ------------------------------------------------------------------------------------------

//  Ruta para añadir elementos (CRUD: CREATE):

carRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const car = new Car(req.body); //     Un nuevo car es un nuevo modelo de la BBDD que tiene un Scheme que valida la estructura de esos datos que recoge del body de la petición.
    const createdCar = await car.save(); // Esperamos a que guarde el nuevo car creado en caso de que vaya bien. Con el metodo .save().
    res.status(201).json(createdCar); // Devolvemos un código 201 que significa que algo se ha creado y el car creado en modo json.
  } catch (error) {
    next(error);
  }
});

/* Petición tipo de POST para añadir un nuevo car (añadimos al body el nuevo car con sus propiedades que tiene que cumplir con el Scheme de nuestro modelo) identificado por su id:
 const newUser = {firstName: "Prueba Nombre", lastName: "Prueba apellido", phone: "Prueba tlf"}
 fetch("http://localhost:3000/user/",{"body": JSON.stringify(newUser),"method":"POST","headers":{"Accept":"application/json","Content-Type":"application/json"}}).then((data)=> console.log(data)) */
//  ------------------------------------------------------------------------------------------

//  Endpoint para resetear los datos ejecutando cryptos:

carRouter.delete("/reset", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // La constante all recoge un boleano, si recogemos una query (all) y con valor (true), esta será true:
    const all = req.query.all === "true";

    // Si all es true resetearemos todos los datos de nuestras coleciones y las relaciones entre estas.
    if (all) {
      await resetBrands();
      await resetUsers();
      await resetCars();
      await carRelations();
      res.send("Datos reseteados y Relaciones reestablecidas");
    } else {
      await resetCars();
      res.send("Datos Cars reseteados");
    }
    // Si falla el reseteo...
  } catch (error) {
    next(error);
  }
});

//  ------------------------------------------------------------------------------------------

//  Endpoin para eliminar car identificado por id (CRUD: DELETE):

carRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id; //  Recogemos el id de los parametros de la ruta.
    const carDeleted = await Car.findByIdAndDelete(id); // Esperamos a que nos devuelve la info del car eliminado que busca y elimina con el metodo findByIdAndDelete(id del car a eliminar).
    if (carDeleted) {
      res.json(carDeleted); //  Devolvemos el car eliminado en caso de que exista con ese id.
    } else {
      res.status(404).json({}); //  Devolvemos un código 404 y un objeto vacio en caso de que no exista con ese id.
    }
  } catch (error) {
    next(error);
  }
});

/* Petición tipo DELETE para eliminar un car (no añadimos body a la busqueda y recogemos el id de los parametros de la ruta) identificado por su id:

fetch("http://localhost:3000/car/id del car a borrar",{"method":"DELETE","headers":{"Accept":"application/json","Content-Type":"application/json"}}).then((data)=> console.log(data))
*/

//  ------------------------------------------------------------------------------------------

//  Endpoin para actualizar un elemento identificado por id (CRUD: UPDATE):

carRouter.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id; //  Recogemos el id de los parametros de la ruta.
    const carUpdated = await Car.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }); // Esperamos que devuelva la info del car actualizado al que tambien hemos pasado un objeto con los campos q tiene que acualizar en la req del body de la petición. {new: true} Le dice que nos mande el car actualizado no el antiguo. Lo busca y elimina con el metodo findByIdAndDelete(id del car a eliminar).
    if (carUpdated) {
      res.json(carUpdated); //  Devolvemos el car actualizado en caso de que exista con ese id.
    } else {
      res.status(404).json({}); //  Devolvemos un código 404 y un objeto vacio en caso de que no exista con ese id.
    }
  } catch (error) {
    next(error);
  }
});

/* Petición tipo de PUT para actualizar datos concretos (en este caso el tlf) recogidos en el body,
de un car en concreto (recogemos el id de los parametros de la ruta ):

fetch("http://localhost:3000/user/id del car a actualizar",{"body": JSON.stringify({phone:5555}),"method":"PUT","headers":{"Accept":"application/json","Content-Type":"application/json"}}).then((data)=> console.log(data))
*/

//  ------------------------------------------------------------------------------------------
