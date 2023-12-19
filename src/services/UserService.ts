import { User } from "./../entity/User";
import { UserData } from "../types";
import { Repository } from "typeorm";
import createHttpError from "http-errors";
import { Roles } from "../constants";

export class UserService {
   constructor(private userRepository: Repository<User>) {}
   async create({ firstname, lastname, email, password }: UserData) {
      try {
         return await this.userRepository.save({
            firstname,
            lastname,
            email,
            password,
            role: Roles.CUSTOMER,
         });
      } catch (error) {
         const err = createHttpError(
            500,
            "Failed to store the data in the database",
         );
         throw err;
      }
   }
}
