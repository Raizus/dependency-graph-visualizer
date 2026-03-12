type MenuItemBase = {
    id: string;
    label: string;
    icon?: string;
    disabled?: boolean;
    tooltip?: string;
    shortcut?: string;
};

export type MenuAction<T> = MenuItemBase & {
    type?: "action";
    action: (context: T) => void;
};

type MenuSeparator = {
    type: "separator";
    id: string;
};

export type MenuGroup<T> = MenuItemBase & {
    type: "group";
    children: MenuItem<T>[];
};

export type MenuItem<T> = MenuAction<T> | MenuSeparator | MenuGroup<T>;

export function separator(id: string): MenuSeparator {
    return {
        id,
        type: "separator",
    };
}
