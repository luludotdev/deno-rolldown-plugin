# Deno Rolldown Plugin

> This is mostly a port of the amazing [Deno esbuild Plugin](https://github.com/denoland/deno-esbuild-plugin).
> Rolldown is currently pre-1.0 and this plugin has no production-ready guarantees.

---

Plugin to enable Deno resolution inside [rolldown](https://rolldown.rs/).
It supports:

- Alias mappings in `deno.json`
- `npm:` specifier
- `jsr:` specifier
- `http:` and `https:` specifiers
