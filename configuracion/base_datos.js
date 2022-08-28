
const mongoose = require('mongoose');


module.exports = class BaseDatos {
    /*
        Administra la coneccion a la BD y los parametro para inicializarla
    */

    constructor(bd, opciones = {}){
        this._bd = bd;
        this._opciones = opciones;
    }

    conectar(){
        const BD = mongoose.connect(this._bd, this._opciones);
        mongoose.connection.on('error', (err)=> {
            throw err //new Error(`No se pudo conectar a la base de datos, por favor verifique`);
        });
        return BD;
    }
}
