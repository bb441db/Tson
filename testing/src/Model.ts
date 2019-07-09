// @ts-ignore
import {Tson, TsonIgnore, TsonProp} from 'tson';

@Tson
export class Model {
    @TsonIgnore
    public ignored: any = '';
    public stringProperty: string = '';
    public booleanProperty: boolean = true;
    public numberProperty: number = 1;
    public implicitAnyProperty;
    public dateProperty?: Date;
    public static staticProp: string = '';
    public readonly readOnlyProp: string = '';
    public override: string = '';

    @TsonProp('decorated_prop_1')
    public decoratedProp1?: string;
    @TsonProp((value: any) => 'decoratedProp2 converter.')
    public decoratedProp2?: string;
    @TsonProp({ name: 'decorated_prop_3', converter: (value: any) => 'decoratedProp3 converter.'})
    public decoratedProp3: string;
    @TsonProp({ name: 'decorated_prop_4' })
    public decoratedProp4: string;
    @TsonProp({ converter: ((value: any) => 'decoratedProp5 converter.') })
    public decoratedProp5: string;
}
