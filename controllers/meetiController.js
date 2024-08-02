const Grupos = require('../models/Grupos')
const Meeti = require('../models/Meetis')
const {check} = require('express-validator')



//muestra el formulario para nuevos meetis 
exports.formNuevoMeeti = async(req, res) =>{
    const grupos = await Grupos.findAll({where: { usuarioId : req.user.id}})
    res.render('nuevo-meeti',{
        nombrePagina: 'Crear Nuevo Meeti',
        grupos
    })
}

//inserta nuevos meeti en la bd
exports.crearMeeti = async(req,res)=>{
    //obtener los datos
    const meeti = req.body;

    //asignar el usuario
    meeti.usuarioId = req.user.id;
    //almacena la ubicaicon con un point
    const point = { type : 'Point', coordinates : [parseFloat(req.body.lat), parseFloat(req.body.lng)]};
    meeti.ubicacion = point;

    //cupo opciones 
    if(req.body.cupo === ''){
        meeti.cupo = 0;
    }

    try {
        await Meeti.create(meeti);
        req.flash('exito', 'Se ha creado el meeti correctamente');
        res.redirect('/administracion');
    } catch (error) {
       //extraer los mensajes de error
       const erroresSequelize = error.errors.map(err => err.message);
       req.flash('error', erroresSequelize);
       res.redirect('/nuevo-meeti');
    }

}

//sanitizar meetis
exports.sanitizarMeeti = async(req, res, next)=>{
    await check('titulo').escape().run(req);
    await check('invitado').escape().run(req);
    await check('cupo').escape().run(req);
    await check('fecha').escape().run(req);
    await check('hora').escape().run(req);
    await check('direccion').escape().run(req);
    await check('ciudad').escape().run(req);
    await check('estado').escape().run(req);
    await check('pais').escape().run(req);
    await check('lat').escape().run(req);
    await check('lng').escape().run(req);
    await check('grupoId').escape().run(req);

    next();
}
