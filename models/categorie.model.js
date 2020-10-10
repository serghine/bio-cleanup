const mongoose=require('mongoose');
const Schema=mongoose.Schema;


const categorieSchema=new Schema({
    name:{
        type:String,
        unique:true,
        trim:true
    },
    description:{
        type:String,
        trim:true,
        required:true
    },
    urlPhoto:{
        type:String,
        required:true
    },
    serviceId:{
        type:Schema.Types.ObjectId
    }

 
})

module.exports=mongoose.model('Categorie',categorieSchema);