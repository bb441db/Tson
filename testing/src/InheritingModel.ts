// @ts-ignore
import {Tson, TsonIgnore, TsonProp} from 'tson';
import {Model} from "./Model.g";

@Tson
export class InheritingModel extends Model {
    public test: string = '';
    public override: string = '';
}
