
const  JOI = require('joi'),
	async = require('async'),
	Validacion = require('./');


module.exports = class ValidacionCalificaciones extends Validacion {

	constructor(){
		super();

		// esquema para joi del formulario de calificaciones
		this._esquema_calificaciones = JOI.object().keys({
			puntaje: JOI.number().min(0).max(5)
		});
	}

	puntaje(datos){
		return this._ejecutar(datos, this._esquema_calificaciones);
	}

}