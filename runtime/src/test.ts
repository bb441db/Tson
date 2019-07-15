import {
    assignIfNotNull,
    assignOrThrow,
    convertToBoolean,
    convertToString,
    deserialize,
    deserializeThrowing
} from "./index";


class TestModel {
    public readonly assignInConstructor: string;
    public readonly assignInConstructorTwo: string;
    public constructor(arg0: string, arg1: string = 'default') {
        this.assignInConstructor = arg0;
        this.assignInConstructorTwo = arg1;
    }

    public prop: boolean = true;
    public optionalProp?: boolean;

    public static fromJson(value: any): TestModel {
        const arg1 = deserialize(value, 'arg1', convertToString);
        const arg0 = deserializeThrowing(value, 'arg0', convertToString);
        const model = new TestModel(arg0, arg1);
        assignIfNotNull(model, 'optionalProp', value, 'optionalProp', convertToBoolean);
        assignOrThrow(model, 'prop', value, 'prop', convertToBoolean);
        return model;
    }
}

function test() {
    const model = TestModel.fromJson({
        prop: 1,
        arg0: 'test',
    });
    console.log(model);
}

test();
