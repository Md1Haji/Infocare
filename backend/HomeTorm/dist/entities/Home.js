"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Home = void 0;
const typeorm_1 = require("typeorm");
const HomeUser_1 = require("./HomeUser");
let Home = class Home {
};
exports.Home = Home;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Home.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'street_address' }),
    __metadata("design:type", String)
], Home.prototype, "streetAddress", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Home.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Home.prototype, "zip", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal' }),
    __metadata("design:type", Number)
], Home.prototype, "sqft", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Home.prototype, "beds", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Home.prototype, "baths", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'list_price', type: 'decimal' }),
    __metadata("design:type", Number)
], Home.prototype, "listPrice", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => HomeUser_1.HomeUser, (homeUser) => homeUser.home),
    __metadata("design:type", Array)
], Home.prototype, "homeUsers", void 0);
exports.Home = Home = __decorate([
    (0, typeorm_1.Entity)('home')
], Home);
