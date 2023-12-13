import { User } from "./../entity/User";
import { UserData } from "../types";
import { Repository } from "typeorm";

export class UserService {
   constructor(private userRepository: Repository<User>) {}
   async create({ firstname, lastname, email, password }: UserData) {
      //   const userRepository = AppDataSource.getRepository(User);
      await this.userRepository.save({ firstname, lastname, email, password });
   }
}
