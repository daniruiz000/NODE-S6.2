import mongoose from "mongoose"
import { mongoConnect } from "../src/databases/mongo-db"
import { app, server } from "../src/index"
import { type iUser, type iAddress } from "../src/models/mongo/User"
import request from "supertest"

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

  beforeAll(async () => {
    await mongoConnect()
  })
  afterAll(async () => {
    await mongoose.connection.close()
    server.close()
  })

  it("Simple test to check true is true", () => {
    expect(true).toBeTruthy()
  })
  it("Simple test to check jest in working", () => {
    const miTexto = "Hola chicos"
    expect(miTexto.length).toBe(11)
  })

  it("POST /user = this should", async() => {
    const response = await request(app)
      .post("/user")
      .send(userMoc)
      .set("Accept", "application/json")
      .expect(201)

    expect(response.body).toHaveProperty("_id")
    expect(response.body.email).toBe(userMoc.email)
  })
})
