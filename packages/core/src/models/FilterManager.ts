import { FilterI } from "./schema";

export class FilterManager {
    private filters: FilterI[] = [];

    pushFilter(filter: FilterI) {
        this.filters.push(filter);
    }

    unshiftFilter(filter: FilterI) {
        this.filters.unshift(filter);
    }

    addFilter(filter: FilterI, at_front: boolean = false) {
        at_front ? this.unshiftFilter(filter) : this.pushFilter(filter);
    }

    getFilter(idx: number): FilterI | undefined {
        if (idx < 0 || idx >= this.filters.length) {
            return undefined;
        }
        return this.filters[idx];
    }

    getFilters(): FilterI[] {
        return this.filters;
    }

    setFilters(filters: FilterI[]) {
        this.filters = filters;
    }

    moveFilterDown(idx: number) {
        if (idx < 0 || idx >= this.filters.length - 1) {
            return;
        }
        const filters = this.filters;
        [filters[idx], filters[idx + 1]] = [filters[idx + 1], filters[idx]];
    }

    moveFilterUp(idx: number) {
        if (idx <= 0 || idx >= this.filters.length) {
            return;
        }
        const filters = this.filters;
        [filters[idx], filters[idx - 1]] = [filters[idx - 1], filters[idx]];
    }

    deleteFilter(idx: number) {
        if (idx < 0 || idx >= this.filters.length) {
            return;
        }
        const filters = this.filters;
        filters.splice(idx, 1);
    }

    copy(): FilterManager {
        const fm_copy = new FilterManager();
        for (const filter of fm_copy.getFilters()) {
            const filter_cp: FilterI = {
                ...filter
            } 
            fm_copy.pushFilter(filter_cp)
        }
        return fm_copy;
    }
}
