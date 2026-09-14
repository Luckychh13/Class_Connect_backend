import type { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session?.user) {
            return res.status(401).json({ error: "Unauthorized", message: "You must be logged in." });
        }

        req.user = { role: session.user.role as "admin" | "teacher" | "student" };
        (req as any).userId = session.user.id;
        next();
    } catch (e) {
        console.error("Auth middleware error:", e);
        res.status(401).json({ error: "Unauthorized", message: "Invalid or expired session." });
    }
};

export const requireRole = (roles: Array<"admin" | "teacher" | "student">) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user?.role || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden", message: "You do not have permission to perform this action." });
        }
        next();
    };
};

export const identifyUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (session?.user) {
            req.user = { role: session.user.role as "admin" | "teacher" | "student" };
        }
    } catch (e) {
        // No valid session — leave req.user undefined, treated as guest downstream.
    }
    next();
};