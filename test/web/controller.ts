import { controller, Meta, setMeta } from "../../modules/web/mod.ts";

type MyMeta = {
  auth: { required: boolean };
};

Deno.test("simple controller", () => {
  @controller("/asd")
  @setMeta("jesus", "cool")
  class Controller {
    @setMeta("jesus", "christ")
    method() {}
  }

  const classMeta = Meta.of(Controller);
  const methodMeta = Meta.of(Controller.prototype.method);

  console.log(classMeta.targetType);
  console.log(classMeta.get("jesus"));

  console.log(methodMeta.targetType);
  console.log(methodMeta.get("jesus"));
});
