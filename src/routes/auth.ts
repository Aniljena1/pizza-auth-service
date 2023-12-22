import express, { NextFunction, Request, Response } from "express";
import { UserService } from "./../services/UserService";
import { AuthController } from "../controller/AuthController";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import logger from "../config/logger";
import registerValidators from "../validators/register.validators";
import { TokenService } from "../services/TokenService";
import { RefreshToken } from "../entity/RefreshToken";
import loginValidator from "../validators/login.validator";
import { CredentialService } from "../services/CredentialService";

const router = express.Router();
// Dipendency injection
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);
const credentialService = new CredentialService();
const authController = new AuthController(
   userService,
   logger,
   tokenService,
   credentialService,
);

router.post(
   "/register",
   registerValidators,
   // eslint-disable-next-line @typescript-eslint/no-misused-promises
   (req: Request, res: Response, next: NextFunction) =>
      authController.register(req, res, next),
);

router.post(
   "/login",
   loginValidator,
   // eslint-disable-next-line @typescript-eslint/no-misused-promises
   (req: Request, res: Response, next: NextFunction) =>
      authController.login(req, res, next),
);

export default router;
