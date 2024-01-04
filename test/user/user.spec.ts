import { DataSource } from "typeorm";
import request from "supertest";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import createJWKSMock from "mock-jwks";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";

describe("GET /auth/self", () => {
   let connection: DataSource;
   let jwks: ReturnType<typeof createJWKSMock>;

   beforeAll(async () => {
      connection = await AppDataSource.initialize();
      jwks = createJWKSMock("http://localhost:5501");
   });

   beforeEach(async () => {
      jwks.start();
      await connection.dropDatabase();
      await connection.synchronize();
   });

   afterEach(async () => {
      jwks.stop();
   });

   afterAll(async () => {
      await connection.destroy();
   });

   describe("given all fields", () => {
      it("should return the 200 status code", async () => {
         const accessToken = jwks.token({
            sub: "1",
            role: Roles.CUSTOMER,
         });
         const response = await request(app)
            .get("/auth/self")
            .set("Cookie", [`accessToken=${accessToken}`])
            .send();
         expect(response.statusCode).toBe(200);
      });

      it("should return the user data", async () => {
         // register user
         const userData = {
            firstname: "John",
            lastname: "jaob",
            email: "anil123@gmail.com",
            password: "password",
         };
         const userRepository = connection.getRepository(User);
         const data = await userRepository.save({
            ...userData,
            role: Roles.CUSTOMER,
         });
         // generate token
         const Aaccesstoken = jwks.token({
            sub: String(data.id),
            role: data.role,
         });
         const response = await request(app)
            .get("/auth/self")
            .set("Cookie", [`accessToken=${Aaccesstoken};`])
            .send();
         // Check if user id matches with registered user
         expect((response.body as Record<string, string>).id).toBe(data.id);
      });

      it("should not return passwor field", async () => {
         const userData = {
            firstname: "John",
            lastname: "jaob",
            email: "anil123@gmail.com",
            password: "password",
         };
         const userRepository = connection.getRepository(User);
         const data = await userRepository.save({
            ...userData,
            role: Roles.CUSTOMER,
         });
         // generate token
         const Aaccesstoken = jwks.token({
            sub: String(data.id),
            role: data.role,
         });
         const response = await request(app)
            .get("/auth/self")
            .set("Cookie", [`accessToken=${Aaccesstoken};`])
            .send();
         // Check if user id matches with registered user
         expect(response.body as Record<string, string>).not.toHaveProperty(
            "password",
         );
      });

      it("should return 401 status code if token does not", async () => {
         const userData = {
            firstname: "John",
            lastname: "jaob",
            email: "anil123@gmail.com",
            password: "password",
         };
         const userRepository = connection.getRepository(User);
         await userRepository.save({
            ...userData,
            role: Roles.CUSTOMER,
         });

         const response = await request(app).get("/auth/self").send();
         expect(response.statusCode).toBe(401);
      });
   });
});
