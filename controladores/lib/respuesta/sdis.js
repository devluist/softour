
const Respuesta = require('./');


module.exports = class RespuestaSDI extends Respuesta {

	para_agregar_GET(req, res) {
		let estatus;
		if(res.locals.datos && res.locals.datos.error)
			estatus = 400;
		else
			estatus = 200;

		res.locals.layout = "admin";
		this._enviar(req, res, estatus, "sdi/"+req.params.tipo_entidad+"/agregar");
	}

	para_agregar_POST(req, res) {
		let estatus, ruta, data = [];

		if(res.locals.datos && res.locals.datos.error){
			res.locals.datos.error.details.forEach((error) => 
				data.push({"campo": error.path, "mensaje": error.message}));
			res.locals.datos.error = data;
			estatus = 400;
			res.locals.layout = "admin";
			ruta = "sdi/"+req.params.tipo_entidad+"/agregar";
		}
		else{
			estatus = 201;
			ruta = "/"+req.params.tipo_entidad+"/" + res.locals.datos.value.url;
		}

		this._enviar(req, res, estatus, ruta);
	}

	para_visualizar(req, res){
		this._enviar(req, res, 200, "sdi/"+req.params.tipo_entidad+"/visualizar");
	}

	para_visualizar_producto(req, res){
		this._enviar(req, res, 200, "sdi/"+req.params.tipo_entidad+"/visualizar-producto");
	}

	para_listado(req, res){
		res.locals.layout = "admin";
		this._enviar(req, res, 200, "sdi/"+req.params.tipo_entidad+"/listado");
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
		this._enviar(req, res, estatus, "sdi/"+req.params.tipo_entidad+"/editar");
	}

	para_editar(req, res) {
		let estatus, ruta, data = [];

		if(res.locals.datos && res.locals.datos.error){
			res.locals.datos.error.details.forEach((error) => 
				data.push({"campo": error.path, "mensaje": error.message}));
			res.locals.datos.error = data;
			estatus = 400;
			res.locals.layout = "admin";
			ruta = "sdi/"+req.params.tipo_entidad+"/editar";
		}
		else {
			estatus = 200;
			ruta = "/"+req.params.tipo_entidad+"/" + res.locals.datos.value.url;
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
		this._enviar(req, res, estatus, "sdi/eliminar");
	}

	para_eliminar(req, res) {
		let estatus, ruta, data = [];

		if(res.locals.datos && res.locals.datos.error){
			res.locals.datos.error.details.forEach((error) => 
				data.push({"campo": error.path, "mensaje": error.message}));
			res.locals.datos.error = data;
			estatus = 400;
			ruta = "sdi/eliminar";
		}
		else{
			estatus = 204;
			ruta = "/"+req.params.tipo_entidad+"/" + res.locals.datos.value.url;
		}

		res.locals.layout = "admin";
		this._enviar(req, res, estatus, ruta);
	}

}
