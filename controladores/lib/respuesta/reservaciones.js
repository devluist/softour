
const Respuesta = require('./');

module.exports = class RespuestaReservacion extends Respuesta {

	para_agregar_producto_POST(req, res) {
		let estatus, ruta, data = [];

		if(res.locals.datos && res.locals.datos.error){
			res.locals.datos.error.details.forEach((error) => 
				data.push({"campo": error.path, "mensaje": error.message}));
			res.locals.datos.error = data;
			estatus = 400;
			res.locals.layout = "admin";
			ruta = "reservacion/agregar-producto";
		}
		else{
			estatus = 201;
			ruta = "/reservacion/" + res.locals.datos.value.categoria;
		}

		this._enviar(req, res, estatus, ruta);
	}

}
