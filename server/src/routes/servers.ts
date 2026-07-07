import { Router } from "express";
import { listServers, startServer } from "../controllers/serverController";

const router = Router();

router.get("/list", listServers);
router.post("/start/:name", startServer);

export default router;
