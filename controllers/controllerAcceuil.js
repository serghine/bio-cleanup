
const nodemailer=require('nodemailer');
const mailGun=require('nodemailer-mailgun-transport');
const Categorie=require('../models/categorie.model');
const Service=require('../models/service.model')
const fs=require('fs-extra');

//controller acceuil

exports.getAcceuil=function(req,res,next){
    Categorie.find(function(err,categories){
        if(err){
            console.log(err)
        }else{
            res.render('acceuil',{categories:categories});
        }
    })
    
    
}

exports.getContact=function(req,res,next){
    res.render('contact');
}
exports.postContact=function(req,res,next){
    if(req.body.name==""||req.body.email==""||req.body.message==""||req.body.subject==""){
        req.session.message={
            type:"danger",
            intro:"eroor:",
             message:"veuiller remplir les champs necessaire a l'envoie du messages svp"
        }
        return res.redirect("/contact");
    }
    const auth={
        auth:{
          api_key:process.env.API_KEY,
          domain:process.env.DOMAINE
        }
    }
  
    const transporter=nodemailer.createTransport(mailGun(auth))
    //2eme etape
    try {
      const optionMail={
          from:req.body.email,
          to:process.env.EMAIL,
          subject:req.body.name + req.body.subject,
          text:req.body.message
      }
      //3eme etape
      transporter.sendMail(optionMail,function(err,data){
          if(err){
              console.log("email not send",err);
          }else{
            req.session.message={
                type:"success",
                intro:"success:",
                 message:"email bien envoyer au destinataire"
            }
            console.log("email send !!",data);

            return res.redirect("/contact");
          }
      })
   
    } catch (error) {
        console.log("erreur avec le lenvoie du mail")
    }
}


exports.getProductByCategorie=async function(req,res,next){
    try {
        const libelle=req.params.cat;
         const categorie=await Categorie.findOne({name:libelle});
     var name=categorie.name;
    Categorie.findOne({name:name},function(err,doc){
        if(err){
            console.log(err)
        }
        Service.find({categorie:libelle},function(err,docs){
            if(err){
                console.log(err)
            }else{
                res.render("serviceByCategorie",{docs:docs,name:name})
            }
        })
    })
    } catch (error) {
        console.log(error)

    }
    
}

//detail service
exports.getDetailService=function(req,res,next){
    var id=req.params.id;
    var galleryImages=null;
    Service.findOne({_id:id},function(err,service){
        if(err){
            console.log(err)
        }else{
               var galleryImagesdir="public/imageService/"+service._id+"/gallery";
               fs.readdir(galleryImagesdir,function(err,files){
                   if(err){
                       console.log(err)
                   }else{
                    galleryImages=files;
                    req.session.service=service;
                   req.session.serviceID=service._id
                    res.render('detailService',{
                        name:service.name,
                        service:service,
                        galleryImage1:galleryImages[0],
                        galleryImage2:galleryImages[1],
                        galleryImage3:galleryImages[2],
                    }) 
                   }
               })
        }
    })

}
//
exports.getAbout=function(req,res,next){
    res.render('about');
}
