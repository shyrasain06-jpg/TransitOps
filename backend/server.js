import 'dotenv/config'
import app from './src/app.js'
import connectDB from './src/db/db.js'

await connectDB()

app.listen(process.env.PORT, () => {
	console.log(`Server listening on port ${process.env.PORT}`)
})
