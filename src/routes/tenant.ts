import express, { NextFunction, RequestHandler, Response } from "express";
import { TenantController } from "../controller/TenantController";
import { TenantService } from "../services/TenantService";
import { AppDataSource } from "../config/data-source";
import { Teant } from "../entity/Tenant";
import logger from "../config/logger";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";
import tenantValidator from "../validators/tenant.validator";
import { CreateTenantRequest } from "../types";

const router = express.Router();

const tenantRepository = AppDataSource.getRepository(Teant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

router.post(
   "/",
   authenticate as RequestHandler,
   canAccess([Roles.ADMIN]),
   tenantValidator,
   (req: CreateTenantRequest, res: Response, next: NextFunction) =>
      tenantController.create(req, res, next) as unknown as RequestHandler,
);

router.patch(
   "/:id",
   authenticate as RequestHandler,
   canAccess([Roles.ADMIN]),
   tenantValidator,
   (req: CreateTenantRequest, res: Response, next: NextFunction) =>
      tenantController.update(req, res, next) as unknown as RequestHandler,
);
router.get(
   "/",
   (req, res, next) =>
      tenantController.getAll(req, res, next) as unknown as RequestHandler,
);
router.get(
   "/:id",
   authenticate as RequestHandler,
   canAccess([Roles.ADMIN]),
   (req, res, next) =>
      tenantController.getOne(req, res, next) as unknown as RequestHandler,
);
router.delete(
   "/:id",
   authenticate as RequestHandler,
   canAccess([Roles.ADMIN]),
   (req, res, next) =>
      tenantController.destroy(req, res, next) as unknown as RequestHandler,
);

export default router;
