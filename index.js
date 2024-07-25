const express = require('express');
require('dotenv').config({path: 'variables.env'});
const routes = require('./routes');
const path = require('path');
const expressEjsLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');

//configuracion y modelos de la base de datos 
const db = require('./config/db');
require('./models/Usuarios');
db.sync().then(()=> console.log("Db conectada")).catch((error)=>console.log(error));


//aplicacion principal
const app = express();

//body parser, leer formularios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//habilitar ejs como template engine
app.use(expressEjsLayouts);
app.set('view engine', 'ejs');

//ubicación de las vistas
app.set('views', path.join(__dirname, "./views"));


//archivos estaticos
app.use(express.static('public'));

//habilitar cookieparser
app.use(cookieParser());

//habilitar la sesión
app.use(session({
    secret: process.env.SECRETo,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false
}));

//inicializar passport
app.use(passport.initialize());
app.use(passport.session());

//agrega flash messages
app.use(flash());

//middleware propio (usuario logeado, flashmessages, fecha actual)
app.use((req,res,next) =>{
    res.locals.mensajes = req.flash();
    const fecha = new Date();
    res.locals.year = fecha.getFullYear();

    next();
    
});

//routing
app.use('/', routes());

//Agrega el puerto
app.listen(process.env.PORT, ()=>{
    console.log("El servidor esta funcionando");
});
