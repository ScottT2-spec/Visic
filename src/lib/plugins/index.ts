export { PluginEngine, runHook } from "./engine";
export type {
  HookName,
  HookContext,
  HookResult,
  PluginManifest,
  PluginExecResult,
  AddedFee,
  SettingsField,
  PluginCategory,
} from "./types";

// Import handlers to register them
import "./handlers";
