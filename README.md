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
yarn codegen ../examples/src/Example.ts
```

**[Example.ts](examples/src/Example.ts)**

```typescript
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
```

**[Example.g.ts](examples/src/Example.g.ts)**

```typescript
import { Tson, TsonIgnore, TsonProp, convertToString, deserializeThrowing, convertToBoolean, deserialize, assignOrThrow, assignIfNotNull, convertToDate, createArrayConverter } from 'tson-runtime';
import Model from "./Model.g";
const converterFn = (value: any): boolean => value === '1';
const overrideName = 'override_name';
/*
    *** DO NOT EDIT! ***
    Generated deserializable class from: Example.ts.
*/
import { Tson, TsonIgnore, TsonProp, convertToString, deserializeThrowing, assignOrThrow, convertToDate, assignIfNotNull, createArrayConverter } from 'tson-runtime';
import Model from "./Model.g";
const converterFn = (value: any): boolean => value === '1';
interface ExampleInterface {
    test: string;
}
/*
    *** DO NOT EDIT! ***
    Generated deserializable class from: Example.ts.
*/
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
    public static fromJson(data_1: any): Example {
        const readonlyString_1: string = deserializeThrowing(data_1, "readonlyString", convertToString);
        const instance_1: Example = new Example(readonlyString_1);
        assignOrThrow(instance_1, "overridePropertyName", data_1, 'override_name', convertToString);
        assignOrThrow(instance_1, "customConverter", data_1, "customConverter", converterFn);
        assignIfNotNull(instance_1, "dateProperty", data_1, "dateProperty", convertToDate);
        assignIfNotNull(instance_1, "arrayTest", data_1, "arrayTest", createArrayConverter(convertToString));
        assignIfNotNull(instance_1, "modelTest", data_1, "modelTest", Model.fromJson);
        assignIfNotNull(instance_1, "interfaceProp", data_1, "interfaceProp", (data_2: any): ExampleInterface => {
            const instance_2 = { test: deserializeThrowing(data_2, "test", convertToString) };
            return instance_2;
        });
        return instance_1;
    }
}
```

#### TODO

* Throw helpful errors for unknown types:
    * Generics
    * Union types
    * Intersection types

