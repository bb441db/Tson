// @ts-ignore
import {Tson} from 'tson';
import {Model} from "./Model.g";

@Tson
export class DependencyModel {
    public otherModelProperty: Model;
}
