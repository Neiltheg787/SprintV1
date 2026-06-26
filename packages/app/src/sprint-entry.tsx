// @refresh reload

import "@/index.css"
import { render } from "solid-js/web"
import { SprintStandalone } from "@/pages/sprint-standalone"

const root = document.getElementById("root")

if (root instanceof HTMLElement) {
  render(() => <SprintStandalone />, root)
}
