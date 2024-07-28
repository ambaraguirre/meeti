const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const usuariosController = require('../controllers/usuariosController')
const authController = require('../controllers/authController')
const gruposController = require('../controllers/gruposController');
const adminController = require('../controllers/adminController');

module.exports = function(){
    router.get('/', homeController.home);


    //crear y confirmar cuenta
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta', usuariosController.crearNuevaCuenta);
    router.get('/confirmar-cuenta/:correo', usuariosController.confirmarCuenta);

    //iniciar sesion
    router.get('/iniciar-sesion',usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);

    //panel de administración
    router.get('/administracion', authController.usuarioAutenticado, adminController.panelAdministracion);
    

    //nuevos grupos
    router.get('/nuevo-grupo', authController.usuarioAutenticado, gruposController.formNuevoGrupo)
    router.post('/nuevo-grupo',authController.usuarioAutenticado, gruposController.subirImagen, gruposController.crearGrupo);

    //editar grupos
    router.get('/editar-grupo/:grupoId', authController.usuarioAutenticado, gruposController.formEditarGrupo);
    router.post('/editar-grupo/:grupoId', authController.usuarioAutenticado, gruposController.editarGrupo);

    //editar la imagen del grupo
    router.get('/imagen-grupo/:grupoId', authController.usuarioAutenticado, gruposController.formEditarImagen);

    return router;
}