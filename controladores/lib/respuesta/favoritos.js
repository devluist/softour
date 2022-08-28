
const Respuesta = require('./');


module.exports = class RespuestaFavoritos extends Respuesta {


	para_agregar_POST(req, res) {
		let estatus = 403;

		if(res.locals.datos)
			estatus = 201;

		this._enviar(req, res, estatus, "");
	}

	para_eliminar(req, res) {
		let estatus = 403;

		if(res.locals.datos)
			estatus = 204;

		this._enviar(req, res, estatus, "");
	}

	para_favoritos_del_turista(req, res) {
		let estatus = 403;

		if(res.locals.datos)
			estatus = 200;

		this._enviar(req, res, estatus, "");
	}

	para_vinculados_a_entidad(req, res){
		let estatus = 403;

		if(res.locals.datos)
			estatus = 200;

		this._enviar(req, res, estatus, "");
	}

}
