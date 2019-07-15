import Converter from "./Converter";
import TsonPropProperties from "./TsonPropProperties";

type TsonPropValue<T> = string | Converter<T> | TsonPropProperties<T>

export default TsonPropValue;
