const Usuarios = require('../models/Usuarios');
const {check, validationResult} = require('express-validator');


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


//formulario para iniciar sesion
exports.formIniciarSesion = (req, res) =>{
    res.render('iniciar-sesion',{
        nombrePagina: 'Iniciar Sesión'
    })
}