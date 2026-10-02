import { render } from "preact";
import { html } from "htm/preact";
import { App } from "./app.js";

// htm gives JSX-like syntax through tagged template literals — no build step
// and no pragma config, so these stay plain .js files.
render(html`<${App} />`, document.getElementById("app"));
