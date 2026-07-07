import express from "express";
import cors from "cors";
import serverRoutes from "./routes/servers";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/servers", serverRoutes);

app.listen(3000, () => {
  console.log("Backend running on port 3000");
});
