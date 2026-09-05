import express from "express"
import subjectsRouter from "./routes/subjects";
import cors from "cors"
import securityMiddleware from "./middleware/security";

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

app.use(express.json())

app.use(securityMiddleware)

app.use('/api/subjects',subjectsRouter)

app.get('/', (req,res) => {
	res.send('Hell0,welcome to class Conect Api')
})

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
	
})