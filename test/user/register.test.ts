import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/entity/User";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";
// import { truncatetables } from "../utils";

describe("POST /auth/register", () => {
   let connection: DataSource;

   beforeAll(async () => {
      connection = await AppDataSource.initialize();
   });

   beforeEach(async () => {
      //database truncate
      await connection.dropDatabase();
      await connection.synchronize();
      // await truncatetables(connection);
   });

   afterAll(async () => {
      await connection.destroy();
   });

   describe("given all fields", () => {
      test("it should return the 201 status code", async () => {
         //Arrange
         const userdata = {
            firstname: "John",
            lastname: "jaob",
            email: "john@example.com",
            password: "password",
         };
         //Act
         const response = await request(app)
            .post("/auth/register")
            .send(userdata);

         //assert
         expect(response.statusCode).toBe(201);
      });

      test("suould return valid json response ", async () => {
         //Arrange
         const userdata = {
            firstname: "John",
            lastname: "jaob",
            email: "john@example.com",
            password: "password",
         };
         //Act
         const response = await request(app)
            .post("/auth/register")
            .send(userdata);

         //assert
         expect(
            (response.headers as Record<string, string>)["content-type"],
         ).toEqual(expect.stringContaining("json"));
      });

      test("should persist the user in the database", async () => {
         //Arrange
         const userdata = {
            firstname: "John",
            lastname: "jaob",
            email: "john@example.com",
            password: "password",
         };
         //Act
         await request(app).post("/auth/register").send(userdata);

         // Accert
         const userRepository = connection.getRepository(User);
         const users = await userRepository.find();
         expect(users).toHaveLength(1);
         expect(users[0].firstname).toEqual("John");
         expect(users[0].email).toBe(userdata.email);
      });

      test("should assign a customer role", async () => {
         const userdata = {
            firstname: "John",
            lastname: "jaob",
            email: "john@example.com",
            password: "password",
         };

         //Act
         await request(app).post("/auth/register").send(userdata);

         // Accert
         const userRepository = connection.getRepository(User);
         const users = await userRepository.find();
         expect(users[0]).toHaveProperty("role");
         expect(users[0].role).toBe(Roles.CUSTOMER);
      });

      test("it store the hashed password in the database", async () => {
         // Arrange
         const userdata = {
            firstname: "John",
            lastname: "jaob",
            email: "john@example.com",
            password: "password",
         };

         //Act
         await request(app).post("/auth/register").send(userdata);

         //assert
         const userRepository = connection.getRepository(User);
         const users = await userRepository.find();
         expect(users[0].password).not.toBe(userdata.password);
         expect(users[0].password).toHaveLength(60);
         expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
      });
   });

   describe("field are missing", () => {});
});
