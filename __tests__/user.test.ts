import mongoose from "mongoose"
import { mongoConnect } from "../src/databases/mongo-db"
import { app, server } from "../src/index"
import { type iUser, type iAddress, User } from "../src/models/mongo/User"
import request from "supertest"
// Tenemos que tener una BBDD especifica de test.

describe("User Controler", () => {
  const addressMock: iAddress = {
    street: "Calle Falsa",
    number: 555,
    city: "Madrid",
  }
  const userMoc: iUser = {
    email: "dan@gmail.com",
    password: "123456789",
    firstName: "Dani",
    lastName: "Ruiz",
    phone: "606666666",
    address: addressMock,
  }

  let token: string
  let userId: string

  // Antes de hacer los tests:
  beforeAll(async () => {
    await mongoConnect() // Conecto a mongo pero a la BBDD de test mediante la biblioteca cross-env que nos permite modificar la variable de entorno del nombre de la BBDD desde el script de test.
    await User.collection.drop() // Borramos los usuarios de la BBDD
  })
  // Cuando acaben los test:
  afterAll(async () => {
    await mongoose.connection.close() // Cerramos la conexión a mongo.
    server.close()
  })
  // Si ponemos una x antes del test se salta el test
  // Si añadimos una f ejecutamos sólo el test seleccionado
  xit("Simple test to check true is true", () => {
    expect(true).toBeTruthy()
  })
  // Si ponemos una x antes del test se salta el test, tambien se pude poner al describe
  xit("Simple test to check jest in working", () => {
    const miTexto = "Hola chicos"
    expect(miTexto.length).toBe(11)
  })

  it("POST /user = this should create an user", async() => {
    const response = await request(app)
      .post("/user")
      .send(userMoc)
      .set("Accept", "application/json")
      .expect(201)

    expect(response.body).toHaveProperty("_id")
    expect(response.body.email).toBe(userMoc.email)
    userId = response.body._id
  })
  it("POST /user/login with valide credentials return 200 and token", async () => {
    const credentials = {
      email: userMoc.email,
      password: userMoc.password
    }
    const response = await request(app)
      .post("/user/login")
      .send(credentials)
      .expect(200)

    expect(response.body).toHaveProperty("token")
    token = response.body.token
    console.log(token)
  })
  it("POST /user/login with wrong credentials return 401 and no token", async () => {
    const credentials = {
      email: "noexistingemail",
      password: "123"
    }
    const response = await request(app)
      .post("/user/login")
      .send(credentials)
      .expect(401)

    expect(response.body.token).toBeUndefined()
  })
  it("GET /user returns a list with the users", async () => {
    const response = await request(app)
      .get("/user")
      .expect(200)
    expect(response.body.data).toBeDefined() // Esperamos que data este definido en la respuesta
    expect(response.body.data.length).toBe(1)
    expect(response.body.data[0].email).toBe(userMoc.email)
    expect(response.body.totalItems).toBe(1)
    expect(response.body.totalPages).toBe(1)
    expect(response.body.currentPage).toBe(1)
    console.log(response.body)
  })
  it("PUT /user/id Modify user when token is send", async () => {
    const updatedData = {
      firstName: "Edu",
      lastName: "Cuadrado",
    }
    const response = await request(app)
      .put(`/user/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedData)
      .expect(200)
    expect(response.body.firstName).toBe(updatedData.firstName)
    expect(response.body.email).toBe(userMoc.email)
    expect(response.body._id).toBe(userId)
  })
  it("PUT /user/id Should not modify user when no token is present", async () => {
    const updatedData = {
      lastName: "Cuadrado",
    }
    const response = await request(app)
      .put(`/user/${userId}`)
      .send(updatedData)
      .expect(401)
    expect(response.body.error).toBe("No tienes autorización para realizar esta operación")
  })
  it("DELET /user/id Do not delete user when token does not exist", async () => {
    const response = await request(app)
      .delete(`/user/${userId}`)
      .expect(401)
    expect(response.body.error).toBe("No tienes autorización para realizar esta operación")
  })
  it("DELET /user/id Delete user when token is ok", async () => {
    const response = await request(app)
      .delete(`/user/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
    expect(response.body._id).toBe(userId)
  })
})
