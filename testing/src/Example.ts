// @ts-ignore
import {Tson, TsonIgnore, TsonProp} from 'tson';
import {Model} from "./Model.g";

const converterFn = (value: any): boolean => value === '1';
const overrideName = 'override_name';

@Tson
export class Example {
    public readonly readonlyString: string;
    public readonly readonlyBool: boolean;

    constructor(readonlyString: string, @TsonProp(converterFn) readonlyBool: boolean) {
        this.readonlyString = readonlyString;
        this.readonlyBool = readonlyBool;
    }

    @TsonIgnore
    public ignoredProperty: string = 'ignored property';

    @TsonProp('override_name')
    public overrideNameUsingLiteral: string;
    @TsonProp(overrideName)
    public overrideNameUsingIdentifier: string;

    @TsonProp({ name: overrideName, converter: converterFn })
    public overrideNameAndCustomConverter: boolean = true;
    @TsonProp((value: any) => value === '1')
    public customBooleanConverter: boolean = true;

    public dateProperty: Date = new Date();
    public deserializableProperty: Model;
}
