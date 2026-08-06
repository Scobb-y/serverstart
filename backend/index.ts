import express from "express";
import serverRouter from "./api/servers";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json())
app.use("/api/servers", serverRouter);

app.listen(3000, () => {
  console.log("Listening on port 3000");
});