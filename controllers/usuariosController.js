const Usuarios = require('../models/Usuarios');
const { check, validationResult } = require('express-validator');
const enviarEmail = require('../handlers/emails')
const fs = require('fs');
const multer = require('multer')
const shortId = require('shortid')

const configuracionMulter = {
    limits:{fileSize: 100000},
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) =>{
            next(null, __dirname+'/../public/uploads/perfiles');
        },
        filename: (req, file, next)=>{
            const extension = file.mimetype.split('/')[1];
            next(null, `${shortId.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, next){
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg'){
            next(null, true);
        }
        else{
            next(new Error('Formato no válido'), false);
        }
    }
}

const uploads = multer(configuracionMulter).single('imagen');

exports.subirImagen = (req, res, next) =>{
    uploads(req, res, function(error){
        if(error){
            if(error instanceof multer.MulterError){
                if(error.code === 'LIMIT_FILE_SIZE'){
                    req.flash('error', 'El archivo es muy grande')
                }
                else{
                    req.flash('error', error.message);
                }
            }
            else if(error.hasOwnProperty('message')){
                req.flas('error', error.message);
            }
            res.redirect('back');
            return;
        }
        else{
            next();
        }
    })
   
}

exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu cuenta'
    });
}

exports.crearNuevaCuenta = async (req, res) => {
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
        if (!erroresExpress.isEmpty()) {
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
exports.confirmarCuenta = async (req, res, next) => {
    //verificar que el usuario existe
    const usuario = await Usuarios.findOne({ where: { email: req.params.correo } });

    //si no existe: redireccionar 
    if (!usuario) {
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
exports.formIniciarSesion = (req, res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar Sesión'
    })
}

//muestra formulario para editar perfil
exports.formEditarPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('editar-perfil', {
        nombrePagina: `Editar Perfil`,
        usuario
    })
}

//guardar el perfil editado
exports.editarPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);
    await check('nombre').escape().run(req);
    await check('email').escape().run(req);
    await check('descripcion').escape().run(req);

    //leer datos del form
    const { nombre, descripcion, email } = req.body;

    //asignar los valores
    usuario.nombre = nombre;
    usuario.descripcion = descripcion;
    usuario.email = email;

    //almacenar en la bd
    await usuario.save();
    req.flash('exito', 'Cambios guardados correctamente');
    res.redirect('/administracion');

}
//muestra el formulario para modificar password
exports.formCambiarPassword = (req, res) => {
    res.render('cambiar-password', {
        nombrePagina: 'Cambiar Password'
    })
}

//cambiar password
exports.cambiarPassword = async (req, res, next) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    //verificar que el password anterior esta correcto
    if (!usuario.validarPassword(req.body.anterior)) {
        req.flash('error', 'El password anterior es incorrecto');
        res.redirect('/administracion');
        return next();
    }

    //si el password es correcto hashear el nuevo
    const hash = usuario.hashPassword(req.body.nuevo);

    //asignar el password hasheado al usuario 
    usuario.password = hash;
    await usuario.save();

    //redireccionar
    req.logout(function(error){
        console.log(error)
    });
    req.flash('exito', 'Password cambiado correctamente, vuelve a iniciar sesión');
    res.redirect('/iniciar-sesion');
}

//mostrar formulario para agregar foto
exports.formImagenPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('imagen-perfil', {
        nombrePagina: 'Agregar foto de perfil',
        usuario
    })
}

//guardar foto de perfil
exports.imagenPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    if (!usuario) {
        req.flash('error', 'Operación no valida');
        res.redirect('/administracion');
        return next();
    }

    //si hay imgen anterior y nuevo significa que vamos a borrar la anterior

    if (req.file && usuario.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/perfiles/${usuario.imagen}`;

        //eliminar archivo con fileSystem
        fs.unlink(imagenAnteriorPath, (error) => {
            if (error) {
                console.log(error);
            }
            return;
        })
    }

    //si hay una imagen nueva sin excepciones la vamos a guardar
    if(req.file){
        usuario.imagen = req.file.filename;
    }

    //guardar en la bd
    await usuario.save();
    req.flash('exito', 'Imagen guardada correctamente');
    res.redirect('/administracion');

}