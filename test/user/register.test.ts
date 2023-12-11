import request from "supertest";
import app from "../../src/app";

describe("POST /auth/register", () => {
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

         // accert
      });
   });

   describe("field are missing", () => {});
});
