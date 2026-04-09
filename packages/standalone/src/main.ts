import { mount } from 'svelte'
import "@dep-graph-vis/ui/app.scss";
import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
