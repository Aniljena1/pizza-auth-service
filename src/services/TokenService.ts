import fs from "fs";
import createHttpError from "http-errors";
import { JwtPayload, sign } from "jsonwebtoken";
import path from "path";
import { Config } from "../config";
import { User } from "../entity/User";
import { RefreshToken } from "../entity/RefreshToken";
import { Repository } from "typeorm";

export class TokenService {
   constructor(private refreshTokenRepository: Repository<RefreshToken>) {}
   generateAccessToken(payload: JwtPayload) {
      let privateKey: Buffer;
      try {
         privateKey = fs.readFileSync(
            path.join(__dirname, "../../certs/private.pem"),
         );
      } catch (err) {
         const error = createHttpError(500, "Error while reading private key");
         throw error;
      }
      const accessToken = sign(payload, privateKey, {
         algorithm: "RS256",
         expiresIn: "1h",
         issuer: "auth-service", // service name
      });
      console.log("accessToken", accessToken);
      return accessToken;
   }

   generateRefreshToken(payload: JwtPayload) {
      const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
         // ! -> sure string
         algorithm: "HS256",
         expiresIn: "1y",
         issuer: "auth-service", // service name
         jwtid: String(payload.id),
      });
      return refreshToken;
   }

   async persistRefreshToken(user: User) {
      const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365; //leap year-366
      //   const RefreshTokenRepository = AppDataSource.getRepository(RefreshToken);
      const newRefreshToken = await this.refreshTokenRepository.save({
         user: user,
         expiresAt: new Date(Date.now() + MS_IN_YEAR),
      });
      return newRefreshToken;
   }

   async deleteRefreshToken(tokenId: number) {
      return await this.refreshTokenRepository.delete({ id: tokenId });
   }
}
