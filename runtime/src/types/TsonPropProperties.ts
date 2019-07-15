import Converter from "./Converter";

interface TsonPropProperties<T> {
    name?: string
    converter?: Converter<T>
}

export default TsonPropProperties;
