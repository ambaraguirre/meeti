const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const usuariosController = require('../controllers/usuariosController')
const authController = require('../controllers/authController')
module.exports = function(){
    router.get('/', homeController.home);


    //crear y confirmar cuenta
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta', usuariosController.crearNuevaCuenta);
    router.get('/confirmar-cuenta/:correo', usuariosController.confirmarCuenta);

    //iniciar sesion
    router.get('/iniciar-sesion',usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);
    return router;
}