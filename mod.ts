import type { Plugin } from "rolldown";
import { denoPrefixPlugin } from "./prefix-plugin.ts";
import { denoPlugin } from "./resolve-plugin.ts";
import type { DenoResolveResult } from "./resolver.ts";

export function deno(): Plugin[] {
  const cache = new Map<string, DenoResolveResult>();

  return [denoPrefixPlugin(cache), denoPlugin(cache)];
}
