
import {mongoose} from 'mongoose'

export const dbConnect = async() => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI)
        console.log('connection successfull')
    } catch (error) {
        console.log(error.message)
    }
}