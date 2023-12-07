import request from "supertest";
import app from "./src/app";
import calculetDiscout from "./src/utils";

describe("App", () => {
   test("should work", () => {
      const result = calculetDiscout(100, 10);
      expect(result).toBe(10);
   });

   test("should retuen 200", async () => {
      const response = await request(app).get("/").send();
      expect(response.statusCode).toBe(200);
   });
});
