import express from "express";
import cors from "cors";
import api from "./routes/index";
import {config} from "./core/config";

const app = express();
app.use(cors());
app.use(express.json());
app.use(api);      

app.listen(config.port, () => console.log(`API on http://localhost:${config.port}`));
