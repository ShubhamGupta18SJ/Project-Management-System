import express, { Application } from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes";
import chatAppauth from "./routes/chatAppauth.routes";
import { setupSwagger } from "./swagger";
import { errorHandler } from ".//middleware/errorHandler";

const app: Application = express();

app.use(cors());
app.use(express.json());

// Swagger setup
setupSwagger(app);

// Routes
app.use("/api", chatAppauth);
app.use("/api/users", userRoutes);

// Root test
app.get("/", (req, res) => {
  res.send("✅ Chat API is running...");
  
});

// Error middleware (must be last)
app.use(errorHandler);

export default app;
