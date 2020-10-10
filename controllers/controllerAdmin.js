const User=require('../models/user.model');
const bcrypt=require('bcrypt');
const Categorie=require('../models/categorie.model');
const {mkdirp}=require('fs-extra');
const path=require('path');
const Service=require('../models/service.model');
const fs=require('fs-extra');
const hogan=require('hogan.js');
const nodemailer=require('nodemailer');
const resizImg=require('resize-img')
require("dotenv").config();

exports.getInscription=function(req,res,next){
res.render('inscription');
}

exports.getconnexion=function(req,res,next){
    res.render('connexion');
}

////////////////////////////////////
exports.postInscription=async function(req,res,next){
    try {
        //email unique
       const existingUser=await User.findOne({email:req.body.email})
       if(existingUser){
        req.session.message={
            type:"danger",
            intro:"Email existant ",
             message:"choisir un autre email..."
            }
        res.redirect("/admin/inscription");
       }else if(req.body.name==""||req.body.email==""||req.body.password==""){
        req.session.message={
            type:"danger",
            intro:"champs vide",
            message:"remplire les champs manquant.."
        }
    res.redirect('/admin/inscription');
    }
       else if(!req.body.name.match(/^[a-zA-Z]{1,}$/)){//1 charactere ou plus
        req.session.message={
            type:"danger",
            intro:"Erreur syntaxe",
            message:" le nom doit contenir uniquement en moin une lettres majiscule ou miniscule et pas d'espace !!"
        }
         res.redirect('/admin/inscription');
    }else if(!req.body.email.match(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/)){
        req.session.message={
            type:"danger",
            intro:"Erreur syntaxe",
            message:" l'email nest pas conforme doit etre sous la forme aaa@aa.aaa, lettres majiscule ou miniscule caractaire spreciaux ._%+- et chiffres acceptes!!"
        }
         res.redirect('/admin/inscription');
    }else if(!req.body.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/)){
        req.session.message={
            type:"danger",
            intro:"Erreur syntaxe",
            message:"le mot de passe doit contenir en moin 8 caractaire dont des chiffres des lettres minscules et en moin une majiscule et un caractere special  !!"
        }
    res.redirect('/admin/inscription');
    }
        var salt =await bcrypt.genSalt(10);
        var hashPass=await bcrypt.hash(req.body.password,salt);
        const user=new User({
            name:req.body.name,
            email:req.body.email,
            password:hashPass
        })
        user.save()
        .then(function(result){
            req.session.message={
                type:"success",
                intro:"sauvegarder avec succes",
                message:"connecter vous svp"
            }
            res.redirect('/admin/connexion')})
        .catch(function(err){console.log(err)}) 
    } catch (error) {
       console.log(error) 
    }
   
}


/////////////////////////////////
exports.postconnexion=async function(req,res,next){
    const user=await User.findOne({email:req.body.email})
    const code=process.env.CODE;
    if(req.body.email==""||req.body.password==""||req.body.code==""){
        req.session.message={
            type:"danger",
            intro:"champs vide",
            message:"remplire les champs manquant svp.."
        }
    res.redirect('/admin/connexion');
    }
    else if(!user){
        req.session.message={
            type:"danger",
            intro:"Eroor connexion",
            message:"email ou mot de passe innexistants.."
        }
    res.redirect('/admin/connexion');
        
    }else if(!req.body.email.match(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/)){
        req.session.message={
            type:"danger",
            intro:"Erreur syntaxe",
            message:" l'email nest pas conforme doit etre sous la forme aaa@aa.aaa, lettres majiscule ou miniscule caractaire spreciaux ._%+- et chiffres acceptes!!"
        }
         res.redirect('/admin/inscription');
    }else if(!req.body.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/)){
        req.session.message={
            type:"danger",
            intro:"Erreur syntaxe",
            message:"le mot de passe doit contenir en moin 8 caractaire dont des chiffres des lettres minscules et en moin une majiscule et un caractere special  !!"
        }
    res.redirect('/admin/inscription');
    }
    const match=await bcrypt.compare(req.body.password,user.password)
    if(!match){
        req.session.message={
            type:"danger",
            intro:"error: connection..",
             message:"le mot de passe ou l'email increct"
            }
        res.redirect("/admin/connexion");

    }else if(req.body.code!=code){
        req.session.message={
            type:"danger",
            intro:"error: connection..",
             message:"le code  de connexion administrateur est incorect"
            }
        res.redirect("/admin/connexion");
    }
   req.session.user=user;
   req.session.message={
    type:"success",
    intro:"Successfuly connected..",
     message:`welcome ${user.name}!!`
    }
  res.redirect("/");
}


