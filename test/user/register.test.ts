import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/entity/User";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";
import { isJwt } from "../utils";
import { RefreshToken } from "../../src/entity/RefreshToken";
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

      test("should return 400 status code if email already exists", async () => {
         // Arrange
         const userdata = {
            firstname: "John",
            lastname: "jaob",
            email: "john@example.com",
            password: "password",
         };

         const userRepository = connection.getRepository(User);
         await userRepository.save({ ...userdata, role: Roles.CUSTOMER });

         //Act
         const response = await request(app)
            .post("/auth/register")
            .send(userdata);

         const users = await userRepository.find();

         //assert
         expect(response.statusCode).toBe(400);
         expect(users).toHaveLength(1);
      });

      test("should return the access token and refresh token insid e cookie", async () => {
         // Arrange
         const userdata = {
            firstname: "John",
            lastname: "jaob",
            email: " anil123@gmail.com ",
            password: "password",
         };

         interface Headers {
            ["set-cookie"]: string[];
         }

         //Act
         const response = await request(app)
            .post("/auth/register")
            .send(userdata);

         let accessToken = null;
         let refreshToken = null;

         const cookies = (response.headers as Headers)["set-cookie"] || [];
         cookies.forEach((cookie) => {
            if (cookie.startsWith("accessToken=")) {
               accessToken = cookie.split(";")[0].split("=")[1];
            }
            if (cookie.startsWith("refreshToken=")) {
               refreshToken = cookie.split(";")[0].split("=")[1];
            }
         });
         expect(accessToken).not.toBeNull();
         expect(refreshToken).not.toBeNull();
         expect(isJwt(accessToken)).toBeTruthy();
         expect(isJwt(refreshToken)).toBeTruthy();
      });

      test("should refrsh token store in the database", async () => {
         // Arrange
         const userdata = {
            firstname: "John",
            lastname: "jaob",
            email: " anil123@gmail.com ",
            password: "password",
         };

         //Act
         // const response =
         await request(app).post("/auth/register").send(userdata);

         const refreshTokenRepo = connection.getRepository(RefreshToken);
         const refreshTokens = await refreshTokenRepo.find();
         expect(refreshTokens).toHaveLength(1);

         // const tokens = await refreshTokenRepo
         //    .createQueryBuilder("refreshToken")
         //    .where("refreshToken.userId = :userId", {
         //       userId: (response.body as Record<string, string>).id,
         //    })
         //    .getMany();

         // expect(tokens).toHaveLength(1);
      });
   });

   describe("field are missing", () => {
      test("it should return if email field is missing", async () => {
         // Arrange
         const userdata = {
            firstname: "John",
            lastname: "jaob",
            email: "",
            password: "password",
         };

         //Act
         const response = await request(app)
            .post("/auth/register")
            .send(userdata);
         expect(response.statusCode).toBe(400);

         const userRepository = connection.getRepository(User);
         const users = await userRepository.find();
         expect(users).toHaveLength(0);
      });
      test.todo("should return 400 status code if firstname are missing");
      test.todo("should return 400 status code if lastname are missing");
      test.todo("should return 400 status code if password are missing");
   });

   describe("fields are not proper format", () => {
      test("trim the email field", async () => {
         // Arrange
         const userdata = {
            firstname: "John",
            lastname: "jaob",
            email: " anil123@gmail.com ",
            password: "password",
         };

         //Act
         await request(app).post("/auth/register").send(userdata);

         const userRepository = connection.getRepository(User);
         const users = await userRepository.find();
         const user = users[0];
         expect(user.email).toBe("anil123@gmail.com");
      });
   });
});
