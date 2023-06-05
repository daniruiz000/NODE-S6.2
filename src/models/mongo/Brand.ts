//  Importamos Mongoose
/**
 * @swagger
 * components:
 *  schemas:
 *    Brand:
 *      type: object
 *      required:
 *        - name
 *      properties:
 *        name:
 *          type: string
 *          description: Name of the brand (sample Ford)
 *        creationYear:
 *          type: number
 *          description: Year when brand was created (sample 1990)
 *        country:
 *          type: string
 *          description: Country of this Brand (sample SPAIN)
 *        logoImage:
 *          type: string
 *          description: Logo of this brand (sample http://balbblabla.com/image.jpg)
 */

import mongoose from "mongoose";

// Declaramos nuestro esquema que nos permite declarar nuestros objetos y crearle restricciones.
const Schema = mongoose.Schema;

// Creamos esquema del coche
const allowedCountries: string[] = ["SPAIN", "ITALY", "FRANCE", "GERMANY", "USA"];
const currentYear: number = new Date().getFullYear();

// Interface de brand
interface iBrand {
  name: string;
  creationYear: number;
  country: string;
  logoImage: string;
}

// Schema de brand
const brandSchema = new Schema<iBrand>(
  {
    name: { type: String, trim: true, minLength: [3, " Al menos tres letras para el nombre"], maxLength: [20, "Nombre demasiado largo, máximo de 20 caracteres"], required: true }, // tim: true es un metodo de los string que permite quitarle por delamte y por detras los espacios.
    creationYear: { type: Number, min: [1803, "La marca de coches más antigua es Renault en 1803"], max: [currentYear, `Ese año es superior al año en curso que es ${currentYear}`], required: false },
    country: { type: String, trim: true, minLength: 3, maxLength: 10, enum: allowedCountries, uppercase: true, required: false },
    logoImage: { type: String, required: false },
  },
  { timestamps: true }
);

export const Brand = mongoose.model<iBrand>("Brand", brandSchema);
