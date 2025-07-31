"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gym_controller_1 = require("../controllers/gym.controller");
const router = (0, express_1.Router)();
router.get('/', gym_controller_1.getGyms);
router.post('/', gym_controller_1.addGym);
exports.default = router;
