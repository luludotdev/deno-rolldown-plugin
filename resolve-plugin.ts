import * as fsp from "node:fs/promises";
import process from "node:process";
import type { Plugin } from "rolldown";
import type { DenoMediaType, DenoResolveResult } from "./resolver.ts";
import {
  isDenoSpecifier,
  parseDenoSpecifier,
  resolveViteSpecifier,
} from "./resolver.ts";

export function denoPlugin(cache: Map<string, DenoResolveResult>): Plugin {
  let root = process.cwd();

  return {
    name: "deno",
    buildStart(options) {
      const cwd = options.cwd;
      if (cwd) root = cwd;
    },
    async resolveId(id, importer) {
      // The "pre"-resolve plugin already resolved it
      if (isDenoSpecifier(id)) return;

      return await resolveViteSpecifier(id, cache, root, importer);
    },
    async load(id) {
      if (!isDenoSpecifier(id)) return;

      const { loader, resolved } = parseDenoSpecifier(id);

      const moduleType = mediaTypeToLoader(loader);
      const content = await fsp.readFile(resolved, "utf-8");

      if (moduleType !== "json") {
        return { code: content, moduleType };
      }

      // TODO: support JSON

      return null;

      // const result = await transform(content, {
      //   format: "esm",
      //   loader: mediaTypeToLoader(loader),
      //   logLevel: "debug",
      // });

      // // Issue: https://github.com/denoland/deno-vite-plugin/issues/38
      // // Esbuild uses an empty string as empty value and vite expects
      // // `null` to be the empty value. This seems to be only the case in
      // // `dev` mode
      // const map = result.map === "" ? null : result.map;

      // return {
      //   code: result.code,
      //   map,
      // };
    },
  };
}

function mediaTypeToLoader(
  media: DenoMediaType
): "js" | "jsx" | "ts" | "tsx" | "json" {
  switch (media) {
    case "JSX":
      return "jsx";
    case "JavaScript":
      return "js";
    case "Json":
      return "json";
    case "TSX":
      return "tsx";
    case "TypeScript":
      return "ts";
  }
}
