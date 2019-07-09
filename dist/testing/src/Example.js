"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const tson_1 = require("tson");
let Example = class Example {
    constructor() {
        this.ignoredProperty = 'assign me in constructor';
        this.customConverter = true;
        this.stringProperty = 'default';
        this.numberProperty = 0;
        this.booleanProperty = true;
        this.dateProperty = new Date();
    }
};
__decorate([
    tson_1.TsonIgnore
], Example.prototype, "ignoredProperty", void 0);
__decorate([
    tson_1.TsonProp('override_name')
], Example.prototype, "overrideName", void 0);
__decorate([
    tson_1.TsonProp({ name: 'override_name', converter: (value) => value === 'yes' })
], Example.prototype, "customConverter", void 0);
Example = __decorate([
    tson_1.Tson
], Example);
exports.Example = Example;
//# sourceMappingURL=Example.js.map