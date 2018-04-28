
const { Router } = require('express'),
	ControladorSDI = require('../../sdis'),
	Autenticar = require('../autenticacion'),
	Autorizar = require('../autorizacion');


module.exports = class RutasSDI {

	constructor(){
		this._manejador_peticiones = Router();
		this._Autorizar =  new Autorizar();
		this._Autenticar =  new Autenticar();
		this._ctrlSDI = new ControladorSDI();
	}


	urls() {

		this._manejador_peticiones.all('*', (req, res, next) => this._Autorizar.sin_acceso_API(req, next));

		this._manejador_peticiones.get('/:tipo_entidad/agregar',
			(req, res, next) => this._Autorizar.a_usuarios(["PrestadorServicio", "Administrador"], req, next),
			(req, res, next) => this._ctrlSDI.agregar_GET(req, res, next)
		);
		this._manejador_peticiones.post('/:tipo_entidad/agregar',
			(req, res, next) => this._Autorizar.a_usuarios(["PrestadorServicio", "Administrador"], req, next),
			(req, res, next) => this._ctrlSDI.agregar_POST(req, res, next)
		);


		this._manejador_peticiones.get('/:tipo_entidad/listado',
			(req, res, next) => this._Autorizar.a_usuarios(["PrestadorServicio", "Administrador"], req, next),
			(req, res, next) => this._ctrlSDI.listado(req, res, next)
		);


		this._manejador_peticiones.get('/:tipo_entidad/:entidad/editar',
			(req, res, next) => this._Autorizar.como_admin_o_para_recurso_propio(req, next),
			(req, res, next) => this._ctrlSDI.editar_GET(req, res, next)
		);
		this._manejador_peticiones.post('/:tipo_entidad/:entidad/editar',
			(req, res, next) => this._Autorizar.como_admin_o_para_recurso_propio(req, next),
			(req, res, next) => this._ctrlSDI.editar(req, res, next)
		);


		this._manejador_peticiones.get('/:tipo_entidad/:entidad/eliminar',
			(req, res, next) => this._Autorizar.como_admin_o_para_recurso_propio(req, next),
			(req, res, next) => this._ctrlSDI.eliminar_GET(req, res, next)
		);
		this._manejador_peticiones.post('/:tipo_entidad/:entidad/eliminar',
			(req, res, next) => this._Autorizar.como_admin_o_para_recurso_propio(req, next),
			(req, res, next) => this._ctrlSDI.eliminar(req, res, next)
		);


		this._manejador_peticiones.get('/:tipo_entidad/:entidad',
			(req, res, next) => this._ctrlSDI.visualizar(req, res, next)
		);
		this._manejador_peticiones.get('/:tipo_entidad/:entidad/:categoria',
			(req, res, next) => this._ctrlSDI.visualizar_producto(req, res, next)
		);

		return this._manejador_peticiones;
	}


	urls_api() {

		this._manejador_peticiones.post('/:tipo_entidad/agregar',
			(req, res, next) => this._Autenticar.usuario(req, next),
			(req, res, next) => this._Autorizar.a_usuarios(["PrestadorServicio", "Administrador"], req, next),
			(req, res, next) => this._ctrlSDI.agregar_POST(req, res, next)
		);


		this._manejador_peticiones.get('/:tipo_entidad/listado',
			(req, res, next) => this._Autenticar.usuario(req, next),
			(req, res, next) => this._Autorizar.a_usuarios(["PrestadorServicio", "Administrador"], req, next),
			(req, res, next) => this._ctrlSDI.listado(req, res, next)
		);


		this._manejador_peticiones.get('/:tipo_entidad/:entidad',
			(req, res, next) => this._ctrlSDI.visualizar(req, res, next)
		);


		this._manejador_peticiones.put('/:tipo_entidad/:entidad/editar',
			(req, res, next) => this._Autenticar.usuario(req, next),
			(req, res, next) => this._Autorizar.como_admin_o_para_recurso_propio(req, next),
			(req, res, next) => this._ctrlSDI.editar(req, res, next)
		);


		this._manejador_peticiones.delete('/:tipo_entidad/:entidad/eliminar', 
			(req, res, next) => this._Autenticar.usuario(req, next),
			(req, res, next) => this._Autorizar.como_admin_o_para_recurso_propio(req, next),
			(req, res, next) => this._ctrlSDI.eliminar(req, res, next)
		);


		this._manejador_peticiones.get('/:tipo_entidad/:entidad/:respuesta',
			(req, res, next) => this._ctrlSDI.responder_solicitud(req, res, next)
		);



		return this._manejador_peticiones;
	}

}
