
export const uniqueId = (() => {
    let idCounter = 0;
    return (prefix: string = ""): string => {
        const id = ++idCounter;
        return prefix ? `${prefix}${id}` : `${id}`;
    };
})();
