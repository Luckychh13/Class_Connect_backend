import { and, count, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm"
import express from "express"
import { departments, subjects } from "../db/schema"
import { db } from "../db"

const router = express.Router()

router.get("/", async (req,res) => {
    try {
        const {search,department,page=1,limit=10} = req.query

        const currentPage = Math.max(1,parseInt(String(page),10) || 1)
        const limitPage = Math.min(1,parseInt(String(limit),10) || 100)

        const offset = (currentPage-1) * limitPage

        const filterConditions = []

        if(search){
            filterConditions.push(
                or(
                    ilike(subjects.name, `%${search}%`),
                    ilike(subjects.code, `%${search}%`)
                )
            )
        }

        if(department){
            const deptPattern = `%${String(department).replace(/[%_]/g, '\\%&')}%`
            filterConditions.push(
                ilike(departments.name, deptPattern)
            )
        }

        const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined

        const countResult = await db
           .select({count:sql<number>`count(*)`})
           .from(subjects)
           .leftJoin(departments, eq(subjects.departmentId, departments.id))
           .where(whereClause)

        const totalCount = countResult[0]?.count ?? 0

        const subjectList = await db
           .select({
             ...getTableColumns(subjects),
             department: {...getTableColumns(departments)}
            })
            .from(subjects).leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause)
            .orderBy(desc(subjects.createdAt))
            .limit(limitPage)
            .offset(offset)
        res.status(200).json({
            data:subjectList,
            pagination:{
                page:currentPage,
                limit:limitPage,
                total:totalCount,
                totalPage:Math.ceil(totalCount / limitPage)
            }
        })    
    } catch (e) {
        console.error(`Get /subjects error: ${e}`)
        res.status(500).json({error:'Failed to get subjects'})
    }
})

export default router