import express, { NextFunction, Request, Response } from "express";
import { UserService } from "./../services/UserService";
import { AuthController } from "../controller/AuthController";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import logger from "../config/logger";
import registerValidators from "../validators/register.validators";

const router = express.Router();
// Dipendency injection
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const authController = new AuthController(userService, logger);

router.post(
   "/register",
   registerValidators,
   // eslint-disable-next-line @typescript-eslint/no-misused-promises
   (req: Request, res: Response, next: NextFunction) =>
      authController.register(req, res, next),
);

export default router;
