import { ClusterManager } from "./Clusters";
import { ViewI } from "./schema";

export function newView(label: string = "View"): ViewI {
    const view: ViewI = {
        label,
        filters: [],
        clusters: new ClusterManager(),
        layout: { type: "auto" },
    };
    return view;
}

