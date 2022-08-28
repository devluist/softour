
const { Router } = require('express'),
	Album = require('../../album'),
	Autenticar = require('../autenticacion'),
	Autorizar = require('../autorizacion');


module.exports = class RutasAlbums {

	constructor(){
		this._manejador_peticiones = Router();
		this._Autorizar =  new Autorizar();
		this._Autenticar =  new Autenticar();
		this._Album = new Album();
	}


	urls() {

		this._manejador_peticiones.all('*', (req, res, next) => this._Autorizar.sin_acceso_API(req, next));


		this._manejador_peticiones.get('/:tipo_entidad/:entidad/subir-foto',
			(req, res, next) => this._Autorizar.usuarios_sesionados(req, next),
			(req, res, next) => this._Album.agregar_imagen_GET(req, res, next)
		);


		return this._manejador_peticiones;
	}


	urls_api() {

		this._manejador_peticiones.post('/:tipo_entidad/:entidad/subir-foto',
			(req, res, next) => this._Autorizar.usuarios_sesionados(req, next),
			(req, res, next) => this._Album.agregar_imagen_POST(req, res, next)
		);

		this._manejador_peticiones.put('/:tipo_entidad/:entidad/subir-foto',
			(req, res, next) => this._Autenticar.usuario(req, next),
			(req, res, next) => this._Album.agregar_imagen_POST(req, res, next)
		);


		this._manejador_peticiones.put('/:tipo_entidad/:entidad/establecer-foto-portada',
			(req, res, next) => this._Album.establecer_imagen_portada(req, res, next)
		);

		return this._manejador_peticiones;
	}

}
