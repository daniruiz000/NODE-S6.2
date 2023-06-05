import { type iCar } from "./Car"

import mongoose from "mongoose";

import validator from "validator";
import bcrypt from "bcrypt";

// Declaramos nuestro esquema que nos permite declarar nuestros objetos y crearle restricciones.
const Schema = mongoose.Schema;

// Interface de address

interface iAddress {
  street: string;
  number: number;
  city: string;
}
// Interface de user

export interface iUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: iAddress;
  cars?: iCar[]; // Indicamos que los coches son opcionales
}

// Creamos esquema del usuario
const userSchema = new Schema<iUser>(
  {
    email: {
      type: String,
      trim: true,
      unique: true,
      validate: {
        validator: (text: string) => validator.isEmail(text),
        message: "Email incorrecto",
      },
      required: true,
    },
    password: {
      type: String,
      trim: true,
      unique: true,
      minLength: [8, "La contraseña debe tener al menos 8 caracteres"],
      select: false,
      required: true,
    },
    firstName: { type: String, trim: true, required: true },
    lastName: { type: String, trim: true, required: true },
    phone: { type: String, trim: true, required: false },
    address: {
      type: {
        street: { type: String, trim: true, required: true },
        number: { type: Number, required: true },
        city: { type: String, trim: true, required: true },
      },
      required: false,
    },
  },

  { timestamps: true } // Cada vez que se modifique un documento refleja la hora y fecha de modificación
);
// Cada vez que se guarde un usuario encriptamos la contraseña
userSchema.pre("save", async function (next) {
  try {
    // Si la password estaba encriptada, no la encriptaremos de nuevo.
    if (this.isModified("password")) {
      // Si el campo password se ha modificado
      const saltRounds = 10;
      const passwordEncrypted = await bcrypt.hash(this.password, saltRounds); // Encriptamos la contraseña
      this.password = passwordEncrypted; // guardamos la password en la entidad User
      next();
    }
  } catch (error: any) {
    next(error);
  }
});

export const User = mongoose.model<iUser>("User", userSchema);
