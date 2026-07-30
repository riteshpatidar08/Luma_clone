import mongoose from 'mongoose' ;


const UserSchema = new mongoose.Schema({
    profile : {
        name : String ,
        bio : String ,
        avatarUrl : String
    },
    email : {
        type : String ,
        required : true ,
        unqiue : true
    },
    passwordHash : {
        type : String ,
        
    },
    
    isActive : {
        type : Boolean ,
         default : true 
    },
    roles : {
        type : String,
        enum : ['attendee' , 'organizer' , 'admin'],
        default  : 'attendee'
    },
    twoFactorEnabled: { type: Boolean, default: false },
}, { timestamps: true })


const User = mongoose.model('User' , UserSchema) ;

export default User