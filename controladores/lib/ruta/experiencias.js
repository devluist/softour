
const { Router } = require('express'),
	ControladorExperiencias = require('../../experiencias'),
	Autenticar = require('../autenticacion'),
	Autorizar = require('../autorizacion');


module.exports = class RutasExperiencias {

	constructor(){
		this._manejador_peticiones = Router();
		this._Autorizar =  new Autorizar();
		this._Autenticar =  new Autenticar();
		this._ctrlExperiencias = new ControladorExperiencias();
	}


	urls() {

		this._manejador_peticiones.all('*', (req, res, next) => this._Autorizar.sin_acceso_API(req, next));

		this._manejador_peticiones.get('/agregar',
			(req, res, next) => this._Autorizar.a_usuarios(["PrestadorServicio", "Administrador"], req, next),
			(req, res, next) => this._ctrlExperiencias.agregar_GET(req, res, next)
		);
		this._manejador_peticiones.post('/agregar',
			(req, res, next) => this._Autorizar.a_usuarios(["PrestadorServicio", "Administrador"], req, next),
			(req, res, next) => this._ctrlExperiencias.agregar_POST(req, res, next)
		);


		this._manejador_peticiones.get('/listado',
			(req, res, next) => this._Autorizar.a_usuarios(["PrestadorServicio", "Administrador"], req, next),
			(req, res, next) => this._ctrlExperiencias.listado(req, res, next)
		);
		this._manejador_peticiones.get('/:url',
			(req, res, next) => this._ctrlExperiencias.visualizar(req, res, next)
		);


		this._manejador_peticiones.get('/:url/editar',
			(req, res, next) => this._Autorizar.como_admin_o_para_recurso_propio(req, next),
			(req, res, next) => this._ctrlExperiencias.editar_GET(req, res, next)
		);
		this._manejador_peticiones.post('/:url/editar',
			(req, res, next) => this._Autorizar.como_admin_o_para_recurso_propio(req, next),
			(req, res, next) => this._ctrlExperiencias.editar(req, res, next)
		);


		this._manejador_peticiones.get('/:url/eliminar',
			(req, res, next) => this._Autorizar.como_admin_o_para_recurso_propio(req, next),
			(req, res, next) => this._ctrlExperiencias.eliminar_GET(req, res, next)
		);
		this._manejador_peticiones.post('/:url/eliminar',
			(req, res, next) => this._Autorizar.como_admin_o_para_recurso_propio(req, next),
			(req, res, next) => this._ctrlExperiencias.eliminar(req, res, next)
		);


		return this._manejador_peticiones;
	}


	urls_api() {

		this._manejador_peticiones.post('/agregar',
			(req, res, next) => this._Autenticar.usuario(req, next),
			(req, res, next) => this._Autorizar.a_usuarios(["PrestadorServicio", "Administrador"], req, next),
			(req, res, next) => this._ctrlExperiencias.agregar_POST(req, res, next)
		);


		this._manejador_peticiones.get('/listado',
			(req, res, next) => this._Autenticar.usuario(req, next),
			(req, res, next) => this._Autorizar.a_usuarios(["PrestadorServicio", "Administrador"], req, next),
			(req, res, next) => this._ctrlExperiencias.listado(req, res, next)
		);


		this._manejador_peticiones.get('/:url',
			(req, res, next) => this._ctrlExperiencias.visualizar(req, res, next)
		);


		this._manejador_peticiones.put('/:url/editar',
			(req, res, next) => this._Autenticar.usuario(req, next),
			(req, res, next) => this._Autorizar.como_admin_o_para_recurso_propio(req, next),
			(req, res, next) => this._ctrlExperiencias.editar(req, res, next)
		);


		this._manejador_peticiones.delete('/:url/eliminar', 
			(req, res, next) => this._Autenticar.usuario(req, next),
			(req, res, next) => this._Autorizar.como_admin_o_para_recurso_propio(req, next),
			(req, res, next) => this._ctrlExperiencias.eliminar(req, res, next)
		);

		this._manejador_peticiones.get('/:url/:respuesta',
			(req, res, next) => this._ctrlExperiencias.responder_solicitud(req, res, next)
		);


		return this._manejador_peticiones;
	}

}
