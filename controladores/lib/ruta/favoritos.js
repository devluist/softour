
const { Router } = require('express'),
	ControladorFavoritos = require('../../favoritos'),
	Autenticar = require('../autenticacion'),
	Autorizar = require('../autorizacion');


module.exports = class RutasFavoritos {

	constructor(){
		this._manejador_peticiones = Router();
		this._Autorizar =  new Autorizar();
		this._Autenticar =  new Autenticar();
		this._CtrlFavoritos = new ControladorFavoritos();
	}


	urls() {

		this._manejador_peticiones.all('*', (req, res, next) => this._Autorizar.sin_acceso_API(req, next));

		return this._manejador_peticiones;
	}


	urls_api() {


		this._manejador_peticiones.get('/:usuario',
			(req, res, next) => this._CtrlFavoritos.del_turista(req, res, next)
		);

		this._manejador_peticiones.get('/:tipo_entidad/:entidad/existe',
			(req, res, next) => this._Autenticar.usuario(req, next),
			(req, res, next) => this._Autorizar.solo_a("Turista", req, next),
			(req, res, next) => this._CtrlFavoritos.existe(req, res, next),
			(req, res, next) => this._CtrlFavoritos.visualizar_agregados(req, res, next)
		);

		this._manejador_peticiones.post('/:tipo_entidad/:entidad/agregar',
			(req, res, next) => this._Autenticar.usuario(req, next),
			(req, res, next) => this._Autorizar.solo_a("Turista", req, next),
			(req, res, next) => this._CtrlFavoritos.existe(req, res, next),
			(req, res, next) => this._CtrlFavoritos.agregar_POST(req, res, next)
		);
		this._manejador_peticiones.delete('/:tipo_entidad/:entidad/eliminar', (req, res, next) => this._Autenticar.usuario(req, next),
			(req, res, next) => this._Autorizar.solo_a("Turista", req, next),
			(req, res, next) => this._CtrlFavoritos.existe(req, res, next),
			(req, res, next) => this._CtrlFavoritos.eliminar(req, res, next)
		);

		this._manejador_peticiones.get('/:tipo_entidad/:entidad',
			(req, res, next) => this._CtrlFavoritos.vinculados_a_entidad(req, res, next)
		);

		return this._manejador_peticiones;
	}

}
