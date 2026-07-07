import { Router } from "express";
import {
  listServers,
  startServer,
  sendServerCommand,
  getServerStatus,
  stopServerRoute,
  restartServerRoute,
  streamLogs
} from "../controllers/serverController";

const router = Router();

router.get("/list", listServers);
router.get("/status/:name", getServerStatus);
router.get("/logs/:name", streamLogs);

router.post("/start/:name", startServer);
router.post("/command/:name", sendServerCommand);
router.post("/stop/:name", stopServerRoute);
router.post("/restart/:name", restartServerRoute);

export default router;
