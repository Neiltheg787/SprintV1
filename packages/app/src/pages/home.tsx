import { createMemo, createSignal, For, onCleanup, Show } from "solid-js"
import { Button } from "@merge-ai/ui/button"
import { useLayout } from "@/context/layout"
import { useNavigate } from "@solidjs/router"
import { base64Encode } from "@merge-ai/util/encode"
import { usePlatform } from "@/context/platform"
import { DateTime } from "luxon"
import { useDialog } from "@merge-ai/ui/context/dialog"
import { DialogSelectDirectory } from "@/components/dialog-select-directory"
import { DialogSelectServer } from "@/components/dialog-select-server"
import { useServer } from "@/context/server"
import { useGlobalSync } from "@/context/global-sync"
import { useLanguage } from "@/context/language"
import {
  mockEngineeringManager,
  type SprintOwner,
  type SprintPlan,
  type SprintStatus,
} from "@/features/sprint-manager/manager"

const defaultFeatureRequest = "Build Google OAuth login with user sessions and tests."

const statusClass = (status: SprintStatus) => {
  return {
    Done: "bg-icon-success-base/12 text-icon-success-base shadow-[inset_0_0_0_1px_rgba(47,127,77,0.16)]",
    "In Progress": "bg-icon-info-base/12 text-icon-info-base shadow-[inset_0_0_0_1px_rgba(63,111,217,0.16)]",
    Blocked: "bg-icon-critical-base/12 text-icon-critical-base shadow-[inset_0_0_0_1px_rgba(206,73,61,0.16)]",
    Planned: "bg-surface-raised-base text-text-base shadow-xs-border-base",
  }[status]
}

const ownerClass = (owner: SprintOwner) => {
  return {
    Human: "bg-background-stronger text-text-strong shadow-xs-border-base",
    Cursor: "bg-[#e8f5ff] text-[#0b5b93]",
    "Claude Code": "bg-[#fff1df] text-[#9a5219]",
    Copilot: "bg-[#eef9ec] text-[#2d6f37]",
    "Merge Agent": "bg-[#f0ecff] text-[#6043aa]",
  }[owner]
}

