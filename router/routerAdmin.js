const express=require('express');
const {Router}=require('express');
const controllerAdmin=require('../controllers/controllerAdmin');


const router=express.Router();

router.get('/inscription', controllerAdmin.getInscription);
router.get('/connexion', controllerAdmin.getconnexion);
router.post('/inscription', controllerAdmin.postInscription);
router.post('/connexion', controllerAdmin.postconnexion);
///service vs categorie
router.get('/service', controllerAdmin.getservice);
router.get('/categorie', controllerAdmin.getcategorie);
router.post('/service', controllerAdmin.postservice);
router.post('/categorie', controllerAdmin.postcategorie);
//email
router.get("/email",controllerAdmin.getEmail);
router.post("/email",controllerAdmin.postEmail);
//delet service
router.get("/deletService/:id",controllerAdmin.deletService);
router.get('/service/:id',controllerAdmin.getServiceModif);
router.post('/serviceModif',controllerAdmin.postServiceModif);

//modification de la categorie
router.get('/categorie/:id',controllerAdmin.getCatModif);
router.post('/modifierCategorie',controllerAdmin.postCategModif)
router.get('/deletCategorie/:id',controllerAdmin.getCatdelet);

//galerie service
router.post("/service_gallery/:id",controllerAdmin.postServicegalerie)
router.get('/delet-image/:image',controllerAdmin.getDeletImageGalery)

//deconnexion
router.get('/deconexion',controllerAdmin.deconnexion);





module.exports=router;