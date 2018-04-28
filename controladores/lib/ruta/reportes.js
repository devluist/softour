
const { Router } = require('express'),
	ControladorReportes = require('../../reportes'),
	Autenticar = require('../autenticacion'),
	Autorizar = require('../autorizacion');


module.exports = class RutasReportes {

	constructor(){
		this._manejador_peticiones = Router();
		this._Autorizar =  new Autorizar();
		this._Autenticar =  new Autenticar();
		this._CtrlReportes = new ControladorReportes();
	}


	urls() {

		this._manejador_peticiones.all('*', (req, res, next) => this._Autorizar.sin_acceso_API(req, next));

		return this._manejador_peticiones;
	}


	urls_api() {

		this._manejador_peticiones.get('/usuarios-registrados',
			(req, res, next) => this._CtrlReportes.usuarios_registrados(req, res, next)
		);

		this._manejador_peticiones.get('/:tipo_entidad/:entidad',
			(req, res, next) => this._CtrlReportes.entidad_especifica(req, res, next)
		);

		this._manejador_peticiones.post('/:tipo_entidad/:entidad/agregar',
			(req, res, next) => this._Autenticar.usuario(req, next),
			(req, res, next) => this._Autorizar.solo_a("Turista", req, next),
			(req, res, next) => this._CtrlReportes.existe(req, res, next),
			(req, res, next) => this._CtrlReportes.agregar_POST(req, res, next)
		);

		this._manejador_peticiones.get('/visualizar',
			(req, res, next) => this._CtrlReportes.visualizar(req, res, next)
		);

		return this._manejador_peticiones;
	}

}
