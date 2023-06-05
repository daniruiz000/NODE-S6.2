/**
 * @swagger
 * components:
 *  schemas:
 *    Car:
 *      type: object
 *      properties:
 *        brand:
 *          type: string
 *          description: ID de la marca del coche
 *        model:
 *          type: string
 *          description: Modelo del coche
 *        plate:
 *          type: string
 *          description: Matrícula del coche
 *        power:
 *          type: number
 *          description: Potencia del coche
 *        owner:
 *          type: string
 *          description: ID del propietario del coche
 */

import mongoose from "mongoose";

// Declaramos nuestro esquema que nos permite declarar nuestros objetos y crearle restricciones.
const Schema = mongoose.Schema;

// Interface de coche
export interface iCar {
  brand: mongoose.ObjectId;
  model: string;
  plate: string;
  power: number;
  owner: mongoose.ObjectId;
}

// Creamos esquema del coche
const carSchema = new Schema<iCar>(
  {
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: false },
    model: { type: String, trim: true, required: true },
    plate: { type: String, trim: true, required: false },
    power: { type: Number, required: false },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // Identificará el id como una referencia de la entidad User relacionando las dos colecciones de la BBDD.
  },
  { timestamps: true }
);

export const Car = mongoose.model<iCar>("Car", carSchema);
