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
import authenticate from "../middlewares/authenticate";
import { AuthRequest } from "../types";
import validateRefreshToken from "../middlewares/validateRefreshToken";
import parseRefreshToken from "../middlewares/parseRefreshToken";

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

router.get(
   "/self",
   // eslint-disable-next-line @typescript-eslint/no-misused-promises
   authenticate,
   // eslint-disable-next-line @typescript-eslint/no-misused-promises
   (req: Request, res: Response) =>
      authController.self(req as AuthRequest, res),
);

router.post(
   "/refresh",
   // eslint-disable-next-line @typescript-eslint/no-misused-promises
   validateRefreshToken,
   // eslint-disable-next-line @typescript-eslint/no-misused-promises
   (req: Request, res: Response, next: NextFunction) =>
      authController.refresh(req as AuthRequest, res, next),
);

router.post(
   "/logout",
   // eslint-disable-next-line @typescript-eslint/no-misused-promises
   authenticate,
   // eslint-disable-next-line @typescript-eslint/no-misused-promises
   parseRefreshToken,
   // eslint-disable-next-line @typescript-eslint/no-misused-promises
   (req: Request, res: Response, next: NextFunction) =>
      authController.logout(req as AuthRequest, res, next),
);
export default router;
