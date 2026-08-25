import { Router } from "express";
import {
    googleLogin,
    googleCallback,
    emailSignup,
    verifyEmailOtp,
    emailLogin,
    resendEmailOtp,
    logout,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    resendResetOtp,
    changePassword,
} from "../controllers/auth.controller";
import { authRateLimiter } from "../middleware/rateLimit.middleware";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/google", googleLogin);
router.post("/signup", authRateLimiter, emailSignup);
router.post("/verify-email", authRateLimiter, verifyEmailOtp);
router.post("/login", authRateLimiter, emailLogin);
router.post("/resend-otp", authRateLimiter, resendEmailOtp);
router.get("/google/callback", googleCallback);
router.post("/logout", logout);
router.post("/forgot-password", authRateLimiter, forgotPassword);
router.post("/verify-reset-otp", authRateLimiter, verifyResetOtp);
router.post("/reset-password", authRateLimiter, resetPassword);
router.post("/resend-reset-otp", authRateLimiter, resendResetOtp);
router.post("/change-password", authMiddleware, changePassword);



export default router;