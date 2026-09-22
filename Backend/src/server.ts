import dotenv from "dotenv";
dotenv.config();

import profileRoutes from "./routes/profile.routes";
import express, {
    Request,
    Response,
    NextFunction,
} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import farmRoutes from "./routes/farm.routes";
import cropRoutes from "./routes/crop.routes";
import expenseRoutes from "./routes/expense.routes";
import cropKnowledgeRoutes from "./routes/cropKnowledge.routes";
import lifecycleRoutes from "./routes/lifecycle.routes";
import weatherRoutes from "./routes/weather.routes";
import { ruleRoutes, replanningRoutes } from "./routes/ruleEngine.routes";
import fieldActivityRoutes from "./routes/fieldActivity.routes";
import notificationRoutes from "./routes/notification.routes";

import { errorHandler } from "./middleware/error.middleware";

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
].filter(Boolean) as string[];

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps, curl, Postman)
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(null, true); // Permissive in dev, or specify allowed list
        },
        credentials: true,
    })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.get(
    "/health",
    (req: Request, res: Response) => {
        return res.status(200).json({
            success: true,
            message: "KrishiOra backend is healthy",
            timestamp: new Date().toISOString(),
        });
    }
);

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/farms", farmRoutes);
app.use("/api/farms", cropRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/farms", expenseRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/crop-knowledge", cropKnowledgeRoutes);
app.use("/api/lifecycles", lifecycleRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/rules", ruleRoutes);
app.use("/api/replanning", replanningRoutes);
app.use("/api/field-activities", fieldActivityRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(
    (req: Request, res: Response) => {
        return res.status(404).json({
            success: false,
            code: "NOT_FOUND",
            message: `Route ${req.method} ${req.originalUrl} not found`,
        });
    }
);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(
        `KrishiOra backend running on port ${PORT}`
    );
});