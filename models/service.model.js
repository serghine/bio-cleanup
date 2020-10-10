const mongoose=require('mongoose');
const Schema=mongoose.Schema;


const serviceSchema=new Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        trim:true,
        required:true
 
    },
    urlPhoto:{
        type:String,
        trim:true,
        required:true
    },
    categorie:{
        type:String,
        trim:true,

        
    }

 
})

module.exports=mongoose.model('Service',serviceSchema);