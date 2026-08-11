import express from "express";
import serverRouter from "./api/servers";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { ipWhitelist } from "./whitelist";

const app = express();

// Enable trusted proxy mode BEFORE using ipWhitelist
// This ensures req.ip is the validated client IP
app.set("trust proxy", true);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "../dist");

app.use(ipWhitelist);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

app.use("/api/servers", serverRouter);

app.use(express.static(distPath));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Listening on port 3000");
});
