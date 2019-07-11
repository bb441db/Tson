# Tson

Generate JSON deserialisation functions using the TypeScript compiler API.

### Types

**TsonConverter\<T\>**
```typescript
type Converter<T> = (value: any) => (keyof T);
```

**TsonConverter\<T\>**
```typescript
interface TsonPropProperties<T> {
    name?: string
    converter?: Converter<T>
}
```

**TsonPropValue\<T\>**
```typescript
type TsonPropValue<T> = string | Converter<T> | TsonPropProperties<T>
```

___

### Class decorator
**Tson**

*A deserialize function will only be generated for classes with a `Tson` decorator*
```typescript
@Tson
class Model {
    
}
```

___

### Property decorators

**TsonIgnore**

*Properties with `TsonIgnore` decorator will not be assigned in deserialize function*
```typescript
class Model {
    @TsonIgnore
    public ignoredProperty: string = 'ignored';     
}
```

**TsonProp**

*Override the default property key and/or converter function*
```typescript
class Model {
    @TsonProp({ name: 'override_prop', converter: (value: any): string => 'do converter things here.'})
    public overrides: string = 'ignored';     
}
```

___

#### Example

```bash
yarn codegen testing/src/Example.ts
```

**[Example.ts](testing/src/Example.ts)**

```typescript
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
```

**[Example.g.ts](testing/src/Example.g.ts)**

```typescript
import { Model } from "./Model.g";
const converterFn = (value: any): boolean => value === '1';
const overrideName = 'override_name';
/*
    *** DO NOT EDIT! ***
    Generated deserializable class from: Example.ts.
*/
export class Example {
    public readonly readonlyString: string;
    public readonly readonlyBool: boolean;
    constructor(readonlyString: string, readonlyBool: boolean) {
        this.readonlyString = readonlyString;
        this.readonlyBool = readonlyBool;
    }
    public ignoredProperty: string = 'ignored property';
    public overrideNameUsingLiteral: string;
    public overrideNameUsingIdentifier: string;
    public overrideNameAndCustomConverter: boolean = true;
    public customBooleanConverter: boolean = true;
    public dateProperty: Date = new Date();
    public deserializableProperty: Model;
    public static fromJson(data_1: any): Example {
        const readonlyString_1: string = String(data_1["readonlyString"]);
        const readonlyBool_1: boolean = converterFn(data_1["readonlyBool"]);
        const instance_1: Example = new Example(readonlyString_1, readonlyBool_1);
        instance_1.overrideNameUsingLiteral = String(data_1['override_name']);
        instance_1.overrideNameUsingIdentifier = String(data_1[overrideName]);
        if (data_1["overrideNameAndCustomConverter"] != null)
            instance_1.overrideNameAndCustomConverter = converterFn(data_1[overrideName]);
        if (data_1["customBooleanConverter"] != null)
            instance_1.customBooleanConverter = ((value: any) => value === '1')(data_1["customBooleanConverter"]);
        if (data_1["dateProperty"] != null)
            instance_1.dateProperty = new Date(data_1["dateProperty"]);
        instance_1.deserializableProperty = Model.fromJson(data_1["deserializableProperty"]);
        return instance_1;
    }
}

```

#### TODO

* `object`
* interface
* Array

