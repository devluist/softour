
const Respuesta = require('./');


module.exports = class RespuestaEventos extends Respuesta {

	para_agregar_GET(req, res) {
		let estatus;
		if(res.locals.datos && res.locals.datos.error)
			estatus = 400;
		else
			estatus = 200;

		res.locals.layout = "admin";
		this._enviar(req, res, estatus, "evento/agregar");
	}

	para_agregar_POST(req, res) {
		let estatus, ruta, data = [];

		if(res.locals.datos && res.locals.datos.error){
			res.locals.datos.error.details.forEach((error) => 
				data.push({"campo": error.path, "mensaje": error.message}));
			res.locals.datos.error = data;
			estatus = 400;
			res.locals.layout = "admin";
			ruta = "evento/agregar";
		}
		else{
			estatus = 201;
			ruta = "/evento/" + res.locals.datos.value.url;
		}

		this._enviar(req, res, estatus, ruta);
	}

	para_visualizar(req, res){
		this._enviar(req, res, 200, "evento/visualizar");
	}

	para_listado(req, res){
		res.locals.layout = "admin";

		this._enviar(req, res, 200, "evento/listado");
	}

	para_editar_GET(req, res) {
		let estatus;

		if(res.locals.datos && res.locals.datos.error){
			res.locals.datos.error.details.forEach((error) => 
				res.locals.datos.error.push({"campo": error.path, "mensaje": error.message}));
			estatus = 400;
		}
		else
			estatus = 200;

		res.locals.layout = "admin";
		this._enviar(req, res, estatus, "evento/editar");
	}

	para_editar(req, res) {
		let estatus, ruta, data = [];

		if(res.locals.datos && res.locals.datos.error){
			res.locals.datos.error.details.forEach((error) => 
				data.push({"campo": error.path, "mensaje": error.message}));
			res.locals.datos.error = data;
			estatus = 400;
			res.locals.layout = "admin";
			ruta = "evento/editar";
		}
		else {
			estatus = 200;
			ruta = "/evento/" + res.locals.datos.value.url;
		}

		this._enviar(req, res, estatus, ruta);
	}

	para_eliminar_GET(req, res) {
		let estatus;

		if(res.locals.datos && res.locals.datos.error){
			res.locals.datos.error.details.forEach((error) => 
				res.locals.datos.error.push({"campo": error.path, "mensaje": error.message}));
			estatus = 400;
		}
		else
			estatus = 200;

		res.locals.layout = "admin";
		this._enviar(req, res, estatus, "evento/eliminar");
	}

	para_eliminar(req, res) {
		let estatus, ruta, data = [];

		if(res.locals.datos && res.locals.datos.error){
			res.locals.datos.error.details.forEach((error) => 
				data.push({"campo": error.path, "mensaje": error.message}));
			res.locals.datos.error = data;
			estatus = 400;
			ruta = "evento/eliminar";
		}
		else{
			estatus = 204;
			ruta = "/evento/" + res.locals.datos.value.url;
		}

		res.locals.layout = "admin";
		this._enviar(req, res, estatus, ruta);
	}

}
