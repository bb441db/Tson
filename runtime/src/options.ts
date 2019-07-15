import TsonOptions from "./types/TsonOptions";

export let tsonOptions: Partial<TsonOptions> = {};

export default function setOptions(options: Partial<TsonOptions>) {
    tsonOptions = options;
}
