const Sequelize = require('sequelize');
require('dotenv').config({path: 'variables.env'});

module.exports = new Sequelize('meeti',process.env.DB_HOST, process.env.DB_PASSWORD,{
    host: '127.0.0.1',
    port: '5432',
    dialect: 'postgres',
    pool:{
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    logging: false
} );