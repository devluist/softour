
const Respuesta = require('./');


module.exports = class RespuestaGeneral extends Respuesta {

	para_pagina_inicio(req, res) {
		this._enviar(req, res, 200, "inicio");
	}

	para_pagina_nosotros(req, res) {
		this._enviar(req, res, 200, "nosotros");
	}

}