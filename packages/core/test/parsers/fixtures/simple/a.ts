import { funcB, ClassB } from "./b";

export function funcA() {
    funcB();
    const obj = new ClassB();
}

export const arrowA = () => {
    funcB();
};
