import {
  Entity, // Para hacer entidades
  PrimaryGeneratedColumn, // Para crear una columna id y autogenerada
  Column, // Para crear columnas
  ManyToOne,
} from "typeorm"

import { Team } from "./Team"

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
    id: number

  @Column()
    firstName: string

  @Column()
    lastName: string

  @Column()
    shirtNumber: number

  @ManyToOne(type => Team, team => team.players)
    team: Team
}
