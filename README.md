# Tson

Generate JSON deserialisation functions using the TypeScript compiler API.

#### Property decorators

* `Tson` - Class decorator, tells the transformer what classes to modify.
* `TsonIgnore(value: boolean = true)` - Do not generate assign a value to this property in the deserialisation function.
* `TsonProp(name: string)` - Override the default JSON property name.
* `TsonProp(converter: <T>(value: any) => T` - Use a custom converter function for this property.
* `TsonProp(props: { name: string, converter: <T>(value: any) => T)` Name override and custom converter combined.

#### Example

`yarn codegen testing/src/Example.ts`

```typescript

// Example.ts

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

// Example.g.ts

import { Tson, TsonIgnore, TsonProp } from 'tson';
import { Model } from "./Model.g";
/*
    *** DO NOT EDIT! ***
    Generated deserializable class from: Example.ts.
*/
export class Example {
    public ignoredProperty: string = 'assign me in constructor';
    public overrideName: string;
    public customConverter: boolean = true;
    public stringProperty: string = 'default';
    public numberProperty: number = 0;
    public booleanProperty: boolean = true;
    public dateProperty: Date = new Date();
    public deserializableProperty: Model;
    public static fromJson(_json: any): Example {
        var _deserialized: Example = new Example;
        _deserialized.overrideName = String(_json["override_name"]);
        if (_json["customConverter"] != null)
            _deserialized.customConverter = ((value: any) => value === 'yes')(_json['override_name']);
        if (_json["stringProperty"] != null)
            _deserialized.stringProperty = String(_json["stringProperty"]);
        if (_json["numberProperty"] != null)
            _deserialized.numberProperty = Number(_json["numberProperty"]);
        if (_json["booleanProperty"] != null)
            _deserialized.booleanProperty = Boolean(_json["booleanProperty"]);
        if (_json["dateProperty"] != null)
            _deserialized.dateProperty = new Date(_json["dateProperty"]);
        _deserialized.deserializableProperty = Model.fromJson(_json["deserializableProperty"]);
        return _deserialized;
    }
}

```

#### TODO

* Deserialize objects.
* Safe variable declaration.

