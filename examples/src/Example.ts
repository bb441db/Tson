import {Tson, TsonIgnore, TsonProp} from 'tson-runtime';
import Model from "./Model.g";

const converterFn = (value: any): boolean => value === '1';

interface ExampleInterface {
    test: string;
}

@Tson
export class Example {
    public readonly readonlyString: string;
    constructor(readonlyString: string) {
        this.readonlyString = readonlyString;
    }
    @TsonIgnore
    public ignoredProperty: string = 'ignored property';
    @TsonProp('override_name')
    public overridePropertyName: string;
    @TsonProp(converterFn)
    public customConverter: boolean;
    public dateProperty: Date = new Date();
    public arrayTest: string[] = [];
    public modelTest?: Model;
    public interfaceProp?: ExampleInterface;
}
