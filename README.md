# Tson

Generate JSON deserialisation functions using the TypeScript compiler API.

### Types

**TsonConverter\<T\>**
```typescript
type Converter<T> = (value: any) => T;
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
    @TsonProp<string>({ name: 'override_prop', converter: (value: any): string => 'do converter things here.'})
    public overrides: string = 'ignored';     
}
```

___

#### Example

```bash
yarn codegen testing/src/Example.ts
```

**[Example.ts](examples/src/Example.ts)**

```typescript
import {Tson, TsonIgnore, TsonProp} from 'tson-runtime';

const converterFn = (value: any): boolean => value === '1';
const overrideName = 'override_name';

@Tson
export class Example {
    public readonly readonlyString: string;
    public readonly readonlyBool: boolean;

    constructor(readonlyString: string, readonlyBool: boolean = false) {
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
    @TsonProp((value: any) => value === true)
    public customBooleanConverter: boolean = true;

    public dateProperty: Date = new Date();
}
```

**[Example.g.ts](examples/src/Example.g.ts)**

```typescript
import { Tson, TsonIgnore, TsonProp, convertToString, deserializeThrowing, convertToBoolean, deserialize, assignOrThrow, assignIfNotNull, convertToDate } from 'tson-runtime';
const converterFn = (value: any): boolean => value === '1';
const overrideName = 'override_name';
/*
    *** DO NOT EDIT! ***
    Generated deserializable class from: Example.ts.
*/
@Tson
export class Example {
    public readonly readonlyString: string;
    public readonly readonlyBool: boolean;
    constructor(readonlyString: string, readonlyBool: boolean = false) {
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
    @TsonProp((value: any) => value === true)
    public customBooleanConverter: boolean = true;
    public dateProperty: Date = new Date();
    public static fromJson(data_1: any): Example {
        const readonlyString_1: string = deserializeThrowing(data_1, "readonlyString", convertToString);
        const readonlyBool_1: boolean | undefined = deserialize(data_1, "readonlyBool", convertToBoolean);
        const instance_1: Example = new Example(readonlyString_1, readonlyBool_1);
        assignOrThrow(instance_1, "overrideNameUsingLiteral", data_1, 'override_name', convertToString);
        assignOrThrow(instance_1, "overrideNameUsingIdentifier", data_1, overrideName, convertToString);
        assignIfNotNull(instance_1, "overrideNameAndCustomConverter", data_1, overrideName, converterFn);
        assignIfNotNull(instance_1, "customBooleanConverter", data_1, "customBooleanConverter", (value: any) => value === true);
        assignIfNotNull(instance_1, "dateProperty", data_1, "dateProperty", convertToDate);
        return instance_1;
    }
}
```

#### TODO

* `object`
* interface
* Array

