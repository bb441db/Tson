// @ts-ignore
import {Tson, TsonIgnore, TsonProp} from 'tson';
import {Model} from "./Model.g";

@Tson
export class Example {
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
