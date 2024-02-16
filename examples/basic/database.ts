import { injectable } from "../../modules/injectable/mod.ts";
import { simulateLoading } from "./utils.ts";
import { User } from "./types.ts";

@injectable([], async () => {
  // simulate connecting to a database
  await simulateLoading();

  // after the connection is established, return the connection
  return new DatabaseConnection();
})
export class DatabaseConnection {
  private readonly users: Map<string, User> = new Map();

  constructor() {
    // add some initial users

    const user1 = crypto.randomUUID();
    const user2 = crypto.randomUUID();

    this.users.set(user1, {
      id: user1,
      name: "Jane Doe",
      skills: ["TypeScript", "React", "Rust"],
    });

    this.users.set(user2, {
      id: user2,
      name: "John Doe",
      skills: ["Pyhton", "C++", "Cyber Security"],
    });
  }

  async getUsers(): Promise<User[]> {
    await simulateLoading();
    return Array.from(this.users.values());
  }

  async getUser(userId: string): Promise<User | undefined> {
    await simulateLoading();
    return this.users.get(userId);
  }

  async addUser(user: User): Promise<User> {
    await simulateLoading();
    this.users.set(user.id, user);
    return user;
  }

  async removeUser(userId: string): Promise<void> {
    await simulateLoading();
    this.users.delete(userId);
  }

  async updateUser(user: User): Promise<User> {
    await simulateLoading();
    this.users.set(user.id, user);
    return user;
  }
}
