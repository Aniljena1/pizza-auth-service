import { UserService } from "./../services/UserService";
import { Response, NextFunction } from "express";
import { AuthRequest, RegisterUserRequest } from "../types";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { TokenService } from "../services/TokenService";
import createHttpError from "http-errors";
import { CredentialService } from "../services/CredentialService";

export class AuthController {
   constructor(
      private userService: UserService,
      private logger: Logger,
      private tokenService: TokenService,
      private credentialService: CredentialService,
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

   async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
      // validation
      const result = validationResult(req);
      if (!result.isEmpty()) {
         return res.status(400).json({ errors: result.array() });
      }
      const { email, password } = req.body;
      this.logger.debug("New request to login a user", {
         email,
         password: "*****",
      });

      // check if username(emial) exists in database
      // compare password
      // generate tokens
      // Add token to Cookies
      // Return the response (id)

      try {
         const user = await this.userService.findByEmail(email);
         if (!user) {
            const error = createHttpError(
               400,
               "email and password doesn't match",
            );
            next(error);
            return;
         }

         const passWordmatch = await this.credentialService.comparePassword(
            password,
            user.password,
         );
         if (!passWordmatch) {
            const error = createHttpError(
               400,
               "email and password doesn't match",
            );
            next(error);
            return;
         }

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

         console.log("accessToken========>", accessToken);
         console.log("refreshToken=======>", refreshToken);

         this.logger.info("User has been logged in", { id: user.id });
         res.status(200).json({ id: user.id });
      } catch (error) {
         next(error);
         return;
      }
   }

   async self(req: AuthRequest, res: Response) {
      const user = await this.userService.findByID(Number(req.auth.sub));
      res.json({ ...user, password: undefined });
   }

   async refresh(req: AuthRequest, res: Response, next: NextFunction) {
      try {
         const payload: JwtPayload = {
            sub: req.auth.sub,
            role: req.auth.role,
         };

         const accessToken = this.tokenService.generateAccessToken(payload);

         const user = await this.userService.findByID(Number(req.auth.sub));
         if (!user) {
            const error = createHttpError(
               400,
               "User with the token could not find",
            );
            next(error);
            return;
         }

         // Persist the refresh token
         const newRefreshToken =
            await this.tokenService.persistRefreshToken(user);

         // Delete old refresh token
         await this.tokenService.deleteRefreshToken(Number(req.auth.id));

         const refreshToken = this.tokenService.generateRefreshToken({
            ...payload,
            id: String(newRefreshToken.id),
         });

         res.cookie("accessToken", accessToken, {
            domain: "localhost",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60, // 1h
            httpOnly: true, // Very important
         });

         res.cookie("refreshToken", refreshToken, {
            domain: "localhost",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
            httpOnly: true, // Very important
         });

         this.logger.info("User has been logged in", { id: user.id });
         res.json({ id: user.id });
      } catch (err) {
         next(err);
         return;
      }
   }
}
