export function download(
    content: Blob | string,
    fileName: string,
    contentType: string,
    container?: HTMLElement,
) {
    const a = document.createElement("a");
    const file =
        content instanceof Blob
            ? content
            : new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.style.display = "none";

    // Append to the provided container (dropdown) or body as fallback
    const parent = container || document.body;
    parent.appendChild(a);

    a.addEventListener(
        "click",
        (e) => {
            e.stopPropagation();
            e.stopImmediatePropagation();
        },
        { once: true, capture: true },
    );

    // Click after the current event loop completes
    setTimeout(() => {
        a.click();
    }, 0);

    setTimeout(() => {
        parent.removeChild(a);
        URL.revokeObjectURL(a.href);
    }, 100);
}
