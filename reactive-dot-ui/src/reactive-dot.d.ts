import type { config } from "./config";

declare module "@reactive-dot/core" {
  export interface Register {
    config: typeof config;
  }
}
