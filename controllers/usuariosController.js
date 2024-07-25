const Usuarios = require('../models/Usuarios');
const {check, validationResult} = require('express-validator');
const enviarEmail = require('../handlers/emails')

exports.formCrearCuenta = (req, res) =>{
    res.render('crear-cuenta',{
        nombrePagina: 'Crea tu cuenta'
    });
}

exports.crearNuevaCuenta = async (req, res) =>{
    const usuario = req.body;

    await check('confirmar').notEmpty().withMessage('El password confirmado no puede ir vacio').run(req);
    await check('confirmar').equals(req.body.password).withMessage('El password es diferente').run(req);


    //leer errores de express
    const erroresExpress = validationResult(req);
    
    try {
        await Usuarios.create(usuario);

        //generar url de confirmación
        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;
        //enviar email de confirmación
        await enviarEmail.enviarEmail({
            usuario,
            url,
            subject: 'Confirma tu cuenta de Meeti',
            archivo: 'confirmar-cuenta'
        });

        //mensaje flash y redireccionamiento
        req.flash('exito', "Hemos enviado un email, confirma tu cuenta");
        res.redirect('/iniciar-sesion');
    } catch (error) {
        let errExpress = [];
        //extraer el message de los errores
        const errorSequelize = error.errors.map(err => err.message);
        if(!erroresExpress.isEmpty()){
            //extraer unicamente el msg de los errores
            errExpress = erroresExpress.array().map(err => err.msg);
        }

        //unir errores
        const listaErrores = [...errorSequelize, ...errExpress];

        req.flash('error', listaErrores);
        res.redirect('/crear-cuenta');
    }

}

//confirma la suscripcion del usuario 
exports.confirmarCuenta = async(req, res, next) => {
    //verificar que el usuario existe
    const usuario = await Usuarios.findOne({where: {email: req.params.correo}});

    //si no existe: redireccionar 
    if(!usuario) {
        req.flash('error', 'No existe esa cuenta');
        req.redirect('/crear-cuenta');
        return next();
    }

    //si existe, confirmar suscripción y redireccionar
     usuario.activo = 1;
     await usuario.save();

     req.flash('exito', 'La cuenta se ha confirmado, ya puedes iniciar sesión');
     res.redirect('/iniciar-sesion');
}


//formulario para iniciar sesion
exports.formIniciarSesion = (req, res) =>{
    res.render('iniciar-sesion',{
        nombrePagina: 'Iniciar Sesión'
    })
}