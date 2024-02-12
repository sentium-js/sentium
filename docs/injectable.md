# @sentium/injectable

Modern Dependency Injection library for TypeScript using the new
[TC39 Decorators](https://github.com/tc39/proposal-decorators).

## Usage

```typescript
import { injectable, resolve } from "@sentium/injectable";

@injectable()
class MyClass {
  ...
}

const myInstance = resolve(MyClass);
```

## Features

- Ultrafast & **Lightweight**
- **Multi-runtime**
  - Works on Node.js, Deno, Bun or Cloudflare.
- Sync or **Async**
  - Inject classes that are resolved asynchronously.
- **Type**-safety
- Injection **scopes**

## Installation

### Using `npm`, `yarn`, `pnpm`, `bun`

```bash
   # npm
   npm install @sentium/injectable

   # yarn
   yarn add @sentium/injectable

   # pnpm
   pnpm add @sentium/injectable

   # bun
   bun add @sentium/injectable
```

### Using `deno`

```typescript
import { ... } from "https://deno.land/x/sentium/injectable/mod.ts";
```

## Documentation

_TODO_
