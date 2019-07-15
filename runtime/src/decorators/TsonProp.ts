import TsonPropValue from "../types/TsonPropValue";

// Usage: @TsonProp<type>(value)
// See https://github.com/Microsoft/TypeScript/issues/2607
const TsonProp = <Type>(value: TsonPropValue<Type>) => {
    return <T, K>(target: T, propertyKey: K): void => {}
};

export default TsonProp;
