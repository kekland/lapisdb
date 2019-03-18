"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sirano_1 = require("sirano");
const moment = __importStar(require("moment"));
const chalk = __importStar(require("chalk"));
class SimpleObject extends sirano_1.Model {
    constructor(name) {
        super();
        this.name = name;
    }
}
const store = new sirano_1.Datastore('simpleObject', './directory', () => SimpleObject);
function runMeasured(count, func) {
    return __awaiter(this, void 0, void 0, function* () {
        let startTime = moment.now();
        yield func(count);
        let endTime = moment.now();
        return endTime - startTime;
    });
}
function clearStore() {
    return __awaiter(this, void 0, void 0, function* () {
        const objects = yield store.get().result();
        yield store.deleteBatched().items(objects).run();
    });
}
function addElements(count) {
    return __awaiter(this, void 0, void 0, function* () {
        const operation = store.pushBatched();
        for (let i = 0; i < count; i++) {
            operation.item(new SimpleObject(`${i}`));
        }
        yield operation.run();
    });
}
function pushUnbatched(count) {
    return __awaiter(this, void 0, void 0, function* () {
        yield clearStore();
        const time = yield runMeasured(count, (count) => __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < count; i++) {
                yield store.push().item(new SimpleObject(`${i}`)).run();
            }
        }));
        return {
            name: 'push-unbatched',
            count: count,
            timeMillis: time
        };
    });
}
function pushBatched(count) {
    return __awaiter(this, void 0, void 0, function* () {
        yield clearStore();
        const time = yield runMeasured(count, (count) => __awaiter(this, void 0, void 0, function* () {
            const operation = store.pushBatched();
            for (let i = 0; i < count; i++) {
                operation.item(new SimpleObject(`${i}`));
            }
            yield operation.run();
        }));
        return {
            name: 'push-batched',
            count: count,
            timeMillis: time
        };
    });
}
function get(count) {
    return __awaiter(this, void 0, void 0, function* () {
        yield clearStore();
        yield addElements(count);
        const time = yield runMeasured(count, (count) => __awaiter(this, void 0, void 0, function* () {
            const items = yield store.get().result();
        }));
        return {
            name: 'get',
            count: count,
            timeMillis: time
        };
    });
}
function getFiltered(count) {
    return __awaiter(this, void 0, void 0, function* () {
        yield clearStore();
        yield addElements(count);
        const time = yield runMeasured(count, (count) => __awaiter(this, void 0, void 0, function* () {
            const items = yield store.get().filter((item) => item.name > '3').result();
        }));
        return {
            name: 'get-filtered',
            count: count,
            timeMillis: time
        };
    });
}
function getSorted(count) {
    return __awaiter(this, void 0, void 0, function* () {
        yield clearStore();
        yield addElements(count);
        const time = yield runMeasured(count, (count) => __awaiter(this, void 0, void 0, function* () {
            const items = yield store.get().sort({ name: { sort: sirano_1.SortDirection.Ascending } }).result();
        }));
        return {
            name: 'get-sorted',
            count: count,
            timeMillis: time
        };
    });
}
function getFilteredAndSorted(count) {
    return __awaiter(this, void 0, void 0, function* () {
        yield clearStore();
        yield addElements(count);
        const time = yield runMeasured(count, (count) => __awaiter(this, void 0, void 0, function* () {
            const items = yield store.get().filter((item) => item.name > '3').sort({ name: { sort: sirano_1.SortDirection.Ascending } }).result();
        }));
        return {
            name: 'get-filtered-and-sorted',
            count: count,
            timeMillis: time
        };
    });
}
function edit(count) {
    return __awaiter(this, void 0, void 0, function* () {
        yield clearStore();
        yield addElements(count);
        const item = yield store.get().first();
        const time = yield runMeasured(count, (count) => __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < count; i++) {
                item.name = `${i}`;
                yield item.save();
            }
        }));
        return {
            name: 'edit',
            count: count,
            timeMillis: time
        };
    });
}
function deleteUnbatched(count) {
    return __awaiter(this, void 0, void 0, function* () {
        yield clearStore();
        yield addElements(count);
        const time = yield runMeasured(count, (count) => __awaiter(this, void 0, void 0, function* () {
            const elements = yield store.get().result();
            for (const element of elements) {
                yield element.delete();
            }
        }));
        return {
            name: 'delete-unbatched',
            count: count,
            timeMillis: time
        };
    });
}
function deleteBatched(count) {
    return __awaiter(this, void 0, void 0, function* () {
        yield clearStore();
        yield addElements(count);
        const time = yield runMeasured(count, (count) => __awaiter(this, void 0, void 0, function* () {
            const elements = yield store.get().result();
            yield store.deleteBatched().items(elements).run();
        }));
        return {
            name: 'delete-batched',
            count: count,
            timeMillis: time
        };
    });
}
const methods = [
    pushUnbatched, pushBatched,
    get, getFiltered, getSorted, getFilteredAndSorted,
    edit,
    deleteUnbatched, deleteBatched
];
const count = 100000;
function benchmark() {
    return __awaiter(this, void 0, void 0, function* () {
        yield clearStore();
        for (const method of methods) {
            const result = yield method(count);
            console.log(`${chalk.default.green(result.name)}:`);
            console.log(`\t${chalk.default.blue(`${result.timeMillis}`)}ms ${chalk.default.gray('for')} ${chalk.default.blue(`${result.count}`)}ops`);
            console.log(`\t${chalk.default.green(`${(result.count / result.timeMillis) * 1000}`)}op/s`);
            console.log(`\n`);
        }
    });
}
benchmark();
