export type SprintOwner = "Human" | "Cursor" | "Claude Code" | "Copilot" | "Merge Agent"
export type SprintStatus = "Planned" | "In Progress" | "Blocked" | "Done"

export type SprintTask = {
  id: string
  title: string
  description: string
  owner: SprintOwner
  status: SprintStatus
  files: string[]
  assignmentReason: string
}

export type SprintConflict = {
  file: string
  tasks: SprintTask[]
  owners: SprintOwner[]
  message: string
  recommendedAction: string
}

export type SprintDecision = {
  decision: string
  reason: string
  confidence: number
  action: string
}

export type SprintReport = {
  executiveSummary: string
  featureSummary: string
  assignedOwners: string[]
  currentProgress: string
  risks: string[]
  blockers: string[]
  recommendedNextSteps: string[]
}

export type SprintPlan = {
  featureRequest: string
  implementationPlan: string[]
  tasks: SprintTask[]
  decisions: SprintDecision[]
  activity: string[]
  conflicts: SprintConflict[]
  report: SprintReport
}

export type EngineeringManagerProvider = {
  planFeature: (featureRequest: string) => Promise<SprintPlan>
}

export function detectTaskOverlaps(tasks: SprintTask[]): SprintConflict[] {
  const byFile = new Map<string, SprintTask[]>()
  for (const task of tasks) {
    for (const file of task.files) {
      byFile.set(file, [...(byFile.get(file) ?? []), task])
    }
  }

  return [...byFile.entries()]
    .filter(([, fileTasks]) => fileTasks.length > 1)
    .map(([file, fileTasks]) => {
      const owners = [...new Set(fileTasks.map((task) => task.owner))]
      return {
        file,
        tasks: fileTasks,
        owners,
        message: `Potential duplicate work detected: ${owners.join(" and ")} are both touching session logic.`,
        recommendedAction:
          "Keep Claude Code on backend session logic. Move Cursor to UI-only LoginButton work.",
      }
    })
}

export function buildSprintReport(plan: Omit<SprintPlan, "report">): SprintReport {
  const ownerLines = plan.tasks.map((task) => `${task.owner}: ${task.title}`)
  const done = plan.tasks.filter((task) => task.status === "Done").length
  const active = plan.tasks.filter((task) => task.status === "In Progress").length
  const blocked = plan.tasks.filter((task) => task.status === "Blocked").length

  return {
    executiveSummary:
      "Sprint split Google OAuth into six owned workstreams, caught duplicate session work early, and redirected Cursor to UI-only work so the team can ship faster.",
    featureSummary: plan.featureRequest,
    assignedOwners: ownerLines,
    currentProgress: `${done}/${plan.tasks.length} tasks done, ${active} in progress, ${blocked} blocked on conflict resolution.`,
    risks: [
      "OAuth callback and session middleware both touch auth boundaries.",
      "Frontend login state can duplicate backend session responsibilities.",
      "Tests must cover failed OAuth exchange and expired sessions before release.",
    ],
    blockers: [
      "Cursor is blocked until session ownership is narrowed to UI-only LoginButton work.",
      "Human reviewer should confirm the OAuth provider configuration before merge.",
    ],
    recommendedNextSteps: [
      "Accept Sprint's reassignment recommendation and remove session.ts from Cursor's task.",
      "Let Claude Code finish OAuth/session backend first.",
      "Have Copilot generate integration tests from the final backend contract.",
      "Ask the Human owner to review scopes, callback URLs, and rollout notes.",
    ],
  }
}

