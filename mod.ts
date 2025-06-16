import type { Loader } from "@deno/loader";
import { MediaType, ResolutionMode, Workspace } from "@deno/loader";
import * as path from "@std/path";
import { isBuiltin } from "node:module";
import type { ModuleType, Plugin } from "rolldown";

export interface DenoPluginOptions {
  /** Show debugging logs */
  debug?: boolean;
  /** Use this path to a `deno.json` instead of auto-discovering it. */
  configPath?: string;
  /** Don't transpile files when loading them */
  noTranspile?: boolean;
  /** Keep JSX as is, instead of transpiling it according to compilerOptions. */
  preserveJsx?: boolean;
}

export function denoPlugin(options: DenoPluginOptions = {}): Plugin {
  let workspace: Workspace;
  let loader: Loader;

  return {
    name: "deno",
    async buildStart(opts) {
      workspace = new Workspace({
        debug: options.debug,
        configPath: options.configPath,
      });

      // Normalize entrypoints for deno graph
      const entrypoints: string[] = [];
      const rawEntries = opts.input;
      if (rawEntries !== undefined) {
        if (Array.isArray(rawEntries)) {
          for (const entry of rawEntries) {
            entrypoints.push(entry);
          }
        } else {
          for (const [_name, file] of Object.entries(rawEntries)) {
            entrypoints.push(file);
          }
        }
      }

      loader = await workspace.createLoader({
        entrypoints,
        noTranspile: options.noTranspile,
        preserveJsx: options.preserveJsx,
      });
    },
    resolveId(id, importer, opts) {
      if (isBuiltin(id)) {
        return { id, external: true };
      }

      const kind = opts.kind === "require-call"
        ? ResolutionMode.Require
        : ResolutionMode.Import;

      const res = loader.resolve(id, importer, kind);
      const resolved = res.startsWith("file:") ? path.fromFileUrl(res) : res;

      return {
        id: resolved,
      };
    },
    async load(id) {
      const url = id.startsWith("http:") ||
          id.startsWith("https:") ||
          id.startsWith("npm:") ||
          id.startsWith("jsr:")
        ? id
        : path.toFileUrl(id).toString();

      const res = await loader.load(url);
      if (res.kind === "external") {
        return null;
      }

      return {
        code: new TextDecoder().decode(res.code),
        moduleType: mediaToLoader(res.mediaType),
      };
    },
  };
}

function mediaToLoader(type: MediaType): ModuleType {
  switch (type) {
    case MediaType.Jsx:
      return "jsx";
    case MediaType.JavaScript:
    case MediaType.Mjs:
    case MediaType.Cjs:
      return "js";
    case MediaType.TypeScript:
    case MediaType.Mts:
    case MediaType.Dmts:
    case MediaType.Dcts:
      return "ts";
    case MediaType.Tsx:
      return "tsx";
    case MediaType.Css:
      return "css";
    case MediaType.Json:
      return "json";
    case MediaType.Html:
      return "default";
    case MediaType.Sql:
      return "default";
    case MediaType.Wasm:
      return "binary";
    case MediaType.SourceMap:
      return "json";
    case MediaType.Unknown:
      return "default";
    default:
      return "default";
  }
}
