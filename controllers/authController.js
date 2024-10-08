const passport = require("passport");

exports.autenticarUsuario = passport.authenticate('local',{
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});


//revisa si el usuario esta autenticado o no
exports.usuarioAutenticado = (req, res, next) =>{
    //si el usuario esta autenticado, adelante
    if(req.isAuthenticated()){
        return next();
    }

    //si no esta autenticado
    return res.redirect('/iniciar-sesion');
}

//cerrar sesion
exports.cerrarSesion = (req, res, next)=>{
    req.logout(function(error){
        console.log(error);
    })
    req.flash('correcto', 'Cerraste Sesión correctamente');
    res.redirect('/iniciar-sesion');
    next();
}