//categorie vs service
//categorie
exports.getcategorie=async function(req,res,next){
    if(req.session.user){
        const categories=await Categorie.find()
        res.render('categorie',{categories:categories});
    }else{
        req.session.message={
            type:"danger",
            intro:"error: ",
             message:"connecter vous pour accedé acette page"
            }
        res.redirect('/admin/connexion')
    }
    
}



exports.postcategorie=async function(req,res,next){
    if(req.session.user){
    const existCategorie=await Categorie.findOne({name:req.body.name});
    if(req.body.name==""||req.body.description==""){
        req.session.message={
            type:"danger",
            intro:"error: ",
             message:"champs manquant"
            }
        res.redirect("/admin/categorie");
    }else if(!(req.files &&req.files.image)){
        req.session.message={
            type:"danger",
            intro:"error: ",
             message:"champs image manquant"
            }
        res.redirect("/admin/categorie");
    }else if(existCategorie){
        req.session.message={
            type:"danger",
            intro:"error:duplication ",
             message:"nom de Categorie existe deja choisir un autre"
            }
        res.redirect("/admin/categorie");
    }
    else if((path.extname(req.files.image.name)).toLowerCase() ==".pdf" || (path.extname(req.files.image.name)).toLowerCase() ==".docs"||(path.extname(req.files.image.name)).toLowerCase()==".mp4"||(path.extname(req.files.image.name)).toLowerCase()==".txt"||(path.extname(req.files.image.name)).toLowerCase()==".zip"){
        req.session.message={
            type:"danger",
            intro:"error:format ",
             message:"les formats accepter sont : png, jpg, jpeg"
            }
        res.redirect("/admin/categorie");
    
    }else{
        var categorie=new Categorie({
            name:req.body.name,
            description:req.body.description,
            urlPhoto:req.files.image.name
        }) 
        categorie.save(function(err){
            if(err){
                return console.log(err)
            }
            fs.mkdirp('public/imageCategorie/'+categorie._id,function(err){
                return console.log(err)
            });
        var imageFile=typeof req.files.image !=="undefined" ? req.files.image.name :"";
    
            if (imageFile !="") {
                var categorieImage=req.files.image;
                var path="public/imageCategorie/"+categorie._id+"/"+imageFile;
                categorieImage.mv(path,function(err){
                    console.log(err);
                })
            }
            req.session.message={
                type:"success",
                intro:"success ",
                 message:"categorie bien ajouter"
                }
            res.redirect("/admin/categorie");
        })
    
    }
}else{
    req.session.message={
        type:"danger",
        intro:"error: ",
         message:"connecter vous pour accedé acette page"
        }
    res.redirect('/admin/connexion')
}
   
}
//getProductModif
exports.getCatModif=function(req,res,next){
    if(req.session.user){
   let id= req.params.id;
   Categorie.findOne({_id:id},function(err,categorie){
    if(err){
        console.log(err)
    }else{
        res.render('categorieModif',{categorie:categorie})
    }
   })
}else{
    req.session.message={
        type:"danger",
        intro:"error: ",
         message:"connecter vous pour accedé acette page"
        }
    res.redirect('/admin/connexion')
}
    
}

