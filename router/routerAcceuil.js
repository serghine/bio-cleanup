const express=require('express');
const {Router}=require('express');
const controllerAcceuil=require('../controllers/controllerAcceuil');




const router=express.Router();

router.get('/', controllerAcceuil.getAcceuil);
///
router.get('/contact',controllerAcceuil.getContact);
router.post('/contact',controllerAcceuil.postContact);


//product by categorie

router.get('/service/:cat',controllerAcceuil.getProductByCategorie);
router.get('/detailService/:id',controllerAcceuil.getDetailService);
router.get("/apropo",controllerAcceuil.getAbout);






module.exports=router;