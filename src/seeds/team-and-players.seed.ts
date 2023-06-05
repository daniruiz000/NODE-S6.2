import { AppDataSource } from "../databases/typeorm-datasource";
import { Player } from "../models/typeorm/Player";
import { Team } from "../models/typeorm/Team";

export const teamAndPlayerSeed = async (): Promise<void> => {
  // Conectamos a la BBDD
  const dataSource = await AppDataSource.initialize()
  console.log(`Conectados a ${dataSource?.options?.database as string}`)

  // Borramos los players
  await AppDataSource.manager.delete(Player, {})
  await AppDataSource.manager.delete(Team, {})
  console.log("Eliminados los jugadores y equipos existentes")
  // Creamos dos players
  const player1 = {
    firstName: "Paolo",
    lastName: "Futre",
    shirtNumber: 10
  }

  const player2 = {
    firstName: "Cholo",
    lastName: "Simeone",
    shirtNumber: 8
  }

  // Creamos equipo
  const team = {
    name: "Atletico de Madrid",
    city: "Madrid",
    players: [player1, player2]
  }

  // Creamos entidad equipo
  const teamEntity = AppDataSource.manager.create(Team, team)

  // Guardamos el equipo en base de datos
  await AppDataSource.manager.save(teamEntity)
  console.log("Creados los jugadores y el equipo")

  await AppDataSource.destroy() // Cierra la BBDD
  console.log("Cerramos la conexión SQL")
}
void teamAndPlayerSeed()