//poste modif categorie
exports.postCategModif=function(req,res,next){
    if(req.session.user){

    const id=req.body.idcatModif
    var pimage=req.body.pimage;
  
  
    //console.log(pimage)
    Categorie.findByIdAndUpdate({_id:id}).then(function(categ){
        if(req.body.name==""|| req.body.description==""){
            req.session.message={
                type:"danger",
                intro:"error: champs vide",
                 message:"champs vide rempir les champs vide"
                }
          return  res.redirect("/admin/categorie/"+id);
        }

        categ.name=req.body.name;
        categ.description=req.body.description;
        

     if(req.files==null){
    //console.log("gros con")
    categ.urlPhoto = req.body.pimage
    //console.log("+++++++",service.urlPhoto)
               }
  
else if(req.files !==null){
    var extension=(path.extname(req.files.image.name)).toLowerCase()

 if( extension==".pdf" || extension ==".docs"||extension==".mp4"||extension==".txt"||extension==".zip"){
        req.session.message={
            type:"danger",
            intro:"error: le format est incorect",
             message:"accepter jpg png jpeg"
            }
       return res.redirect("/admin/categorie/"+id);
    }
    categ.urlPhoto=req.files.image.name
        //console.log("deferent de null",service.urlPhoto)
   
  
}
categ.save(function(err){
                        if(err){
                            console.log(err)
                        }

                        if(req.files !==null){

                            if(pimage!=""){
                                fs.remove('public/imageCategorie/'+id+"/" +pimage,function(err){
                                    if(err){console.log(err,"sa ne veut pas suppression")}
                                })
                            }
                        var imageFile=typeof req.files.image !=="undefined" ? req.files.image.name :"";
                            var categImage=req.files.image;
                            var path="public/imageCategorie/"+id +"/" +imageFile;
                            categImage.mv(path,function(err){
                                console.log(err);
                            })
                        }

                        req.session.message={
                            type:"success",
                            intro:"modifier avec succes ..",
                             message:"modifier une autre categorie"
                            }
                            return res.redirect('/admin/categorie');
                    })
})
}else{
    req.session.message={
        type:"danger",
        intro:"error: ",
         message:"connecter vous pour accedé acette page"
        }
    res.redirect('/admin/connexion')
}

}


//supprimer une categorie
exports.getCatdelet=async function(req,res,next){
    if(req.session.user){
    const id=req.params.id;
const categorie=await Categorie.findOne({_id:id})
console.log(categorie.name);
const name=categorie.name;
const service=await Service.findOne({categorie:name})
console.log("......",service);
if(service){
    req.session.message={
        type:"danger",
        intro:"error ..",
         message:"la categorie  est afflier a des service supprimer dabors les services.."
        }
      return  res.redirect('/admin/categorie');
}
    var path = "public/imageCategorie/"+id;
    fs.remove(path,function(err){
        if(err){
            console.log(err)
        }else{
            Categorie.findByIdAndRemove(id,function(err){
                if(err){
                    console.log(err)
                }else{
                    req.session.message={
                        type:"success",
                        intro:"deleted...",
                         message:"supprimer avec success..!!"
                        }
                   return res.redirect('/admin/categorie');
                }
            })
        }
    })
}else{
    req.session.message={
        type:"danger",
        intro:"error: ",
         message:"connecter vous pour accedé acette page"
        }
    res.redirect('/admin/connexion')
}
}



//service
exports.getservice=async function(req,res,next){
    if(req.session.user){
    const categorie=await Categorie.find();
    const services=await Service.find()
        res.render('service',{categorie:categorie,
        services:services});
    }else{
        req.session.message={
            type:"danger",
            intro:"error: ",
             message:"connecter vous pour accedé acette page"
            }
        res.redirect('/admin/connexion')
    }
    }



