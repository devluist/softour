
const Respuesta = require('./');


module.exports = class RespuestaCalificaciones extends Respuesta {

	para_agregar_POST(req, res) {
		this._enviar(req, res, 201, "/calificacion/" + res.locals.datos);
	}

	para_calificaciones_de_una_entidad(req, res){
		this._enviar(req, res, 200, "calificacion/listado");
	}

	para_usuario_ha_votado(req, res){
		this._enviar(req, res, 200, "calificacion/visualizar");
	}

}
