const express = require('express');
require('dotenv').config({path: 'variables.env'});
const routes = require('./routes');
const path = require('path');
const expressEjsLayouts = require('express-ejs-layouts');


const app = express();

//habilitar ejs como template engine
app.use(expressEjsLayouts);
app.set('view engine', 'ejs');

//ubicación de las vistas
app.set('views', path.join(__dirname, "./views"));

//middleware propio (usuario logeado, flashmessages, fecha actual)
app.use((req,res,next) =>{
    const fecha = new Date();
    res.locals.year = fecha.getFullYear();

    next();
    
});



//archivos estaticos
app.use(express.static('public'));

//routing
app.use('/', routes());

//Agrega el puerto
app.listen(process.env.PORT, ()=>{
    console.log("El servidor esta funcionando");
});
