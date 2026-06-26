import { Config } from "effect"

function truthy(key: string) {
  const value = process.env[key]?.toLowerCase()
  return value === "true" || value === "1"
}

function falsy(key: string) {
  const value = process.env[key]?.toLowerCase()
  return value === "false" || value === "0"
}

export namespace Flag {
  export const MERGE_AUTO_SHARE = truthy("MERGE_AUTO_SHARE")
  export const MERGE_GIT_BASH_PATH = process.env["MERGE_GIT_BASH_PATH"]
  export const MERGE_CONFIG = process.env["MERGE_CONFIG"]
  export declare const MERGE_PURE: boolean
  export declare const MERGE_TUI_CONFIG: string | undefined
  export declare const MERGE_CONFIG_DIR: string | undefined
  export declare const MERGE_PLUGIN_META_FILE: string | undefined
  export const MERGE_CONFIG_CONTENT = process.env["SPRINT_CONFIG_CONTENT"] ?? process.env["MERGE_CONFIG_CONTENT"]
  export const MERGE_DISABLE_AUTOUPDATE = truthy("MERGE_DISABLE_AUTOUPDATE")
  export const MERGE_ALWAYS_NOTIFY_UPDATE = truthy("MERGE_ALWAYS_NOTIFY_UPDATE")
  export const MERGE_DISABLE_PRUNE = truthy("MERGE_DISABLE_PRUNE")
  export const MERGE_DISABLE_TERMINAL_TITLE = truthy("MERGE_DISABLE_TERMINAL_TITLE")
  export const MERGE_SHOW_TTFD = truthy("MERGE_SHOW_TTFD")
  export const MERGE_PERMISSION = process.env["MERGE_PERMISSION"]
  export const MERGE_DISABLE_DEFAULT_PLUGINS = truthy("MERGE_DISABLE_DEFAULT_PLUGINS")
  export const MERGE_DISABLE_LSP_DOWNLOAD = truthy("MERGE_DISABLE_LSP_DOWNLOAD")
  export const MERGE_ENABLE_EXPERIMENTAL_MODELS = truthy("MERGE_ENABLE_EXPERIMENTAL_MODELS")
  export const MERGE_DISABLE_AUTOCOMPACT = truthy("MERGE_DISABLE_AUTOCOMPACT")
  export const MERGE_DISABLE_MODELS_FETCH = truthy("MERGE_DISABLE_MODELS_FETCH")
  export const MERGE_DISABLE_CLAUDE_CODE = truthy("MERGE_DISABLE_CLAUDE_CODE")
  export const MERGE_DISABLE_CLAUDE_CODE_PROMPT =
    MERGE_DISABLE_CLAUDE_CODE || truthy("MERGE_DISABLE_CLAUDE_CODE_PROMPT")
  export const MERGE_DISABLE_CLAUDE_CODE_SKILLS =
    MERGE_DISABLE_CLAUDE_CODE || truthy("MERGE_DISABLE_CLAUDE_CODE_SKILLS")
  export const MERGE_DISABLE_EXTERNAL_SKILLS =
    MERGE_DISABLE_CLAUDE_CODE_SKILLS || truthy("MERGE_DISABLE_EXTERNAL_SKILLS")
  export declare const MERGE_DISABLE_PROJECT_CONFIG: boolean
  export const MERGE_FAKE_VCS = process.env["MERGE_FAKE_VCS"]
  export declare const MERGE_CLIENT: string
  export const MERGE_SERVER_PASSWORD = process.env["MERGE_SERVER_PASSWORD"]
  export const MERGE_SERVER_USERNAME = process.env["MERGE_SERVER_USERNAME"]
  export const MERGE_ENABLE_QUESTION_TOOL = truthy("MERGE_ENABLE_QUESTION_TOOL")
  export const MERGE_RELAY_AUTO = truthy("MERGE_RELAY_AUTO")
  export const MERGE_RELAY_URL = process.env["MERGE_RELAY_URL"]
  export const MERGE_RELAY_PORT = process.env["MERGE_RELAY_PORT"]

  // Experimental
  export const MERGE_EXPERIMENTAL = truthy("MERGE_EXPERIMENTAL")
  export const MERGE_EXPERIMENTAL_FILEWATCHER = Config.boolean("MERGE_EXPERIMENTAL_FILEWATCHER").pipe(
    Config.withDefault(false),
  )
  export const MERGE_EXPERIMENTAL_DISABLE_FILEWATCHER = Config.boolean(
    "MERGE_EXPERIMENTAL_DISABLE_FILEWATCHER",
  ).pipe(Config.withDefault(false))
  export const MERGE_EXPERIMENTAL_ICON_DISCOVERY =
    MERGE_EXPERIMENTAL || truthy("MERGE_EXPERIMENTAL_ICON_DISCOVERY")

