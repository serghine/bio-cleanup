const mongoose=require('mongoose');
const Schema=mongoose.Schema;


const userSchema=new Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        trim:true,
        unique:true
    },
    password:{
        type:String,
        trim:true
    }
})

module.exports=mongoose.model('User',userSchema);