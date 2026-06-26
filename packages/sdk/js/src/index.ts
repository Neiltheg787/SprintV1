export * from "./client.js"
export * from "./server.js"

import { createMergeClient } from "./client.js"
import { createMergeServer } from "./server.js"
import type { ServerOptions } from "./server.js"

export async function createOpencode(options?: ServerOptions) {
  const server = await createMergeServer({
    ...options,
  })

  const client = createMergeClient({
    baseUrl: server.url,
  })

  return {
    client,
    server,
  }
}