exports.postservice=async function(req,res,next){
    if(req.session.user){
    try {
        const existService=await Service.findOne({name:req.body.name});
    if(req.body.name ===""|| req.body.categorie=== ""||req.body.description === ""){
            req.session.message={
                type:"danger",
                intro:"error: ",
                 message:"champs manquant"
                }
            res.redirect("/admin/service");
        }else if(!(req.files && req.files.image)){
            req.session.message={
                type:"danger",
                intro:"error: ",
                 message:"champs manquant urlPhoto"
                }
            res.redirect("/admin/service");
        }
        else if(existService){
            req.session.message={
                type:"danger",
                intro:"error:duplication ",
                 message:"nom de service existe deja choisir un autre"
                }
            res.redirect("/admin/service");
        }
        else if((path.extname(req.files.image.name)).toLowerCase() ==".pdf" || (path.extname(req.files.image.name)).toLowerCase() ==".docs"||(path.extname(req.files.image.name)).toLowerCase()==".mp4"||(path.extname(req.files.image.name)).toLowerCase()==".txt"||(path.extname(req.files.image.name)).toLowerCase()==".zip"){
            req.session.message={
                type:"danger",
                intro:"error:format ",
                 message:"les formats accepter sont : png, jpg, jpeg"
                }
            res.redirect("/admin/service");
        
        }
        else{
            var imageFile=typeof req.files.image !=="undefined" ?req.files.image.name:"";
            console.log("--------------------------",imageFile)
            console.log("+++++++++++++++++++++++++++",req.files.image.name)
            const service=new Service({
                name:req.body.name,
                urlPhoto:imageFile,
                description:req.body.description,
                categorie:req.body.categorie
                });
                service.save(function(err){
                    try {
                      if(err)return console.log(err);
                      mkdirp("public/imageService/"+service._id,function(err){
                          return console.log(err)
                      })
                      fs.mkdirp('public/imageService/'+service._id+"/gallery",function(err){
                        return console.log(err)
                    });
                    if (imageFile !="") {
                        var serviceImage=req.files.image;
                        var path="public/imageService/"+service._id+'/'+imageFile;
                        serviceImage.mv(path,function(err){
                            return console.log(err)
                        })
                    }
                    } catch (error) {
                        console.log(error)
                    }
                })
                req.session.message={
                    type:"success",
                    intro:"enregistrer avec succes ",
                     message:"Ajouter un autre sevice.."
                    }
                res.redirect('/admin/service');
        }
    } catch (error) {
        console.log(error)
    }
}else{
    req.session.message={
        type:"danger",
        intro:"error: ",
         message:"connecter vous pour accedé acette page"
        }
    res.redirect('/admin/connexion')
}
    
}
///////////////////////////////////////////////
  exports.deletService=async function(req,res,next){
      if(req.session.user){
    const id=req.params.id;
    var path = "public/imageService/"+id;
    fs.remove(path,function(err){
        if(err){
            console.log(err)
        }else{
            Service.findByIdAndRemove(id,function(err){
                if(err){
                    console.log(err)
                }else{
                    req.session.message={
                        type:"success",
                        intro:"supprimer avec succes ",
                         message:"supprimer un autre .."
                        }
                    res.redirect('/admin/service');
                }
            })
        }
    })
}else{
    req.session.message={
        type:"danger",
        intro:"error: ",
         message:"connecter vous pour accedé acette page"
        }
    res.redirect('/admin/connexion')
}

  }

  exports.getServiceModif=async function(req,res,next){
      if(req.session.user){
      const categories=await Categorie.find();
     const id=req.params.id;
    Service.findOne({_id:req.params.id})
    .then(function(service){
        var galleryDir="public/imageService/"+service._id+"/gallery"
        var galerryImage=null;
        fs.readdir(galleryDir,function(err,files){
            if(err)console.log(err)
            galerryImage=files
            console.log("galerie",galerryImage)
           
           req.session.service=service
           req.session.serviceId=service._id
           req.session.urlPhoto=service.urlPhoto;
         res.render("modifierService",{
             id:id,
             categories:categories,
             service:service,
             description:service.description,
             name:service.name,
             image:service.urlPhoto,
             galerryImage1:galerryImage[0],
             galerryImage2:galerryImage[1],
             galerryImage3:galerryImage[2]
             });

        })
    })
    .catch(function(err){
        console.log(err)
    })
}else{
    req.session.message={
        type:"danger",
        intro:"error: ",
         message:"connecter vous pour accedé acette page"
        }
    res.redirect('/admin/connexion')
}
  }

  exports.postServiceModif=async function(req,res,next){
      if(req.session.user){
    const id=req.body.idProdModif
    var pimage=req.body.pimage;
  
  
    //console.log(pimage)
    Service.findByIdAndUpdate({_id:id}).then(function(service){
        if(req.body.name==""|| req.body.categorie==""||req.body.description==""){
            req.session.message={
                type:"danger",
                intro:"error: champs vide",
                 message:"champs vide rempir les champs vide"
                }
          return  res.redirect("/admin/service/"+id);
        }

    service.name=req.body.name;
    service.description=req.body.description;
    service.categorie=req.body.categorie;

     if(req.files==null){
    //console.log("gros con")
    service.urlPhoto = req.body.pimage
    //console.log("+++++++",service.urlPhoto)
               }
  
else if(req.files !==null){
    var extension=(path.extname(req.files.image.name)).toLowerCase()

 if( extension==".pdf" || extension ==".docs"||extension==".mp4"||extension==".txt"||extension==".zip"){
        req.session.message={
            type:"danger",
            intro:"error: le format est incorect",
             message:"accepter jpg png jpeg"
            }
       return res.redirect("/admin/service/"+id);
    }
        service.urlPhoto=req.files.image.name
        //console.log("deferent de null",service.urlPhoto)
   
  
}
             service.save(function(err){
                        if(err){
                            console.log(err)
                        }

                        if(req.files !==null){

                            if(pimage!=""){
                                fs.remove('public/imageService/'+id+"/" +pimage,function(err){
                                    if(err){console.log(err,"sa ne veut pas suppression")}
                                })
                            }
                        var imageFile=typeof req.files.image !=="undefined" ? req.files.image.name :"";
                            var serviceImage=req.files.image;
                            var path="public/imageService/"+id +"/" +imageFile;
                            serviceImage.mv(path,function(err){
                                console.log(err);
                            })
                        }

                        req.session.message={
                            type:"success",
                            intro:"modifier avec succes ..",
                             message:"modifier un autre"
                            }
                            return res.redirect('/admin/service');
                    })
})
}else{
    req.session.message={
        type:"danger",
        intro:"error: ",
         message:"connecter vous pour accedé acette page"
        }
    res.redirect('/admin/connexion')
}

}


