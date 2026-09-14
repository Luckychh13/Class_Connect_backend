import express from "express";
import { db } from "../db/index.js";
import { departments } from "../db/schema/app.js";
import { sql } from "drizzle-orm";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const currentPage = Math.max(1, parseInt(String(page), 10) || 1);
        const limitPerPage = Math.min(Math.max(1, parseInt(String(limit), 10) || 10), 100);
        const offset = (currentPage - 1) * limitPerPage;

        const countResult = await db.select({ count: sql<number>`count(*)` }).from(departments);
        const totalCount = countResult[0]?.count ?? 0;

        const departmentsList = await db
            .select()
            .from(departments)
            .limit(limitPerPage)
            .offset(offset);

        res.status(200).json({
            data: departmentsList,
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPerPage),
            }
        });
    } catch (e) {
        console.error(`GET /departments error: ${e}`);
        res.status(500).json({ error: 'Failed to get departments' });
    }
});

export default router;