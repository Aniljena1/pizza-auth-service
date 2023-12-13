import { UserService } from "./../services/UserService";
import { Response } from "express";
import { RegisterUserRequest } from "../types";

export class AuthController {
   userService: UserService;
   constructor(userService: UserService) {
      this.userService = userService;
   }

   async register(req: RegisterUserRequest, res: Response) {
      const { firstname, lastname, email, password } = req.body;
      await this.userService.create({ firstname, lastname, email, password });
      res.status(201).json();
   }
}
