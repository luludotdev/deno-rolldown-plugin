import process from "node:process";
import type { Plugin } from "rolldown";
import type { DenoResolveResult } from "./resolver.ts";
import { resolveDeno, resolveViteSpecifier } from "./resolver.ts";

export function denoPrefixPlugin(
  cache: Map<string, DenoResolveResult>
): Plugin {
  // TODO: translate this
  let root = process.cwd();

  return {
    name: "deno:prefix",
    // configResolved(config) {
    //   root = config.root;
    // },
    resolveId: {
      order: "pre",
      async handler(id, importer) {
        if (id.startsWith("npm:")) {
          const resolved = await resolveDeno(id, root);
          if (resolved === null) return;
          // TODO: Resolving custom versions is not supported at the moment
          const actual = resolved.id.slice(0, resolved.id.indexOf("@"));
          const result = await this.resolve(actual);
          return result ?? actual;
        } else if (id.startsWith("http:") || id.startsWith("https:")) {
          return await resolveViteSpecifier(id, cache, root, importer);
        }
      },
    },
  };
}
