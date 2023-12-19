import { UserService } from "./../services/UserService";
import { Response, NextFunction } from "express";
import { RegisterUserRequest } from "../types";
import { Logger } from "winston";
import { validationResult } from "express-validator";

export class AuthController {
   constructor(
      private userService: UserService,
      private logger: Logger,
   ) {}

   async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
      // validation
      const result = validationResult(req);
      if (!result.isEmpty()) {
         return res.status(400).json({ errors: result.array() });
      }
      const { firstname, lastname, email, password } = req.body;
      this.logger.debug("New request to register a user", {
         firstname,
         lastname,
         email,
      });

      try {
         const user = await this.userService.create({
            firstname,
            lastname,
            email,
            password,
         });

         this.logger.info("User has been registered", { id: user });
         res.status(201).json({ id: user });
      } catch (error) {
         next(error);
         return;
      }
   }
}
