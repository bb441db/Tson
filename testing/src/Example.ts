// @ts-ignore
import {Tson, TsonIgnore, TsonProp} from 'tson';
import {Model} from "./Model.g";

@Tson
export class Example {

    public readonly readonlyProp: string;
    public readonly readonlyBool: boolean;
    public readonly readonlyDate: Date;
    public readonly readonlyModel: Model;

    constructor(readonlyProp: string, readonlyBool: boolean, readonlyModel?: Model, readonlyDate: Date = new Date()) {
        this.readonlyProp = readonlyProp;
        this.readonlyBool = readonlyBool;
        this.readonlyDate = readonlyDate;
        this.readonlyModel = readonlyModel;
    }


    @TsonIgnore
    public ignoredProperty: string = 'assign me in constructor';
    @TsonProp('override_name')
    public overrideName: string;
    @TsonProp({ name: 'override_name', converter: (value: any) => value === 'yes' })
    public customConverter: boolean = true;

    public stringProperty: string = 'default';
    public numberProperty: number = 0;
    public booleanProperty: boolean = true;
    public dateProperty: Date = new Date();
    public deserializableProperty: Model;
}
