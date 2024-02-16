import {
  Context,
  controller,
  ctx,
  del,
  get,
  inject,
  param,
  ParamResolver,
  post,
  put,
} from "../../../modules/web/mod.ts";
import { UserService } from "./user.service.ts";

// basic body parser
const createUserBody: ParamResolver<{ name: string; skills: string[] }> =
  async (
    ctx,
  ) => {
    const json = await ctx.req.json().catch(() => undefined) as any;
    if (!json) throw new Error("Invalid body");
    if (!json.name || !json.skills) throw new Error("Invalid body");
    return json;
  };

// basic body parser
const updateUserBody: ParamResolver<{ name?: string; skills?: string[] }> =
  async (
    ctx,
  ) => {
    const json = await ctx.req.json().catch(() => undefined) as any;
    if (!json) throw new Error("Invalid body");
    return json;
  };

@controller("/users", [UserService])
export class UserController {
  constructor(private readonly userService: UserService) {}

  @get("/")
  getUsers() {
    return this.userService.getUsers();
  }

  @get("/:userId")
  @inject(param<string>("userId"))
  getUser(userId: string) {
    return this.userService.getUser(userId);
  }

  @post("/")
  @inject(ctx, createUserBody)
  addUser(ctx: Context, user: { name: string; skills: string[] }) {
    ctx.res.status = 201;
    return this.userService.addUser(user.name, user.skills);
  }

  @put("/:userId")
  @inject(param<string>("userId"), updateUserBody)
  updateUser(userId: string, user: { name?: string; skills?: string[] }) {
    return this.userService.updateUser(userId, user);
  }

  @del("/:userId")
  @inject(param<string>("userId"))
  deleteUser(userId: string) {
    this.userService.removeUser(userId);
    return "ok";
  }
}
