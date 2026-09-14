import express from "express";
import { db } from "../db/index.js";
import { classes, enrollments } from "../db/schema/app.js";
import { eq, and, count } from "drizzle-orm";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.post('/', requireAuth, requireRole(['student']), async (req, res) => {
    try {
        const { inviteCode } = req.body;
        const studentId = req.userId!; 

        if (!inviteCode || typeof inviteCode !== 'string') {
            return res.status(400).json({ error: "Invite code is required" });
        }

        const [targetClass] = await db
            .select()
            .from(classes)
            .where(eq(classes.inviteCode, inviteCode.trim()));

        if (!targetClass) {
            return res.status(404).json({ error: "Invalid invite code", message: "No class found with that invite code." });
        }

        const [existing] = await db
            .select()
            .from(enrollments)
            .where(and(eq(enrollments.studentId, studentId), eq(enrollments.classId, targetClass.id)));

        if (existing) {
            return res.status(409).json({ error: "Already enrolled", message: "You are already enrolled in this class." });
        }

        const [countResult] = await db
            .select({ count: count() })
            .from(enrollments)
            .where(eq(enrollments.classId, targetClass.id));

        if ((countResult?.count ?? 0) >= targetClass.capacity) {
            return res.status(409).json({ error: "Class full", message: "This class has reached its capacity." });
        }

        await db.insert(enrollments).values({ studentId, classId: targetClass.id });

        res.status(201).json({ data: { classId: targetClass.id, className: targetClass.name } });
    } catch (e) {
        console.error(`POST /enrollments error: ${e}`);
        res.status(500).json({ error: 'Failed to join class' });
    }
});

export default router;