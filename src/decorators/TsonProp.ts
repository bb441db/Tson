type Converter<T> = (value: any) => (keyof T);

interface TsonPropProperties<T> {
    name?: string
    converter?: Converter<T>
}
type TsonPropValue<T> = string | Converter<T> | TsonPropProperties<T>

const TsonProp = <T>(value: TsonPropValue<T>) => {
    return <T>(target: T, key: keyof T) => { }
};

export default TsonProp;
