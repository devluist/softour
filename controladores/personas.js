
const formidable = require('formidable'),
	async = require('async'),
	passport = require('./lib/passport'),
	FabricaUsuarios = require('./lib/fabricaUsuarios'),
	RespuestaPersonas = require('./lib/respuesta/personas'),
	ValidacionPersonas = require('./lib/validacion/personas'),
	{ NoEncontrado } = require('./lib/manejador_errores'),
	{ Persona, PrestadorServicio } = require('../modelos/persona'),
	{ SDI, Alojamiento, Gastronomia } = require('../modelos/sdi'),
	Imagen = require('../modelos/imagen'),
	Experiencia = require('../modelos/experiencia'),
	Evento = require('../modelos/evento');



module.exports = class ControladorPersonas {

	constructor() {
		this._respuesta = new RespuestaPersonas();
		this._validar = new ValidacionPersonas();
		this._fabricar = new FabricaUsuarios();
		this._error_NoEncontrado = NoEncontrado;
		this._Persona = Persona;
		this._PrestadorServicio = PrestadorServicio;
		this._SDI = SDI;
		this._Alojamiento = Alojamiento;
		this._Gastronomia = Gastronomia;
		this._Experiencia = Experiencia;
		this._Evento = Evento;
		this._Imagen = Imagen;
		this._passport = passport;
	}


	sesionarme_GET(req, res, next) {

		this._respuesta.para_sesionarme_GET(req, res);
	}

	sesionarme_POST(req, res, next) {

		res.locals.datos = this._validar.campos(req.body, req.body.tipo_usr);

		if(res.locals.datos.error)
			this._respuesta.para_sesionarme_POST(req, res);

		else
			this._passport.authenticate('sesionar-usuario', { failureFlash : true},
			 (error, usuario, datos_error, next) => {
				if (error) return next(error);

				if (!usuario || datos_error){
		            res.locals.datos.error = datos_error;
					this._respuesta.para_sesionarme_POST(req, res);
				}

				else
					req.login(usuario, (error) => {
						if (error) return next(error);

						res.locals.datos = {"value": usuario};
						this._respuesta.para_sesionarme_POST(req, res);
					});
			}) (req, res, next);
	}

	cerrar_sesion(req, res, next) {

		req.logout();
		this._respuesta.para_cerrar_sesion(req, res);
	}

	registrar_cuenta_GET(req, res, next) {
		if (req.isAuthenticated())  // si es admin registra un ps..
			res.locals.datos = {
		 		"value": {
		 			"usuario_sesionado": req.session.passport.user
				}
			};

		this._respuesta.para_registrar_cuenta_GET(req, res);
	}

	registrar_cuenta_POST(req, res, next) {

		res.locals.datos = this._validar.campos(req.body, req.body.tipo_usr);

		if(res.locals.datos.error)
			this._respuesta.para_registrar_cuenta_POST(req, res);

		else
			// si SESSION es true, entonces q genere la sesion si es false entonces significa que el admin intenta registrar a un usuario Prestador Servicio y no se requiere sesionarlo
			return this._passport.authenticate('registrar-usuario', {
					failureFlash: true,
					session: res.locals.datos.value.tipo_usr == "Turista" ? true : false
				}, (error, usuario, datos_error, next) => {
				if(error) return next(error);

				if(datos_error)
					res.locals.datos.error = datos_error;
				else
					res.locals.datos = {"value": usuario};

				this._respuesta.para_registrar_cuenta_POST(req, res);
			}) (req, res, next);
	}

	perfil(req, res, next) {
		this._Persona.buscar(req.params.usuario.toLowerCase(), (error, buscado) => {
			if(error) {
				res.locals.datos.error = error;
				if (req.isAuthenticated())
					res.locals.datos.value.usuario_sesionado = req.session.passport.user;
				this._respuesta.para_perfil(req, res);
			}
			if(!buscado) return next(new this._error_NoEncontrado());

			if(buscado.tipo_usr == "PrestadorServicio")
				async.parallel({
					lista_alojamientos: (cb) => this._Alojamiento.find({"prestador_servicio": buscado.id}, cb),
					lista_gastronomia: (cb) => this._Gastronomia.find({"prestador_servicio": buscado.id}, cb),
					lista_eventos: (cb) => this._Evento.find({"prestador_servicio": buscado.id}, cb),
					lista_experiencias: (cb) => this._Experiencia.find({"prestador_servicio": buscado.id}, cb)
				 }, (error, resultados) => {
				 	if(error) {
						res.locals.datos.error = error;
						res.locals.datos.value.usuario_sesionado = req.session.passport.user;
						this._respuesta.para_perfil(req, res);
					}
				 	res.locals.datos = {
				 		"value": {
				 			"persona": buscado,
				 			"lista_alojamientos": resultados.lista_alojamientos,
				 			"lista_eventos": resultados.lista_eventos,
				 			"lista_experiencias": resultados.lista_experiencias,
				 			"lista_gastronomia": resultados.lista_gastronomia
						}
					};
					if (req.isAuthenticated())
						res.locals.datos.value.usuario_sesionado = req.session.passport.user;

					this._respuesta.para_perfil(req, res);

				})
			else if(buscado.tipo_usr == "Administrador") {
				 	res.locals.datos = {"value": { "persona": buscado } };
					if (req.isAuthenticated())
						res.locals.datos.value.usuario_sesionado = req.session.passport.user;

					this._respuesta.para_perfil(req, res);
				}
			else {
				res.locals.datos = {
					"value": { "persona": buscado }
				};
				if (req.isAuthenticated())
					res.locals.datos.value.usuario_sesionado = req.session.passport.user;

				this._respuesta.para_perfil(req, res);
			}
		})
	}

	listado(req, res, next) {
		if(req.params.tipo_usr == "prestadores-servicio")
			req.params.tipo_usr = "PrestadorServicio";
		else
			req.params.tipo_usr = "Turista";
		this._Persona.listado({"tipo_usr": req.params.tipo_usr, "cant_resultados": null}, (error, lista) => {
			if(error) {
				res.locals.datos.error = error;
				res.locals.datos.value.usuario_sesionado = req.session.passport.user;
				this._respuesta.para_listado(req, res);
			}
			res.locals.datos = {"value": lista};
			res.locals.datos.value.usuario_sesionado = req.session.passport.user;

			this._respuesta.para_listado(req, res);
		})
	}

	configurar_cuenta_GET(req, res, next) {

		this._Persona.buscar(req.params.usuario.toLowerCase(), (error, buscado) => {
			if(error) {
				res.locals.datos.error = error;
				res.locals.datos.value.usuario_sesionado = req.session.passport.user;
				this._respuesta.para_configurar_cuenta_GET(req, res);
			}
			if(!buscado) return next(new this._error_NoEncontrado());

			res.locals.datos = {"value": buscado};
			res.locals.datos.value.usuario_sesionado = req.session.passport.user;

			this._respuesta.para_configurar_cuenta_GET(req, res);
		});
	}

	configurar_cuenta(req, res, next) {

		let tipo_usr = req.body.tipo_usr || req.session.passport.user.tipo_usr;
		res.locals.datos = this._validar.campos(req.body, tipo_usr, true);

		res.locals.datos.value.usuario = req.params.usuario.toLowerCase();

		if(res.locals.datos.error){
			res.locals.datos.value.usuario_sesionado = req.session.passport.user;
			this._respuesta.para_configurar_cuenta(req, res);
		}

		else{
			let usr = this._fabricar.usuarioTipo(req.session.passport.user.tipo_usr);
			usr.configurar_cuenta(res.locals.datos.value, (error, modificado) => {
				if(error) {
					res.locals.datos.error = error;
					res.locals.datos.value.usuario_sesionado = req.session.passport.user;
					this._respuesta.para_configurar_cuenta(req, res);
				}
				if(!modificado) return next(new this._error_NoEncontrado());

				res.locals.datos = {"value": modificado};
				res.locals.datos.value.usuario_sesionado = req.session.passport.user;

				this._respuesta.para_configurar_cuenta(req, res);
			});
		}
	}

	eliminar_cuenta_GET(req, res, next) {

		this._Persona.buscar(req.params.usuario.toLowerCase(), (error, buscado) => {
			if(error) {
				res.locals.datos.error = error;
				res.locals.datos.value = {"usuario_sesionado": req.session.passport.user};
				this._respuesta.para_eliminar_cuenta_GET(req, res);
			}
			if(!buscado) return next(new this._error_NoEncontrado());

			res.locals.datos = {"value": buscado};
			res.locals.datos.value.usuario_sesionado = req.session.passport.user;

			res.locals.datos.value.tipo_objeto = "Usuario";
			res.locals.datos.value.mensaje_confirmacion = "¿Estás seguro de eliminar la cuenta para "+buscado.usuario+"?";
			this._respuesta.para_eliminar_cuenta_GET(req, res);
		});
	}

	eliminar_cuenta(req, res, next) {

		this._Persona.eliminar_cuenta(req.params.usuario.toLowerCase(), (error, eliminado) => {
			if(error) {
				res.locals.datos.error = error;
				res.locals.datos.value.usuario_sesionado = req.session.passport.user;
				this._respuesta.para_eliminar_cuenta(req, res);
			}
			if(!eliminado) return next(new this._error_NoEncontrado());

			res.locals.datos = {"value": {"usuario": "listado-prestadores-servicio"}};
			res.locals.datos.value.usuario_sesionado = req.session.passport.user;
			this._respuesta.para_eliminar_cuenta(req, res);
		});
	}

}
