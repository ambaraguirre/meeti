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

//muestra el formulario para editar meeti
exports.formEditarMeeti = async (req, res, next) =>{
    const consultas = [];
    consultas.push(Grupos.findAll({where:{ usuarioId: req.user.id}}));
    consultas.push(Meeti.findByPk(req.params.id));

    //return un promise
    const [grupos,meeti] = await Promise.all(consultas);

    if(!grupos || !meeti){
        req.flash('error', 'Operación no valida');
        res.redirect('/administracion');
        return next();
    }

    //mostramos la vista
    res.render('editar-meeti',{
        nombrePagina: `Editar Meeti ${meeti.titulo} `,
        meeti,
        grupos
    })
}

//guardar los cambios de la edicion 
exports.editarMeeti = async(req, res, next)=>{
    const meeti = await Meeti.findOne({where: {id: req.params.id, usuarioId: req.user.id}});

    if(!meeti){
        req.flash('error', 'Operación no valida');
        res.redirect('/administracion');
        return next();
    }

    //asignar los valores
    const {grupoId, titulo, invitado, fecha, hora, cupo, descripcion, direccion, ciudad, estado, lat, lng} = req.body;
    meeti.grupoId = grupoId;
    meeti.titulo = titulo;
    meeti.invitado = invitado;
    meeti.fecha = fecha;
    meeti.hora = hora;
    meeti.cupo = cupo;
    meeti.descripcion = descripcion;
    meeti.direccion = direccion;
    meeti.ciudad = ciudad;
    meeti.estado = estado;
    meeti.lat = lat;
    meeti.lng = lng;

    //asignar point(ubicacion)
    const point = {type: 'Point', coordinates: [parseFloat(lat), parseFloat(lng)]};
    meeti.ubicacion = point;

    //almacenarlo en la bd
    await meeti.save();
    req.flash('exito', 'Cambios guardados correctamente');
    res.redirect('/administracion');

}

//formulario de eliminar meeti
exports.formEliminarMeeti = async (req, res, next) =>{
    const meeti = await Meeti.findOne({where:{id: req.params.id, usuarioId : req.user.id}});

    if(!meeti){
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    //todo bien, ejecutar la vista
    res.render('eliminar-meeti',{
        nombrePagina: `Eliminar Meeti: ${meeti.titulo}`
    })
}

//eliminar meeti de la bd
exports.eliminarMeeti = async(req, res)=>{

     //eliminar el grupo
     await Meeti.destroy({
        where: {
            id : req.params.id
        }
    });

    req.flash('exito', 'Meeti Eliminado');
    res.redirect('/administracion');
}




