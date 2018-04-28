

const { Router } = require('express'),
	ControladorReservaciones = require('../../reservaciones'),
	Autenticar = require('../autenticacion'),
	Autorizar = require('../autorizacion');


module.exports = class RutasReservaciones {

	constructor(){
		this._manejador_peticiones = Router();
		this._Autorizar =  new Autorizar();
		this._Autenticar =  new Autenticar();
		this._ctrlReservaciones = new ControladorReservaciones();
	}


	urls() {

        this._manejador_peticiones.post('/inventario/:tipo_entidad/:entidad/agregar-recurso',
            (req, res, next) => this._Autorizar.como_admin_o_para_recurso_propio(req, next),
            (req, res, next) => this._ctrlReservaciones.agregar_producto_POST(req, res, next)
        );


		return this._manejador_peticiones;
	}


	urls_api() {

		this._manejador_peticiones.all('*', (req, res, next) => this._Autenticar.usuario(req, next));

        this._manejador_peticiones.post('/inventario/:tipo_entidad/:entidad/agregar-recurso',
            (req, res, next) => this._Autorizar.como_admin_o_para_recurso_propio(req, next),
            (req, res, next) => this._ctrlReservaciones.agregar_producto_POST(req, res, next)
        );

		return this._manejador_peticiones;
	}

}
