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

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
    cors({
        origin:
            process.env.FRONTEND_URL ||
            "http://localhost:3000",
        credentials: true,
    })
);

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true,
    })
);

app.use(cookieParser());

app.get(
    "/health",
    (req: Request, res: Response) => {
        return res.status(200).json({
            success: true,
            message: "KrishiOra backend is healthy 🚜",
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

app.use(
    (req: Request, res: Response) => {
        return res.status(404).json({
            success: false,
            message: `Route ${req.method} ${req.originalUrl} not found`,
        });
    }
);

app.use(
    (
        err: Error,
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        console.error("Global Error:", err);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
);

app.listen(PORT, () => {
    console.log(
        `KrishiOra backend running on port ${PORT}`
    );
});