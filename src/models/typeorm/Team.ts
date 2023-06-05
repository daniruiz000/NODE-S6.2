import {
  Entity, // Para hacer entidades
  PrimaryGeneratedColumn, // Para crear una columna id y autogenerada
  Column, // Para crear columnas
  OneToMany, // Una entidad de estas se relaciona con muchas otras entidades
} from "typeorm"

import { Player } from "./Player"

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
    id: number

  @Column()
    name: string

  @Column()
    city: string

  // JUGADORES
  @OneToMany(type => Player, player => player.team, { cascade: true })
    players: Player[];
}
