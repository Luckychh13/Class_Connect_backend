declare global {
    namespace Express {
        interface Request {
            user?: {
                role?:"admin" | "teacher" | "student"
            }
            userId?: string
        }
    }
}

export {}