export const mockEngineeringManager: EngineeringManagerProvider = {
  async planFeature(featureRequest) {
    const tasks: SprintTask[] = [
      {
        id: "repo-audit",
        title: "Audit existing auth and routing context",
        description: "Map current auth files, app routes, server hooks, and test helpers before implementation starts.",
        owner: "Human",
        status: "Done",
        files: ["src/auth/index.ts", "src/routes.ts", "tests/helpers/auth.ts"],
        assignmentReason: "A human should verify product and security assumptions before agents change auth behavior.",
      },
      {
        id: "oauth-backend",
        title: "Implement Google OAuth callback and token exchange",
        description: "Add OAuth endpoints, provider config, callback validation, and session creation.",
        owner: "Claude Code",
        status: "In Progress",
        files: ["src/api/oauth.ts", "src/auth/session.ts"],
        assignmentReason: "Claude Code is strongest for backend flow design, typed APIs, and edge-case handling.",
      },
      {
        id: "session-store",
        title: "Persist user sessions and add logout flow",
        description: "Create durable user session records, secure cookies, expiry handling, and logout invalidation.",
        owner: "Merge Agent",
        status: "Planned",
        files: ["src/db/schema/users.ts", "src/auth/cookies.ts", "src/api/logout.ts"],
        assignmentReason: "Sprint can own glue work across database, backend, and rollout sequencing.",
      },
      {
        id: "login-ui",
        title: "Build login button and signed-in header state",
        description: "Add the Google login button, loading states, and signed-in/signed-out header behavior.",
        owner: "Cursor",
        status: "Blocked",
        files: ["src/auth/session.ts", "src/components/LoginButton.tsx"],
        assignmentReason: "Cursor is ideal for quick UI iteration, but Sprint blocks backend overlap before it spreads.",
      },
      {
        id: "db-review",
        title: "Review user model and OAuth account migration",
        description: "Validate the user/account schema, migration shape, and rollback notes.",
        owner: "Human",
        status: "Planned",
        files: ["src/db/migrations/20260626_google_oauth.sql", "src/db/schema/users.ts"],
        assignmentReason: "Schema and auth migration review should stay with a human accountable for production risk.",
      },
      {
        id: "auth-tests",
        title: "Generate OAuth session tests",
        description: "Cover callback success, denied scopes, expired sessions, logout, and UI smoke tests.",
        owner: "Copilot",
        status: "Planned",
        files: ["tests/auth/oauth.spec.ts", "tests/auth/session.spec.ts", "tests/ui/login.spec.ts"],
        assignmentReason: "Copilot can rapidly produce broad test scaffolding once implementation contracts stabilize.",
      },
    ]

    const conflicts = detectTaskOverlaps(tasks)
    const planWithoutReport = {
      featureRequest,
      implementationPlan: [
        "Inspect repo auth boundaries and identify existing session entry points.",
        "Implement Google OAuth backend callback, token exchange, and secure session creation.",
        "Add user/session persistence with migration review before frontend wiring lands.",
        "Build login UI against a narrow backend contract without owning session logic.",
        "Generate integration tests for OAuth callback, session expiry, logout, and UI states.",
        "Produce a sprint summary with owners, blockers, risks, and next actions.",
      ],
      tasks,
      decisions: [
        {
          decision: "Split feature into 6 tasks",
          reason: "OAuth requires backend, frontend, database, tests, docs, and human security review.",
          confidence: 92,
          action: "Created owned workstreams with explicit file scopes.",
        },
        {
          decision: "Detected conflict risk",
          reason: "Two owners touch src/auth/session.ts.",
          confidence: 88,
          action: "Flagged duplicate session work before implementation diverged.",
        },
        {
          decision: "Reassigned Cursor",
          reason: "Avoid duplicate backend work and keep Cursor on fast UI iteration.",
          confidence: 85,
          action: "Moved Cursor to UI-only LoginButton work.",
        },
        {
          decision: "Reassigned tests to Copilot",
          reason: "Tests can be generated after backend contracts settle.",
          confidence: 82,
          action: "Queued OAuth/session specs for Copilot.",
        },
      ],
      activity: [
        "Analyzed repo context",
        "Detected auth-related files",
        "Split feature into backend, frontend, tests, docs",
        "Assigned OAuth backend to Claude Code",
        "Assigned login UI to Cursor",
        "Detected potential overlap in auth/session files",
        "Reassigned tests to Copilot",
        "Generated sprint summary",
      ],
      conflicts,
    }

    return {
      ...planWithoutReport,
      report: buildSprintReport(planWithoutReport),
    }
  },
}
