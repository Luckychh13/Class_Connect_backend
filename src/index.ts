import express from "express";

const app = express();
const port = 8000;

app.use(express.json());

app.get("/", (_request, response) => {
	response.send("Class Connect API is running");
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
