import request from "supertest";
import app from "./src/app";

describe("App", () => {
   test("should work", () => {});

   test("should retuen 200", async () => {
      const response = await request(app).get("/").send();
      expect(response.statusCode).toBe(200);
   });
});
