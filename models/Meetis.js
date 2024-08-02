const Sequelize = require('sequelize');
const db = require('../config/db');
const {v4: uuidv4} = require('uuid');
const slug = require('slug');
const shortid = require('shortid');
const Usuarios = require('../models/Usuarios')
const Grupo = require('../models/Grupos')

const Meeti = db.define('meeti', {
    id:{
        type: Sequelize.UUID,
        primaryKey: true, 
        allowNull: false,
        defaultValue: uuidv4()
    },
    titulo:{
        type: Sequelize.STRING,
        allowNull: false,
        validate:{
            notEmpty:{
                msg: 'Agrega un titulo'
            }
        }
    },
    slug:{
        type: Sequelize.STRING
    },
    invitado: Sequelize.STRING,
    cupo: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    descripcion:{
        type: Sequelize.TEXT,
        allowNull: false,
        validate :{
            notEmpty:{
                msg: 'Agrega una descripción'
            }
        }
    },
    fecha:{
        type: Sequelize.DATEONLY,
        allowNull: false,
        validate:{
            notEmpty:{
                msg: 'Agrega una fecha para el meeti'
            }
        }
    },
    hora:{
        type: Sequelize.TIME,
        allowNull: false,
        validate:{
            notEmpty:{
                msg: 'Agrega una hora para el meeti'
            }
        }
    },
    direccion:{
        type: Sequelize.STRING,
        allowNull: false,
        validate:{
            notEmpty:{
                msg: 'Agrega una dirección para el meeti'
            }
        }
    },
    ciudad:{
        type: Sequelize.STRING,
        allowNull: false,
        validate:{
            notEmpty:{
                msg: 'Agrega una ciudad para el meeti'
            }
        }
    },
    estado:{
        type: Sequelize.STRING,
        allowNull: false,
        validate:{
            notEmpty:{
                msg: 'Agrega un estado para el meeti'
            }
        }
    },
    pais:{
        type: Sequelize.STRING,
        allowNull: false,
        validate:{
            notEmpty:{
                msg: 'Agrega un pais'
            }
        }
    },
    ubicacion:{
        type: Sequelize.GEOMETRY('POINT')
    },
    intereseados:{
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: []
    }

}, {
    hooks: {
        async beforeCreate(meeti){
            const url = slug(meeti.titulo).toLowerCase();
            meeti.slug = `${url}-${shortid.generate()}`;
        }
    }
});

Meeti.belongsTo(Usuarios);
Meeti.belongsTo(Grupo);

module.exports = Meeti;