import { mount } from "svelte";
import App from "./App.svelte";
import "@dep-graph-vis/ui/app.scss";

// Data is injected by the extension into the window object
const graphData = (window as any).__GRAPH_DATA__ ?? null;

mount(App, {
    target: document.getElementById("app")!,
    props: { graphData },
});
