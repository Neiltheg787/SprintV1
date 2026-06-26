# Sprint

Sprint is an AI Engineering Manager for the Agents for Hire hackathon. It coordinates humans and coding agents, turns feature requests into engineering tasks, detects duplicate or conflicting work, tracks blockers, and generates a final sprint report.

The demo is built to make one idea obvious:

> Sprint is not just a dashboard. Sprint actively coordinates humans and AI coding agents to prevent duplicate work and ship faster.

## Demo

The default app route runs a reliable local demo. Click **Run Demo** to watch Sprint:

- Type a feature request.
- Generate an implementation plan.
- Assign work to Human, Cursor, Claude Code, Copilot, and Merge Agent.
- Detect overlap on `src/auth/session.ts`.
- Recommend a reassignment.
- Generate an Engineering Manager Report.

## Run Locally

```bash
/Users/neilshah/.bun/bin/bun install
cd packages/app
/Users/neilshah/.bun/bin/bun run dev --host 127.0.0.1 --port 3000
```

If `bun` is already on your `PATH`, you can use `bun` instead of the absolute path.

## Build

```bash
cd packages/app
/Users/neilshah/.bun/bin/bun run build
```

## Implementation Notes

- The demo uses `mockEngineeringManager` in `packages/app/src/features/sprint-manager/manager.ts`, so it is reliable without external APIs.
- The provider interface is structured so a real AI provider can be plugged in later.
- The production app entry points at the standalone Sprint demo for hackathon reliability.

