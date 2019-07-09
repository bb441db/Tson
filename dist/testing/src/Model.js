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
let Model = class Model {
    constructor() {
        this.ignored = '';
        this.stringProperty = '';
        this.booleanProperty = true;
        this.numberProperty = 1;
        this.readOnlyProp = '';
        this.override = '';
    }
};
Model.staticProp = '';
__decorate([
    tson_1.TsonIgnore
], Model.prototype, "ignored", void 0);
__decorate([
    tson_1.TsonProp('decorated_prop_1')
], Model.prototype, "decoratedProp1", void 0);
__decorate([
    tson_1.TsonProp((value) => 'decoratedProp2 converter.')
], Model.prototype, "decoratedProp2", void 0);
__decorate([
    tson_1.TsonProp({ name: 'decorated_prop_3', converter: (value) => 'decoratedProp3 converter.' })
], Model.prototype, "decoratedProp3", void 0);
__decorate([
    tson_1.TsonProp({ name: 'decorated_prop_4' })
], Model.prototype, "decoratedProp4", void 0);
__decorate([
    tson_1.TsonProp({ converter: ((value) => 'decoratedProp5 converter.') })
], Model.prototype, "decoratedProp5", void 0);
Model = __decorate([
    tson_1.Tson
], Model);
exports.Model = Model;
//# sourceMappingURL=Model.js.map