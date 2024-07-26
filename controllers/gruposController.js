const Categorias = require('../models/Categorias')



exports.formNuevoGrupo = async(req, res) =>{

    const categorias = await Categorias.findAll();


    res.render('nuevo-grupo',{
        nombrePagina: 'Crea un nuevo grupo',
        categorias
    })
}