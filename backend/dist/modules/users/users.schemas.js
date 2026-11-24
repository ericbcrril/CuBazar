"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userIdSchema = exports.updateAvailabilitySchema = void 0;
const zod_1 = require("zod");
const objectId_1 = require("../../shared/utils/objectId");
exports.updateAvailabilitySchema = zod_1.z.object({
    body: zod_1.z.object({
        isAvailable: zod_1.z.boolean(),
    }),
});
exports.userIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: objectId_1.objectIdSchema,
    }),
});
//# sourceMappingURL=users.schemas.js.map