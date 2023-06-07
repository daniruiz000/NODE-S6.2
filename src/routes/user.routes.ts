// Importamos express:
import express from "express";

// Importamos bcrypt:
import bcrypt from "bcrypt";

import { generateToken } from "../utils/token";

import { isAuth } from "../middlewares/author.middleware";

// Importamos el modelo que nos sirve tanto para importar datos como para leerlos:
import { User } from "../models/mongo/User";
import { Car } from "../models/mongo/Car";

// Importamos la función que nos sirve para resetear los book:
import { resetUsers } from "../utils/resetUsers";

import {
  type Request,
  type Response,
  type NextFunction,
} from "express";

// Router propio de usuario:
export const userRouter = express.Router();

//  ------------------------------------------------------------------------------------------

// Middleware previo al get de users para comprobar los parametros:

userRouter.get("/", (req: Request, res: Response, next: NextFunction) => {
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

/*  Ruta para recuperar todos los usuarios de manera paginada en función de un limite de elementos a mostrar
por página para no saturar al navegador (CRUD: READ):
*/

userRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  // Si funciona la lectura...
  try {
    const page = req.query.page as any;
    const limit = req.query.limit as any;

    const users = await User.find() // Devolvemos los usuarios si funciona. Con modelo.find().
      .limit(limit) // La función limit se ejecuta sobre el .find() y le dice que coga un número limitado de elementos, coge desde el inicio a no ser que le añadamos...
      .skip((page - 1) * limit); // La función skip() se ejecuta sobre el .find() y se salta un número determinado de elementos y con este cálculo podemos paginar en función del limit.

    //  Creamos una respuesta más completa con info de la API y los datos solicitados por el usuario:
    const totalElements = await User.countDocuments(); //  Esperamos aque realice el conteo del número total de elementos con modelo.countDocuments()
    const totalPagesByLimit = Math.ceil(totalElements / limit); // Para saber el número total de páginas que se generan en función del limit. Math.ceil() nos elimina los decimales.

    // Respuesta Completa:
    const response = {
      totalItems: totalElements,
      totalPages: totalPagesByLimit,
      currentPage: page,
      data: users,
    };
    // Enviamos la respuesta como un json.
    res.json(response);

    // Si falla la lectura...
  } catch (error) {
    next(error); // Le pasamos el error al siguiente middleware de control de errores.
  }
});

/* Ejemplo de REQ indicando que queremos la página 4 estableciendo un limite de 10 elementos
 por página (limit = 10 , pages = 4):
 http://localhost:3000/user?limit=10&page=4 */

//  ------------------------------------------------------------------------------------------

//  Ruta para recuperar un usuario en concreto a través de su id ( modelo.findById()) (CRUD: READ):

userRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  // Si funciona la lectura...
  try {
    const id = req.params.id; //  Recogemos el id de los parametros de la ruta.
    const user = await User.findById(id).select("+password -firstName"); //  Buscamos un documentos con un id determinado dentro de nuestro modelo con modelo.findById(id a buscar).

    if (user) {
      const temporalUser = user.toObject(); // Creamos un suario temporal que recibira sólo los datos que nos interesan del usuario que exista con ese id. Recibo sólo los datos que nos interesan con toObject().
      const includeCars = req.query.includeCars === "true";

      if (includeCars) {
        const cars = await Car.find({ owner: id }); // Busco en la entidad Car los coches que correspondena ese id de User.
        temporalUser.cars = cars; // Añadimos la propiedad cars al usuario temporal con los coches que hemos recogido de la entidad Car.
      }
      res.json(temporalUser); // Enviamos la resspuesta en formato json.
    } else {
      res.status(404).json({}); //    Si no existe el usuario se manda un json vacio y un código 400.
    }

    // Si falla la lectura...
  } catch (error) {
    next(error);
  }
});

// Ejemplo de REQ:
// http://localhost:3000/user/id del usuario a buscar

//  ------------------------------------------------------------------------------------------

//  Ruta para buscar un usuario por el nombre ( modelo.findById({firstName: name})) (CRUD: Operación Custom. No es CRUD):

userRouter.get("/name/:name", async (req: Request, res: Response, next: NextFunction) => {
  const name = req.params.name;
  // Si funciona la lectura...
  try {
    // const user = await User.find({ firstName: name }); //Si quisieramos realizar una busqueda exacta, tal y como está escrito.
    const user = await User.find({ firstName: new RegExp("^" + name.toLowerCase(), "i") }); //  Esperamos a que realice una busqueda en la que coincida el texto pasado por query params para la propiedad determinada pasada dentro de un objeto, porqué tenemos que pasar un objeto, sin importar mayusc o minusc.
    if (user?.length) {
      res.json(user); //  Si existe el usuario lo mandamos en la respuesta como un json.
    } else {
      res.status(404).json([]); //   Si no existe el usuario se manda un json con un array vacio porque la respuesta en caso de haber tenido resultados hubiera sido un array y un mandamos un código 404.
    }

    // Si falla la lectura...
  } catch (error) {
    next(error);
  }
});

// Ejemplo de REQ:
// http://localhost:3000/user/name/nombre del usuario a buscar

//  ------------------------------------------------------------------------------------------

//  Ruta para añadir elementos (CRUD: CREATE):

userRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  // Si funciona la escritura...
  try {
    const user = new User(req.body); // Un nuevo usuario es un nuevo modelo de la BBDD que tiene un Scheme que valida la estructura de esos datos que recoge del body de la petición.
    const createdUser = await user.save(); // Esperamos a que guarde el nuevo usuario creado en caso de que vaya bien. Con el metodo .save().
    return res.status(201).json(createdUser); // Devolvemos un código 201 que significa que algo se ha creado y el usuario creado en modo json.

    // Si falla la escritura...
  } catch (error) {
    next(error);
  }
});

/* Petición tipo de POST para añadir un nuevo usuario (añadimos al body el nuevo usuario con sus propiedades que tiene que cumplir con el Scheme de nuestro modelo) identificado por su id:
 const newUser = {firstName: "Prueba Nombre", lastName: "Prueba apellido", phone: "Prueba tlf"}
 fetch("http://localhost:3000/user/",{"body": JSON.stringify(newUser),"method":"POST","headers":{"Accept":"application/json","Content-Type":"application/json"}}).then((data)=> console.log(data)) */

//  ------------------------------------------------------------------------------------------

//  Endpoint para resetear los datos ejecutando cryptos:

userRouter.delete("/reset", async (req: Request, res: Response, next: NextFunction) => {
  // Si funciona el reseteo...
  try {
    await resetUsers();
    res.send("Datos User reseteados");

    // Si falla el reseteo...
  } catch (error) {
    next(error);
  }
});

//  ------------------------------------------------------------------------------------------

//  Endpoint para eliminar usuario identificado por id (CRUD: DELETE):

userRouter.delete("/:id", isAuth, async (req: any, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id; //  Recogemos el id de los parametros de la ruta.

    if (req.user.id !== id && req.user.email !== "admin@gmail.com") {
      return res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
    }

    const userDeleted = await User.findByIdAndDelete(id); // Esperamos a que nos devuelve la info del usuario eliminado que busca y elimina con el metodo findByIdAndDelete(id del usuario a eliminar).
    if (userDeleted) {
      res.json(userDeleted); //  Devolvemos el usuario eliminado en caso de que exista con ese id.
    } else {
      res.status(404).json({}); //  Devolvemos un código 404 y un objeto vacio en caso de que no exista con ese id.
    }
  } catch (error) {
    next(error);
  }
});

/* Petición tipo DELETE para eliminar un usuario (no añadimos body a la busqueda y recogemos el id de los parametros de la ruta) identificado por su id:

fetch("http://localhost:3000/user/id del usuario a borrar",{"method":"DELETE","headers":{"Accept":"application/json","Content-Type":"application/json"}}).then((data)=> console.log(data))
*/

//  ------------------------------------------------------------------------------------------

//  Endpoin para actualizar un elemento identificado por id (CRUD: UPDATE):

userRouter.put("/:id", isAuth, async (req: any, res: Response, next: NextFunction) => {
  // Si funciona la actualización...
  try {
    const id = req.params.id; //  Recogemos el id de los parametros de la ruta.

    if (req.user.id !== id && req.user.email !== "admin@gmail.com") {
      return res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
    }

    const userUpdated = await User.findById(id);
    if (userUpdated) {
      Object.assign(userUpdated, req.body); //  Al userUpdate le pasamos las propiedades que vengan de req.body
      await userUpdated.save(); // Guardamos el usuario actualizado
      //  Quitamos password de la respuesta
      const userToSend: any = userUpdated.toObject();
      delete userToSend.password;
      res.json(userToSend); //  Devolvemos el usuario actualizado en caso de que exista con ese id.
    } else {
      res.status(404).json({}); //  Devolvemos un código 404 y un objeto vacio en caso de que no exista con ese id.
    }

    // Si falla la actualización...
  } catch (error) {
    next(error);
  }
});

/* Petición tipo de PUT para actualizar datos concretos (en este caso el tlf) recogidos en el body,
de un usuario en concreto (recogemos el id de los parametros de la ruta ):

fetch("http://localhost:3000/user/id del usuario a actualizar",{"body": JSON.stringify({phone:5555}),"method":"PUT","headers":{"Accept":"application/json","Content-Type":"application/json"}}).then((data)=> console.log(data))
*/

//  ------------------------------------------------------------------------------------------

//  Endpoint para login de usuarios:

userRouter.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  // Si funciona la escritura...
  try {
    const { email, password } = req.body; // Recoge email y password del body de la req
    // Comprobamos que nos mandan el email y el usuario.
    if (!email || !password) {
      return res.status(400).json({ error: "Se deben especificar los campos email y password" }); // Un return dentro de luna función hace que esa función no continue.
    }
    // Comprobamos que existe el usuario
    const user = await User.findOne({ email }).select("+password"); // Le decimos que nos muestre la propiedad password que por defecto en el modelo viene con select: false.
    if (!user) {
      return res.status(401).json({ error: "Email y/o password incorrectos" });
    }
    // Comprobamos que la password que nos envian se corresponde con la que tiene el usuario.
    const match = await bcrypt.compare(password, user.password); // compara el password encriptado con la password enviada sin encriptar.
    if (match) {
      // Quitamos password de la respuesta.
      const userWithoutPass: any = user.toObject(); // Nos devuelve esta entidad pero modificable.
      delete userWithoutPass.password; // delete elimina la propiedad de un objeto.

      // Generamos token jwt
      const jwtToken = generateToken(user._id.toString(), user.email);

      return res.status(200).json({ token: jwtToken });
    } else {
      return res.status(401).json({ error: "Email y/o password incorrectos" }); // Código 401 para no autorizado
    }

    // Si falla la escritura...
  } catch (error) {
    next(error);
  }
});