export default function Home() {
  const sync = useGlobalSync()
  const layout = useLayout()
  const platform = usePlatform()
  const dialog = useDialog()
  const navigate = useNavigate()
  const server = useServer()
  const language = useLanguage()

  const [featureRequest, setFeatureRequest] = createSignal(defaultFeatureRequest)
  const [plan, setPlan] = createSignal<SprintPlan>()
  const [visibleActivity, setVisibleActivity] = createSignal<string[]>([])
  const [reportVisible, setReportVisible] = createSignal(false)
  const [running, setRunning] = createSignal(false)
  let timers: number[] = []

  const homedir = createMemo(() => sync.data.path.home)
  const recent = createMemo(() => {
    return sync.data.project
      .slice()
      .sort((a, b) => (b.time.updated ?? b.time.created) - (a.time.updated ?? a.time.created))
      .slice(0, 3)
  })

  const serverDotClass = createMemo(() => {
    const healthy = server.healthy()
    if (healthy === true) return "bg-icon-success-base"
    if (healthy === false) return "bg-icon-critical-base"
    return "bg-border-weak-base"
  })

  const progress = createMemo(() => {
    const tasks = plan()?.tasks ?? []
    const done = tasks.filter((task) => task.status === "Done").length
    const active = tasks.filter((task) => task.status === "In Progress").length
    const blocked = tasks.filter((task) => task.status === "Blocked").length
    return { total: tasks.length, done, active, blocked }
  })

  const activityComplete = createMemo(() => {
    const current = plan()
    if (!current) return false
    return visibleActivity().length >= current.activity.length
  })

  function openProject(directory: string) {
    layout.projects.open(directory)
    server.projects.touch(directory)
    navigate(`/${base64Encode(directory)}`)
  }

  async function chooseProject() {
    function resolve(result: string | string[] | null) {
      if (Array.isArray(result)) {
        for (const directory of result) openProject(directory)
        return
      }
      if (result) openProject(result)
    }

    if (platform.openDirectoryPickerDialog && server.isLocal()) {
      const result = await platform.openDirectoryPickerDialog?.({
        title: language.t("command.project.open"),
        multiple: true,
      })
      resolve(result)
      return
    }

    dialog.show(
      () => <DialogSelectDirectory multiple={true} onSelect={resolve} />,
      () => resolve(null),
    )
  }

  function clearTimers() {
    for (const timer of timers) window.clearTimeout(timer)
    timers = []
  }

  function schedule(delay: number, fn: () => void) {
    const timer = window.setTimeout(fn, delay)
    timers.push(timer)
  }

  async function runManager(options: { showReportWhenDone?: boolean } = {}) {
    clearTimers()
    setRunning(true)
    setVisibleActivity([])
    setReportVisible(false)

    const nextPlan = await mockEngineeringManager.planFeature(featureRequest().trim() || defaultFeatureRequest)
    setPlan(nextPlan)

    nextPlan.activity.forEach((activity, index) => {
      schedule(index * 560, () => {
        setVisibleActivity((current) => [...current, activity])
      })
    })

    schedule(nextPlan.activity.length * 560 + 220, () => {
      setRunning(false)
      if (options.showReportWhenDone) setReportVisible(true)
    })
  }

  function runDemo() {
    clearTimers()
    setPlan(undefined)
    setVisibleActivity([])
    setReportVisible(false)
    setFeatureRequest("")
    setRunning(true)

    ;[...defaultFeatureRequest].forEach((letter, index) => {
      schedule(index * 18, () => setFeatureRequest((current) => current + letter))
    })

    schedule(defaultFeatureRequest.length * 18 + 320, () => {
      void runManager({ showReportWhenDone: true })
    })
  }

  onCleanup(clearTimers)

  return (
    <div class="size-full overflow-y-auto bg-background-base">
      <div class="mx-auto flex w-full max-w-[1500px] flex-col gap-4 px-4 py-4 pb-12 md:px-6 md:py-5">
        <header class="grid gap-4 rounded-lg border border-border-weaker-base bg-background-stronger p-4 shadow-xs-border-base xl:grid-cols-[1.1fr_0.9fr]">
          <div class="flex min-w-0 flex-col gap-4">
            <div class="flex flex-wrap items-center gap-2">
              <span class="rounded-md bg-surface-raised-base px-2 py-1 text-12-medium text-text-base shadow-xs-border-base">
                Agents for Hire demo
              </span>
              <span class="rounded-md bg-[#ecfff9] px-2 py-1 text-12-medium text-[#08765f]">
                Sprint AI Engineering Manager
              </span>
            </div>
            <div class="flex flex-col gap-2">
              <h1 class="sprint-hero-title">
                Sprint coordinates humans and coding agents before duplicate work happens.
              </h1>
              <p class="sprint-hero-copy">
                Enter a feature request. Sprint plans the work, assigns owners, spots file overlap, makes manager
                decisions, and generates a polished engineering report.
              </p>
            </div>
          </div>

          <div class="flex min-w-0 flex-col gap-3 rounded-lg border border-border-weaker-base bg-background-base p-3">
            <div class="flex items-center justify-between gap-3">
              <div class="flex min-w-0 items-center gap-2">
                <div class="grid size-9 shrink-0 place-items-center rounded-lg bg-text-strong text-14-medium font-semibold text-background-base">
                  S
                </div>
                <div class="min-w-0">
                  <div class="truncate text-14-medium text-text-strong">Sprint Agent Control</div>
                  <button
                    type="button"
                    class="flex max-w-full items-center gap-2 text-left text-12-regular text-text-weak"
                    onClick={() => dialog.show(() => <DialogSelectServer />)}
                  >
                    <span class={`size-2 shrink-0 rounded-full ${serverDotClass()}`} />
                    <span class="truncate">{server.name}</span>
                  </button>
                </div>
              </div>
              <Button size="large" icon="folder-add-left" onClick={chooseProject}>
                Open project
              </Button>
            </div>

            <Show when={recent().length > 0}>
              <div class="flex flex-col gap-2 border-t border-border-weaker-base pt-3">
                <div class="text-12-medium text-text-base">Recent workspaces</div>
                <For each={recent()}>
                  {(project) => (
                    <button
                      type="button"
                      class="flex min-w-0 items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left hover:bg-surface-base-hover"
                      onClick={() => openProject(project.worktree)}
                    >
                      <span class="truncate text-12-mono text-text-strong">{project.worktree.replace(homedir(), "~")}</span>
                      <span class="shrink-0 text-12-regular text-text-weak">
                        {DateTime.fromMillis(project.time.updated ?? project.time.created).toRelative()}
                      </span>
                    </button>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </header>

        <section class="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <form
            class="flex min-w-0 flex-col gap-3 rounded-lg border border-border-weaker-base bg-background-stronger p-4 shadow-xs-border-base"
            onSubmit={(event) => {
              event.preventDefault()
              void runManager()
            }}
          >
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-16-medium text-text-strong">Feature request</h2>
                <p class="text-12-regular text-text-base">Sprint turns this into an owned engineering sprint.</p>
              </div>
              <Button type="button" size="large" icon="new-session" onClick={runDemo}>
                Run Demo
              </Button>
            </div>

            <textarea
              aria-label="Feature request"
              value={featureRequest()}
              onInput={(event) => setFeatureRequest(event.currentTarget.value)}
              class="min-h-28 w-full resize-none rounded-lg border border-border-weak-base bg-background-base px-3 py-3 text-14-regular text-text-strong outline-none transition-shadow focus:shadow-xs-border-focus"
            />

            <div class="flex flex-wrap gap-2">
              <Button type="submit" size="large" variant="primary" disabled={running()}>
                Generate plan
              </Button>
              <Button
                type="button"
                size="large"
                disabled={!plan()}
                onClick={() => {
                  if (plan()) setReportVisible(true)
                }}
              >
                Generate Engineering Manager Report
              </Button>
            </div>
          </form>

          <div class="grid gap-3 rounded-lg border border-border-weaker-base bg-background-stronger p-4 shadow-xs-border-base md:grid-cols-4">
            <Metric label="Tasks" value={progress().total || 6} />
            <Metric label="Done" value={progress().done} tone="success" />
            <Metric label="In progress" value={progress().active} tone="info" />
            <Metric label="Blocked" value={progress().blocked} tone="critical" />
          </div>
        </section>

        <section class="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <div class="flex min-w-0 flex-col gap-4">
            <Panel title="Implementation Plan" subtitle="Generated by Sprint's mock engineering manager provider">
              <Show
                when={plan()}
                keyed
                fallback={<EmptyState text="Run the demo or generate a plan to see Sprint break down the feature." />}
              >
                {(currentPlan) => (
                  <ol class="grid gap-2">
                    <For each={currentPlan.implementationPlan}>
                      {(step, index) => (
                        <li class="flex gap-3 rounded-lg border border-border-weaker-base bg-background-base p-3">
                          <span class="grid size-6 shrink-0 place-items-center rounded-md bg-surface-raised-base text-12-medium text-text-base shadow-xs-border-base">
                            {index() + 1}
                          </span>
                          <span class="text-14-regular leading-relaxed text-text-strong">{step}</span>
                        </li>
                      )}
                    </For>
                  </ol>
                )}
              </Show>
            </Panel>

            <Panel title="Engineering Tasks" subtitle="Owners, status, file scope, and assignment rationale">
              <Show when={plan()} keyed fallback={<EmptyState text="Task board is waiting for a feature request." />}>
                {(currentPlan) => (
                  <div class="grid gap-3 lg:grid-cols-2">
                    <For each={currentPlan.tasks}>
                      {(task) => (
                        <article class="rounded-lg border border-border-weaker-base bg-background-base p-3">
                          <div class="flex flex-wrap items-start justify-between gap-2">
                            <div class="min-w-0">
                              <h3 class="text-14-medium text-text-strong">{task.title}</h3>
                              <p class="mt-1 text-12-regular leading-relaxed text-text-base">{task.description}</p>
                            </div>
                            <span class={`rounded-md px-2 py-1 text-12-medium ${statusClass(task.status)}`}>
                              {task.status}
                            </span>
                          </div>
                          <div class="mt-3 flex flex-wrap gap-2">
                            <span class={`rounded-md px-2 py-1 text-12-medium ${ownerClass(task.owner)}`}>
                              {task.owner}
                            </span>
                            <span class="rounded-md bg-surface-raised-base px-2 py-1 text-12-medium text-text-base shadow-xs-border-base">
                              {task.files.length} files
                            </span>
                          </div>
                          <div class="mt-3 rounded-md bg-background-stronger p-2">
                            <div class="text-12-medium text-text-base">Why assigned</div>
                            <p class="mt-1 text-12-regular leading-relaxed text-text-base">{task.assignmentReason}</p>
                          </div>
                          <div class="mt-3 flex flex-wrap gap-1.5">
                            <For each={task.files}>
                              {(file) => <code class="rounded bg-surface-raised-base px-1.5 py-1 font-mono text-11-regular text-text-base">{file}</code>}
                            </For>
                          </div>
                        </article>
                      )}
                    </For>
                  </div>
                )}
              </Show>
            </Panel>
          </div>

          <div class="flex min-w-0 flex-col gap-4">
            <Panel title="Live Agent Activity" subtitle={running() ? "Sprint is acting..." : "Step-by-step autonomous activity"}>
              <div class="grid gap-2">
                <Show when={visibleActivity().length > 0} fallback={<EmptyState text="Run Demo to watch Sprint act live." />}>
                  <For each={visibleActivity()}>
                    {(activity, index) => (
                      <div class="flex items-center gap-3 rounded-lg border border-border-weaker-base bg-background-base p-2.5 sprint-activity-row">
                        <span class="grid size-6 shrink-0 place-items-center rounded-full bg-text-strong font-mono text-11-regular text-background-base">
                          {index() + 1}
                        </span>
                        <span class="text-13-medium text-text-strong">{activity}</span>
                      </div>
                    )}
                  </For>
                </Show>
                <Show when={running()}>
                  <div class="flex items-center gap-2 rounded-lg border border-border-weaker-base bg-background-base p-2.5 text-12-regular text-text-base">
                    <span class="sprint-live-dot" />
                    Thinking through next manager action
                  </div>
                </Show>
              </div>
            </Panel>

            <Panel title="Conflict Detection" subtitle="Most important demo moment: Sprint prevents duplicate work">
              <Show
                when={plan()?.conflicts[0]}
                keyed
                fallback={<EmptyState text="No conflict evaluated yet." />}
              >
                {(conflict) => (
                  <div
                    classList={{
                      "rounded-lg border p-4 transition": true,
                      "border-icon-critical-base bg-[#fff4f2] shadow-[0_0_0_1px_rgba(206,73,61,0.08),0_18px_45px_rgba(206,73,61,0.13)]":
                        visibleActivity().length >= 6,
                      "border-border-weaker-base bg-background-base": visibleActivity().length < 6,
                    }}
                  >
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="rounded-md bg-icon-critical-base px-2 py-1 text-12-medium text-white">Overlap</span>
                      <code class="rounded-md bg-background-base px-2 py-1 text-12-mono text-text-strong shadow-xs-border-base">
                        {conflict.file}
                      </code>
                    </div>
                    <p class="mt-3 text-14-medium leading-relaxed text-text-strong">{conflict.message}</p>
                    <div class="mt-3 grid gap-2">
                      <For each={conflict.tasks}>
                        {(task) => (
                          <div class="rounded-md bg-background-base p-2 shadow-xs-border-base">
                            <div class="flex items-center justify-between gap-2">
                              <span class="text-12-medium text-text-strong">{task.owner}</span>
                              <span class="text-12-regular text-text-base">{task.title}</span>
                            </div>
                          </div>
                        )}
                      </For>
                    </div>
                    <div class="mt-3 rounded-md bg-background-base p-3 shadow-xs-border-base">
                      <div class="text-12-medium text-text-strong">Recommended action</div>
                      <p class="mt-1 text-13-regular leading-relaxed text-text-base">{conflict.recommendedAction}</p>
                    </div>
                  </div>
                )}
              </Show>
            </Panel>

            <Panel title="Sprint Agent Decisions" subtitle="Decision, reason, confidence, and action taken">
              <Show when={plan()} keyed fallback={<EmptyState text="Decisions appear after Sprint plans the work." />}>
                {(currentPlan) => (
                  <div class="grid gap-2">
                    <For each={currentPlan.decisions}>
                      {(decision) => (
                        <article class="rounded-lg border border-border-weaker-base bg-background-base p-3">
                          <div class="flex items-start justify-between gap-3">
                            <div>
                              <h3 class="text-13-medium text-text-strong">{decision.decision}</h3>
                              <p class="mt-1 text-12-regular leading-relaxed text-text-base">{decision.reason}</p>
                            </div>
                            <span class="shrink-0 rounded-md bg-surface-raised-base px-2 py-1 text-12-medium text-text-strong shadow-xs-border-base">
                              {decision.confidence}%
                            </span>
                          </div>
                          <div class="mt-2 rounded-md bg-background-stronger px-2 py-1.5 text-12-regular text-text-base">
                            {decision.action}
                          </div>
                        </article>
                      )}
                    </For>
                  </div>
                )}
              </Show>
            </Panel>
          </div>
        </section>

        <Show when={reportVisible() ? plan() : undefined} keyed>
          {(currentPlan) => (
            <section class="rounded-lg border border-border-weaker-base bg-background-stronger p-4 shadow-xs-border-base">
              <div class="flex flex-wrap items-start justify-between gap-3 border-b border-border-weaker-base pb-3">
                <div>
                  <div class="text-12-medium uppercase text-text-base">Engineering Manager Report</div>
                  <h2 class="mt-1 text-2xl font-semibold text-text-strong">Google OAuth Sprint Summary</h2>
                </div>
                <span class="rounded-md bg-[#ecfff9] px-2 py-1 text-12-medium text-[#08765f]">Judge-ready</span>
              </div>

              <div class="grid gap-4 pt-4 lg:grid-cols-[1fr_1fr]">
                <ReportBlock title="One-line executive summary" items={[currentPlan.report.executiveSummary]} strong />
                <ReportBlock title="Feature summary" items={[currentPlan.report.featureSummary]} />
                <ReportBlock title="Assigned owners" items={currentPlan.report.assignedOwners} />
                <ReportBlock title="Current progress" items={[currentPlan.report.currentProgress]} />
                <ReportBlock title="Risks" items={currentPlan.report.risks} />
                <ReportBlock title="Blockers" items={currentPlan.report.blockers} />
                <div class="lg:col-span-2">
                  <ReportBlock title="Recommended next steps" items={currentPlan.report.recommendedNextSteps} />
                </div>
              </div>
            </section>
          )}
        </Show>

        <Show when={activityComplete()}>
          <div class="rounded-lg border border-border-weaker-base bg-background-stronger p-3 text-13-regular text-text-base shadow-xs-border-base">
            Sprint is not just a dashboard. Sprint actively coordinates humans and coding agents to prevent duplicate
            work and ship faster.
          </div>
        </Show>
      </div>
    </div>
  )
}

function Panel(props: { title: string; subtitle: string; children: any }) {
  return (
    <section class="rounded-lg border border-border-weaker-base bg-background-stronger p-4 shadow-xs-border-base">
      <div class="mb-3 flex flex-col gap-1">
        <h2 class="text-16-medium text-text-strong">{props.title}</h2>
        <p class="text-12-regular text-text-base">{props.subtitle}</p>
      </div>
      {props.children}
    </section>
  )
}

function Metric(props: { label: string; value: number; tone?: "success" | "info" | "critical" }) {
  const toneClass = () => {
    if (props.tone === "success") return "text-icon-success-base"
    if (props.tone === "info") return "text-icon-info-base"
    if (props.tone === "critical") return "text-icon-critical-base"
    return "text-text-strong"
  }
  return (
    <div class="rounded-lg border border-border-weaker-base bg-background-base p-3">
      <div class={`text-3xl font-semibold ${toneClass()}`}>{props.value}</div>
      <div class="mt-1 text-12-medium text-text-base">{props.label}</div>
    </div>
  )
}

function EmptyState(props: { text: string }) {
  return (
    <div class="rounded-lg border border-dashed border-border-weak-base bg-background-base p-4 text-13-regular text-text-weak">
      {props.text}
    </div>
  )
}

function ReportBlock(props: { title: string; items: string[]; strong?: boolean }) {
  return (
    <article class="rounded-lg border border-border-weaker-base bg-background-base p-3">
      <h3 class="text-13-medium text-text-strong">{props.title}</h3>
      <ul class="mt-2 grid gap-2">
        <For each={props.items}>
          {(item) => (
            <li
              classList={{
                "text-13-regular leading-relaxed text-text-base": true,
                "text-14-medium text-text-strong": props.strong,
              }}
            >
              {item}
            </li>
          )}
        </For>
      </ul>
    </article>
  )
}
