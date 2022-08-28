
const { Router } = require('express'),
	ControladorBusqueda = require('../busqueda'),
	Autorizar = require('../autorizacion');


module.exports = class RutasBusquedas {

	constructor(){
		this._manejador_peticiones = Router();
		this._ctrlBusqueda = new ControladorBusqueda();
		this._Autorizar =  new Autorizar();
	}


	urls() {

		this._manejador_peticiones.get('/solicitudes-ps',
			(req, res, next) => this._Autorizar.solo_a("Administrador", req, next),
			(req, res, next) => this._ctrlBusqueda.solicitudes_ps_GET(req, res, next)
		);

		this._manejador_peticiones.get('/general',
			(req, res, next) => this._ctrlBusqueda.geocodificada(req, res, next),
			(req, res, next) => this._ctrlBusqueda.resultados_sin_categoria(req, res, next)
		);

		this._manejador_peticiones.get(['/:tipo_entidad/:atributo', '/:tipo_entidad'],
			(req, res, next) => this._ctrlBusqueda.resultados_por_categoria(req, res, next)
		);

		return this._manejador_peticiones;
	}



	urls_api() {

		this._manejador_peticiones.get('/geocodificada',
			(req, res, next) => this._ctrlBusqueda.geocodificada_middleware(req, res, next)
		);

		this._manejador_peticiones.get('/solicitudes-ps',
			(req, res, next) => this._ctrlBusqueda.solicitudes_ps_API(req, res, next)
		);

		this._manejador_peticiones.get('/:tipo_entidad/cerca-de/:url',
			(req, res, next) => this._ctrlBusqueda.entidades_cercanas(req, res, next)
		);

		this._manejador_peticiones.get('/mejor-valorados',
			(req, res, next) => this._ctrlBusqueda.mejor_votados(req, res, next)
		);

		this._manejador_peticiones.get('/cantidad-solicitudes-ps',
			(req, res, next) => this._ctrlBusqueda.cantidad_solicitudes_ps_API(req, res, next)
		);

		this._manejador_peticiones.get('/sugerencias/:tipo_entidad',
			(req, res, next) => this._ctrlBusqueda.autocompletar(req, res, next)
		);

		return this._manejador_peticiones;
	}

}
