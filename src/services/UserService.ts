import bcrypt from "bcrypt";
import { User } from "./../entity/User";
import { UserData } from "../types";
import { Repository } from "typeorm";
import createHttpError from "http-errors";
import { Roles } from "../constants";

export class UserService {
   constructor(private userRepository: Repository<User>) {}

   async create({ firstname, lastname, email, password }: UserData) {
      const user = await this.userRepository.findOne({
         where: { email: email },
      });
      if (user) {
         const err = createHttpError(400, "Email is already exists");
         throw err;
      }

      // hashed password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      try {
         return await this.userRepository.save({
            firstname,
            lastname,
            email,
            password: hashedPassword,
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

   async findByEmail(email: string) {
      const user = await this.userRepository.findOne({
         where: { email },
      });
      return user;
   }

   async findByID(id: number) {
      return await this.userRepository.findOne({
         where: { id },
      });
   }
}
