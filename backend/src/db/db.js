import mongoose from 'mongoose'

async function connectDB(){
	try {
		await mongoose.connect(process.env.MONGO_URI)
		console.log('Connected to db')
	} catch (err) {
		console.log('Failed to connect to db')
	}
}

export default connectDB
