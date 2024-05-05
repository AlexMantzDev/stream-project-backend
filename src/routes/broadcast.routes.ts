// IMPORTS
import express from "express";
import { connectStream } from "../controllers/broadcast.controllers.js";

export const router = express.Router();

// ROUTES
router.post("/", connectStream);
