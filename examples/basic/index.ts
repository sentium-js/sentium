import { Application } from "@sentium/web";
import { UserController } from "./user/user.controller.ts";

const app = new Application();

// register the user controller
app.registerController(UserController);

// start the server (use any server which gives you a request object and want a response object)
Deno.serve((request) => app.fetch(request));
