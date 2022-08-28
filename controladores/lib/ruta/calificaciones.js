
const { Router } = require('express'),
	ControladorCalificaciones = require('../../calificaciones'),
	Autenticar = require('../autenticacion'),
	Autorizar = require('../autorizacion');


module.exports = class RutasCalificaciones {

	constructor(){
		this._manejador_peticiones = Router();
		this._Autorizar =  new Autorizar();
		this._Autenticar =  new Autenticar();
		this._ctrlCalificaciones = new ControladorCalificaciones();
	}


	urls() {

		this._manejador_peticiones.all('*', (req, res, next) => this._Autorizar.sin_acceso_API(req, next));


		return this._manejador_peticiones;
	}


	urls_api() {

		this._manejador_peticiones.post('/:tipo_entidad/:entidad/agregar',
			(req, res, next) => this._Autenticar.usuario(req, next),
			(req, res, next) => this._Autorizar.solo_a("Turista", req, next),
			(req, res, next) => this._ctrlCalificaciones.agregar_POST(req, res, next)
		);

		this._manejador_peticiones.get('/:tipo_entidad/:entidad',
			(req, res, next) => this._Autenticar.usuario(req, next),
			(req, res, next) => this._Autorizar.solo_a("Turista", req, next),
			(req, res, next) => this._ctrlCalificaciones.usuario_ha_votado(req, res, next)
		);

		return this._manejador_peticiones;
	}

}
