
const { Router } = require('express'),
	ControladorGeneral = require('../../general');


module.exports = class RutasGenerales {

	constructor(){
		this._manejador_peticiones = Router();
		this._ctrlGeneral = new ControladorGeneral();
	}


	urls() {

		this._manejador_peticiones.get('/', (req, res, next) => this._ctrlGeneral.pagina_inicio(req, res, next) );

		this._manejador_peticiones.get('/nosotros', (req, res, next) => this._ctrlGeneral.pagina_nosotros(req, res, next) );

		return this._manejador_peticiones;

	}

}
