import { UserService } from "./../services/UserService";
import { Response, NextFunction } from "express";
import { RegisterUserRequest } from "../types";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { TokenService } from "../services/TokenService";

export class AuthController {
   constructor(
      private userService: UserService,
      private logger: Logger,
      private tokenService: TokenService,
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

         const payload: JwtPayload = {
            sub: String(user.id),
            role: user.role,
         };

         const accessToken = this.tokenService.generateAccessToken(payload);
         // Persist the refresh token
         const newRefreshToken =
            await this.tokenService.persistRefreshToken(user);

         const refreshToken = this.tokenService.generateRefreshToken({
            ...payload,
            id: String(newRefreshToken.id),
         });

         res.cookie("accessToken", accessToken, {
            domain: "localhost",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60, //1hr
            httpOnly: true,
         });

         res.cookie("refreshToken", refreshToken, {
            domain: "localhost",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 365, //1y
            httpOnly: true,
         });

         this.logger.info("User has been registered", { id: user });
         res.status(201).json({ id: user });
      } catch (error) {
         next(error);
         return;
      }
   }
}
