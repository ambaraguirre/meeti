const Categorias = require('../models/Categorias')
const Grupos = require('../models/Grupos')
const {check} = require('express-validator')
const multer = require('multer')
const shortId = require('shortid')

const configuracionMulter = {


    limits: { fileSize : 100000},
    storage : fileStorage = multer.diskStorage({
        destination: (req,file,next) =>{
            next(null,__dirname + '/../public/uploads/grupos/');
        },
        filename: (req, file, next) =>{
            const extension = file.mimetype.split('/')[1];
            next(null, `${shortId.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, next) {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg'){
            next(null, true);
        }
        else{
            next(new Error('Formato no válido'), false);
        }
    }
}

const uploads = multer(configuracionMulter).single('imagen');

//sube imagen en el servidor
exports.subirImagen = (req,res,next) =>{
    uploads(req,res, function(error){
        if(error){
            if(error instanceof multer.MulterError){
                if(error.code === 'LIMIT_FILE_SIZE'){
                    req.flash('error', 'El archivo es muy grande');
                }
                else{
                    req.flash('error', error.message);
                }
            }
            else if(error.hasOwnProperty('message')){
                req.flash('error', error.message);
            }
            res.redirect('back');
            return;
        }
        else{
            next();
        }
    })
}


exports.formNuevoGrupo = async(req, res) =>{

    const categorias = await Categorias.findAll();


    res.render('nuevo-grupo',{
        nombrePagina: 'Crea un nuevo grupo',
        categorias
    })
}

//almacena los grupos en la bd
exports.crearGrupo = async(req, res) =>{
    //sanitizar campos 
    await check('nombre').escape().run(req);
    await check('url').escape().run(req);

    const grupo = req.body;

    //almacena el usuario autenticado como el creador del grupo
    grupo.usuarioId = req.user.id;
    grupo.categoriaId = req.body.categoria;

    //leer la imagen 
    if(req.file){
        grupo.imagen = req.file.filename;
    }
    
    try{
        //almacenar en la bd
        await Grupos.create(grupo);
        req.flash('exito', 'Se ha creado el grupo correctamente');
        res.redirect('/administracion');
        
    }catch(error){
        //extraer los mensajes de error
        const erroresSequelize = error.errors.map(err => err.message);
        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-grupo');
    }
}

