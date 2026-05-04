export function folderIconOpen(): string {
    // Open folder — matches VS Code's folder-opened codicon shape
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M1.5 3A1.5 1.5 0 0 0 0 4.5v8A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 14.5 4H7.707L6.354 2.646A.5.5 0 0 0 6 2.5H1.5A1.5 1.5 0 0 0 0 4v.5z" fill="#C09553"/>
  <path d="M0 5.5v7A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 14.5 4H1.5A1.5 1.5 0 0 0 0 5.5z" fill="#E9B959"/>
</svg>`;
}

export function folderIconClosed(): string {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 14.5 4H7.707L6.354 2.646A.5.5 0 0 0 6 2H1.5z" fill="#C09553"/>
</svg>`;
}

// Node type → { icon SVG string, color }
export function getNodeIcon(
    type: string,
    isCluster = false,
    expanded = false,
): { svg: string; color: string } {
    if (isCluster) {
        return {
            svg: expanded ? folderIconOpen() : folderIconClosed(),
            color: "transparent", // color baked into SVG
        };
    }
    switch (type) {
        case "file":
            return { svg: fileIcon("#6FB3D2"), color: "#6FB3D2" };
        case "folder":
            return {
                svg: expanded ? folderIconOpen() : folderIconClosed(),
                color: "transparent",
            };
        case "class":
            return { svg: classIcon(), color: "transparent" };
        case "function":
        case "method":
            return { svg: fnIcon(), color: "transparent" };
        case "external_library":
            return { svg: libIcon(), color: "transparent" };
        default:
            return { svg: fileIcon("#A0A0A0"), color: "#A0A0A0" };
    }
}

export function fileIcon(color: string): string {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M9 1H3.5A1.5 1.5 0 0 0 2 2.5v11A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V6L9 1z" fill="${color}" fill-opacity="0.18" stroke="${color}" stroke-width="1"/>
  <path d="M9 1v4.5A.5.5 0 0 0 9.5 6H14" stroke="${color}" stroke-width="1"/>
</svg>`;
}

export function classIcon(): string {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="14" height="14" rx="2" fill="#CC6699" fill-opacity="0.2" stroke="#CC6699" stroke-width="1"/>
  <text x="8" y="11.5" font-family="monospace" font-size="9" font-weight="bold" fill="#CC6699" text-anchor="middle">C</text>
</svg>`;
}

export function fnIcon(): string {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="14" height="14" rx="2" fill="#75BFFF" fill-opacity="0.15" stroke="#75BFFF" stroke-width="1"/>
  <text x="8" y="11.5" font-family="monospace" font-size="9" font-weight="bold" fill="#75BFFF" text-anchor="middle">ƒ</text>
</svg>`;
}

export function libIcon(): string {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="8" cy="8" r="6.5" fill="#4EC9B0" fill-opacity="0.15" stroke="#4EC9B0" stroke-width="1"/>
  <circle cx="8" cy="8" r="2.5" fill="#4EC9B0" fill-opacity="0.5"/>
</svg>`;
}

// ── Chevron SVG ─────────────────────────────────────────────────────────
// Matches VS Code's tree-item-expanded / collapsed codicons exactly
export function chevronSvg(expanded: boolean): string {
    if (expanded) {
        // pointing down
        return `<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;
    } else {
        // pointing right
        return `<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;
    }
}
