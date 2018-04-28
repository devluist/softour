
const Respuesta = require('./');


module.exports = class RespuestaReportes extends Respuesta {

	para_reportes_global_entidades(req, res) {
		this._enviar(req, res, 200, "");
	}

	para_entidad_especifica(req, res) {
		this._enviar(req, res, 200, "");
	}

	para_para_usuarios_registrados(req, res) {
		this._enviar(req, res, 200, "");
	}


}
