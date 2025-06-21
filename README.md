# Deno Rolldown Plugin

> This is mostly a port of the amazing
> [Deno esbuild Plugin](https://github.com/denoland/deno-esbuild-plugin).
> Rolldown is currently pre-1.0 and this plugin has no production-ready
> guarantees.

---

Plugin to enable Deno resolution inside [rolldown](https://rolldown.rs/). It
supports:

- Alias mappings in `deno.json`
- `npm:` specifier
- `jsr:` specifier
- `http:` and `https:` specifiers

## Usage

1. Install this package
2. Import it and add to the `rolldown` config

```ts
import * as rolldown from "rolldown";
import { denoPlugin } from "@lulu/deno-rolldown-plugin";

await rolldown.build({
  input: ["./main.ts"],
  output: { file: "./main.bundle.js" },
  plugins: [denoPlugin()],
});
```