  const copy = process.env["MERGE_EXPERIMENTAL_DISABLE_COPY_ON_SELECT"]
  export const MERGE_EXPERIMENTAL_DISABLE_COPY_ON_SELECT =
    copy === undefined ? process.platform === "win32" : truthy("MERGE_EXPERIMENTAL_DISABLE_COPY_ON_SELECT")
  export const MERGE_ENABLE_EXA =
    truthy("MERGE_ENABLE_EXA") || MERGE_EXPERIMENTAL || truthy("MERGE_EXPERIMENTAL_EXA")
  export const MERGE_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS = number("MERGE_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS")
  export const MERGE_EXPERIMENTAL_OUTPUT_TOKEN_MAX = number("MERGE_EXPERIMENTAL_OUTPUT_TOKEN_MAX")
  export const MERGE_EXPERIMENTAL_OXFMT = MERGE_EXPERIMENTAL || truthy("MERGE_EXPERIMENTAL_OXFMT")
  export const MERGE_EXPERIMENTAL_LSP_TY = truthy("MERGE_EXPERIMENTAL_LSP_TY")
  export const MERGE_EXPERIMENTAL_LSP_TOOL = MERGE_EXPERIMENTAL || truthy("MERGE_EXPERIMENTAL_LSP_TOOL")
  export const MERGE_DISABLE_FILETIME_CHECK = Config.boolean("MERGE_DISABLE_FILETIME_CHECK").pipe(
    Config.withDefault(false),
  )
  export const MERGE_EXPERIMENTAL_PLAN_MODE = MERGE_EXPERIMENTAL || truthy("MERGE_EXPERIMENTAL_PLAN_MODE")
  export const MERGE_EXPERIMENTAL_WORKSPACES = MERGE_EXPERIMENTAL || truthy("MERGE_EXPERIMENTAL_WORKSPACES")
  export const MERGE_EXPERIMENTAL_MARKDOWN = !falsy("MERGE_EXPERIMENTAL_MARKDOWN")
  export const MERGE_MODELS_URL = process.env["MERGE_MODELS_URL"]
  export const MERGE_MODELS_PATH = process.env["MERGE_MODELS_PATH"]
  export const MERGE_DISABLE_EMBEDDED_WEB_UI = truthy("MERGE_DISABLE_EMBEDDED_WEB_UI")
  export const MERGE_DB = process.env["MERGE_DB"]
  export const MERGE_DISABLE_CHANNEL_DB = truthy("MERGE_DISABLE_CHANNEL_DB")
  export const MERGE_SKIP_MIGRATIONS = truthy("MERGE_SKIP_MIGRATIONS")
  export const MERGE_STRICT_CONFIG_DEPS = truthy("MERGE_STRICT_CONFIG_DEPS")

  function number(key: string) {
    const value = process.env[key]
    if (!value) return undefined
    const parsed = Number(value)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
  }
}

// Dynamic getter for MERGE_DISABLE_PROJECT_CONFIG
// This must be evaluated at access time, not module load time,
// because external tooling may set this env var at runtime
Object.defineProperty(Flag, "MERGE_DISABLE_PROJECT_CONFIG", {
  get() {
    return truthy("MERGE_DISABLE_PROJECT_CONFIG")
  },
  enumerable: true,
  configurable: false,
})

// Dynamic getter for MERGE_TUI_CONFIG
// This must be evaluated at access time, not module load time,
// because tests and external tooling may set this env var at runtime
Object.defineProperty(Flag, "MERGE_TUI_CONFIG", {
  get() {
    return process.env["MERGE_TUI_CONFIG"]
  },
  enumerable: true,
  configurable: false,
})

// Dynamic getter for MERGE_CONFIG_DIR
// This must be evaluated at access time, not module load time,
// because external tooling may set this env var at runtime
Object.defineProperty(Flag, "MERGE_CONFIG_DIR", {
  get() {
    return process.env["MERGE_CONFIG_DIR"]
  },
  enumerable: true,
  configurable: false,
})

// Dynamic getter for MERGE_PURE
// This must be evaluated at access time, not module load time,
// because the CLI can set this flag at runtime
Object.defineProperty(Flag, "MERGE_PURE", {
  get() {
    return truthy("MERGE_PURE")
  },
  enumerable: true,
  configurable: false,
})

// Dynamic getter for MERGE_PLUGIN_META_FILE
// This must be evaluated at access time, not module load time,
// because tests and external tooling may set this env var at runtime
Object.defineProperty(Flag, "MERGE_PLUGIN_META_FILE", {
  get() {
    return process.env["MERGE_PLUGIN_META_FILE"]
  },
  enumerable: true,
  configurable: false,
})

// Dynamic getter for MERGE_CLIENT
// This must be evaluated at access time, not module load time,
// because some commands override the client at runtime
Object.defineProperty(Flag, "MERGE_CLIENT", {
  get() {
    return process.env["MERGE_CLIENT"] ?? "cli"
  },
  enumerable: true,
  configurable: false,
})
