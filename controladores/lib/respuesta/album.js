
const Respuesta = require('./');


module.exports = class RespuestaAlbums extends Respuesta {

	para_ver_album(req, res) {
		if (req.isAuthenticated() && req.session.passport.user.tipo_usr == "PrestadorServicio")
			res.locals.layout = "admin";

		this._enviar(req, res, 200, "album/visualizar");
	}

	para_agregar_imagen_GET(req, res){
		let ruta = "album/subir-foto";

		if (req.isAuthenticated() && req.session.passport.user.tipo_usr == "PrestadorServicio")
			res.locals.layout = "admin";

		if (res.locals.datos.value.tipo_entidad == "usuario")
			ruta = "album/subir-foto-personas";

		this._enviar(req, res, 200, ruta);
	}

	para_agregar_imagen_POST(req, res) {
		let estatus, data = [];
		if(res.locals.datos && res.locals.datos.error){
			res.locals.datos.error.details.forEach((error) => 
				data.push({"campo": error.path, "mensaje": error.message}));
			res.locals.datos.error = data;
			estatus = 400;
		}
		else
			estatus = 201;

		this._enviar(req, res, estatus, "");
	}

	para_establecer_imagen_portada(req, res) {
		this._enviar(req, res, 200, "");
	}

}
