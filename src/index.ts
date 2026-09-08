import AgentAPI from "apminsight";
AgentAPI.config()

import express from "express"
import subjectsRouter from "./routes/subjects.js";
import usersRouter from "./routes/users.js"
import classesRouter from "./routes/classes.js"
import cors from "cors"
import securityMiddleware from "./middleware/security.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";

const app = express()
const PORT = 8000;

if(!process.env.FRONTEND_URL){
	throw new Error('Frontend_Url is not set in .env file')
}
app.use(cors({
	origin:process.env.FRONTEND_URL,
	methods:['GET','PUT','POST','DELETE'],
	credentials:true
}))

app.all('/api/auth/{*any}', toNodeHandler(auth));

app.use(express.json())

app.use(securityMiddleware)

app.use('/api/subjects',subjectsRouter)
app.use('/api/users',usersRouter)
app.use('/api/classes',classesRouter)

app.get('/', (req,res) => {
	res.send('Hell0,welcome to class Conect Api')
})

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
	
})