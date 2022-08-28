
const Respuesta = require('./');


module.exports = class RespuestaPersonas extends Respuesta {

	para_registrar_cuenta_GET(req, res) {
		let estatus, ruta = "usuario/turista/registrar-cuenta";
		res.locals.layout = "base-simplificado";
		if(res.locals.datos && res.locals.datos.error)
			estatus = 400;
		else
			estatus = 200;

		if (req.isAuthenticated() && req.session.passport.user.tipo_usr != "Turista"){
			ruta = "usuario/prestador_servicio/registrar-cuenta";
			res.locals.layout = "admin";
		}

		this._enviar(req, res, estatus, ruta);
	}

	para_registrar_cuenta_POST(req, res) {
		let estatus, ruta, data = [];

		if(res.locals.datos && res.locals.datos.error){
			res.locals.datos.error.details.forEach((error) => 
				data.push({"campo": error.path, "mensaje": error.message}));
			res.locals.datos.error = data;
			estatus = 400;
			if (req.isAuthenticated() && req.session.passport.user.tipo_usr != "Turista"){
				res.locals.layout = "admin";
				ruta = "usuario/prestador_servicio/registrar-cuenta";
			}
			else {
				ruta = "usuario/turista/registrar-cuenta";
				res.locals.layout = "base-simplificado";
			}
		}
		else{
			estatus = 201;
			ruta = "/usuario/" + res.locals.datos.value.usuario;
		}

		// viene por json lo paso
		if( req.header("content-type") &&  ( req.header("content-type") === "application/json" || req.header("content-type").match(/multipart\/form-data/g) ) || req.xhr )
			this._enviar(req, res, estatus, ruta);

		else {  // via web, si es turista lo logueo si es admin no
			if(!res.locals.datos.error && res.locals.datos.value.tipo_usr && res.locals.datos.value.tipo_usr == "Turista" )
				return req.login(res.locals.datos.value, (error) => {
					this._enviar(req, res, estatus, ruta);
				});
			else
				this._enviar(req, res, estatus, ruta);
		}
	}

	para_sesionarme_GET(req, res){
		res.locals.layout = "base-simplificado";
		this._enviar(req, res, 200, "usuario/sesionarme");
	}

	para_sesionarme_POST(req, res){
		let estatus, ruta, data = [];

		if(res.locals.datos && res.locals.datos.error){
			res.locals.datos.error.details.forEach((error) => 
				data.push({"campo": error.path, "mensaje": error.message}));
			res.locals.datos.error = data;
			estatus = 400;
			res.locals.layout = "base-simplificado";
			ruta = "usuario/sesionarme";
		}
		else{
			estatus = 200;
			ruta = "/usuario/" + res.locals.datos.value.usuario;
		}

		this._enviar(req, res, estatus, ruta);
	}

	para_cerrar_sesion(req, res){
		res.redirect("/")
	}

	para_perfil(req, res){
		let ruta;
		if (res.locals.datos.value.persona.tipo_usr == "Turista")
			ruta = "usuario/turista/perfil";
		else if (res.locals.datos.value.persona.tipo_usr == "PrestadorServicio"){
			if(res.locals.esSobreDatosPropios)
				ruta = "usuario/prestador_servicio/perfil";
			else
				ruta = "usuario/prestador_servicio/perfil-publico";
		}
		else if (res.locals.datos.value.persona.tipo_usr == "Administrador")
			ruta = "usuario/admin/perfil";

		if (req.isAuthenticated() && res.locals.esSobreDatosPropios && req.session.passport.user.tipo_usr != "Turista")
				res.locals.layout = "admin";
		this._enviar(req, res, 200, ruta);
	}

	para_listado(req, res){
		let ruta;
		res.locals.layout = "admin";
		if(req.params.tipo_usr == "PrestadorServicio")
			ruta = "usuario/prestador_servicio/listado";

		else
			ruta = "usuario/turista/listado";

		this._enviar(req, res, 200, ruta);
	}

	para_configurar_cuenta_GET(req, res) {
		let estatus, ruta;

		if(res.locals.datos && res.locals.datos.error){
			res.locals.datos.error.details.forEach((error) => 
				res.locals.datos.error.push({"campo": error.path, "mensaje": error.message}));
			estatus = 400;
		}
		else
			estatus = 200;

		if (res.locals.datos.value.tipo_usr == "Turista")
			ruta = "usuario/turista/configurar-cuenta";
		else if (res.locals.datos.value.tipo_usr == "PrestadorServicio"){
			res.locals.layout = "admin";
			ruta = "usuario/prestador_servicio/configurar-cuenta";
		}
		else if (res.locals.datos.value.tipo_usr == "Administrador"){
			res.locals.layout = "admin";
			ruta = "usuario/admin/configurar-cuenta";
		}

		this._enviar(req, res, estatus, ruta);
	}

	para_configurar_cuenta(req, res) {
		let estatus, ruta, data = [];

		if(res.locals.datos && res.locals.datos.error){
			res.locals.datos.error.details.forEach((error) => 
				data.push({"campo": error.path, "mensaje": error.message}));
			res.locals.datos.error = data;
			estatus = 400;
			if (res.locals.datos.value.tipo_usr == "Turista")
				ruta = "usuario/turista/configurar-cuenta";
			else if (res.locals.datos.value.tipo_usr == "PrestadorServicio"){
				ruta = "usuario/prestador_servicio/configurar-cuenta";
				res.locals.layout = "admin";
			}
			else if (res.locals.datos.value.tipo_usr == "Administrador"){
				res.locals.layout = "admin";
				ruta = "usuario/admin/configurar-cuenta";
			}
		}
		else {
			estatus = 200;
			ruta = "/usuario/" + res.locals.datos.value.usuario;
		}

		this._enviar(req, res, estatus, ruta);
	}

	para_cambiar_foto_perfil_PUT(req, res) {
		let estatus, data = [];

		if(res.locals.datos && res.locals.datos.error){
			res.locals.datos.error.details.forEach((error) => 
				data.push({"campo": error.path, "mensaje": error.message}));
			res.locals.datos.error = data;
			estatus = 400;
		}
		else
			estatus = 200;

		this._enviar(req, res, estatus, null);
	}

	para_eliminar_cuenta_GET(req, res) {
		let estatus;

		if(res.locals.datos && res.locals.datos.error){
			res.locals.datos.error.details.forEach((error) => 
				res.locals.datos.error.push({"campo": error.path, "mensaje": error.message}));
			estatus = 400;
		}
		else
			estatus = 200;

		if (req.isAuthenticated() && req.session.passport.user.tipo_usr != "Turista")
			res.locals.layout = "admin";
		this._enviar(req, res, estatus, "usuario/eliminar-cuenta");
	}

	para_eliminar_cuenta(req, res) {
		let estatus, ruta, data = [];

		if(res.locals.datos && res.locals.datos.error){
			res.locals.datos.error.details.forEach((error) => 
				data.push({"campo": error.path, "mensaje": error.message}));
			res.locals.datos.error = data;
			if (req.session.passport.user.tipo_usr != "Turista")
				res.locals.layout = "admin";
			estatus = 400;
			ruta = "usuario/eliminar-cuenta";
		}
		else{
			estatus = 204;
			ruta = "/";
		}

		this._enviar(req, res, estatus, ruta);
	}

}