//service galerie
exports.postServicegalerie=function(req,res,next){
    if(req.session.user){
    var serviceImage=req.files.file;
    var id=req.params.id;
    var path="public/imageService/"+id+"/gallery/"+req.files.file.name;
    serviceImage.mv(path,function(err){
if(err){
    console.log(err)
}
resizImg(fs.readFileSync(path),{width:1000,height:600}).then(function(buf){
fs.writeFileSync(path,buf)
})
    })
    res.sendStatus(200)
}else{
    req.session.message={
        type:"danger",
        intro:"error: ",
         message:"connecter vous pour accedé acette page"
        }
    res.redirect('/admin/connexion')
}
}
exports.getDeletImageGalery=function(req,res,next){
    if(req.session.user){

    
    var originalImage="public/imageService/"+req.query.id+"/gallery/"+req.params.image;
fs.remove(originalImage,function(err){
    if(err){
        console.log(err)
    }else{
        req.session.message={
            type:"success",
            intro:"success: deleted",
             message:"image supprimer avec success"
            }
        res.redirect('/admin/service/'+req.query.id);
    }
})
}else{
    req.session.message={
        type:"danger",
        intro:"error: ",
         message:"connecter vous pour accedé acette page"
        }
    res.redirect('/admin/connexion')
}
}


//email visversa
exports.getEmail=function(req,res,next){
    if(req.session.user){
    res.render('adminEmail');
}else{
    req.session.message={
        type:"danger",
        intro:"error: ",
         message:"connecter vous pour accedé acette page"
        }
    res.redirect('/admin/connexion')
}
      }
    

      //
 exports.postEmail=function(req,res,next){
     if(req.session.user){
        var template=fs.readFileSync('./views/page.hbs',"utf-8");
        var compileldTemplate=hogan.compile(template); 
           if(req.body.email==""||req.body.subject==""||req.body.message==""){
            req.session.message={
                type:"danger",
                intro:"Eroor: ",
                 message:"Champs manquant"
                }
            res.redirect('/admin/email');
           }else{
            let transpoter=  nodemailer.createTransport({
                service:"gmail",
                auth:{
                  user:process.env.EMAIL,
                  pass:process.env.PASS
                }
              })
              let optionMail={
                  from:process.env.EMAIL,
                  to:req.body.email,
                  subject:req.body.subject,
                  html:compileldTemplate.render({message:req.body.message})
              }
              transpoter.sendMail(optionMail,function(err,data){
                  if(err){
                    req.session.message={
                        type:"danger",
                        intro:"error",
                         message:"email incorrect"
                        }
                    res.redirect('/admin/email');
                  }else{
                    req.session.message={
                        type:"success",
                        intro:"success: ",
                         message:"email envoyer avec success"
                        }
                      res.redirect("/admin/email");
                  }
              })
           }
        }else{
            req.session.message={
                type:"danger",
                intro:"error: ",
                 message:"connecter vous pour accedé acette page"
                }
            res.redirect('/admin/connexion')
        }
    
      }


//deconnexion
exports.deconnexion=function(req,res,next){
    req.session.destroy(function(err){
        if(err){
            console.log(err)
        }else{
            res.redirect('/admin/connexion')
        }
    })
}
  
    

