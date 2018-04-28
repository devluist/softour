
const RespuestaGeneral = require('./lib/respuesta/general');


module.exports = class ControladorGeneral {

	constructor() {
		this._respuesta = new RespuestaGeneral();
	}

	pagina_inicio(req, res, next) {
		if (req.isAuthenticated())
			res.locals.datos = {"value": {"usuario_sesionado": req.session.passport.user}};
		this._respuesta.para_pagina_inicio(req, res);
	}

	pagina_nosotros(req, res, next) {
		if (req.isAuthenticated())
			res.locals.datos = {"value": {"usuario_sesionado": req.session.passport.user}};
		this._respuesta.para_pagina_nosotros(req, res);
	}


}
