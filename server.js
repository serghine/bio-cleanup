const express = require('express');
const mongoose=require('mongoose');
const hbs=require('hbs');
const bodyParser=require('body-parser');
const path=require('path');
const logger=require('morgan');
const session=require('express-session');
const fileUpload=require("express-fileupload");  
//importation
const routerAcceuil=require('./router/routerAcceuil');
const routerAdmin=require('./router/routerAdmin');

const app = express();
const mongoSanitize = require('express-mongo-sanitize');

app.set("view engine","hbs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload())
app.use(express.static(path.join(__dirname,"./public")));
hbs.registerPartials(path.join(__dirname,"./views/partials"));
app.use(logger('dev'));
app.use(mongoSanitize());   //prevent sql injection midlwear
hbs.localsAsTemplateData(app);
app.use(session({
    key:"_sid",
    secret:"123ff",
    resave:false,
    saveUninitialized:false,
    cookie:{
        expires:60000000
    }
}))
app.use(function(req,res,next){
    const id=req.session.serviceId
    const id2=req.session.serviceID
    const urlPhoto=req.session.urlPhoto
   app.locals.id=id;
  app.locals.id2=id2;
  res.locals.user=req.session.user;
   app.locals.urlPhoto=urlPhoto;
   next();
   }) 
app.use(function(req,res,next){
    res.locals.message=req.session.message;
    delete req.session.message
    next();
})

//midlWear
app.use(routerAcceuil);
app.use('/admin',routerAdmin);




const port=process.env.PORT||1000;
mongoose.connect("mongodb://localhost:27017/cleanUP",{useCreateIndex:true,useUnifiedTopology:true,useNewUrlParser:true})
.then(function(){
    app.listen(port,function(){
        console.log(`le server est lancer a cette adress http://localhost:${port}`);
    })
})

