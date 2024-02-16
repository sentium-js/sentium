import { injectable } from "../../../modules/injectable/mod.ts";
import { DatabaseConnection } from "../database.ts";

@injectable([DatabaseConnection])
export class UserService {
  constructor(private readonly database: DatabaseConnection) {}

  getUsers() {
    return this.database.getUsers();
  }

  getUser(userId: string) {
    return this.database.getUser(userId);
  }

  addUser(name: string, skills: string[]) {
    return this.database.addUser({ id: crypto.randomUUID(), name, skills });
  }

  removeUser(userId: string) {
    return this.database.removeUser(userId);
  }

  async updateUser(userId: string, user: { name?: string; skills?: string[] }) {
    const existingUser = await this.database.getUser(userId);

    if (!existingUser) {
      throw new Error(`User with id ${userId} does not exist.`);
    }

    const newUser = { ...existingUser, ...user };

    return this.database.updateUser(newUser);
  }
}
