
const RespuestaEventos = require('./lib/respuesta/eventos'),
	ValidacionEventos = require('./lib/validacion/eventos'),
	Evento = require('../modelos/evento'),
	{ NoEncontrado } = require('./lib/manejador_errores');



module.exports = class ControladorEventos {

	constructor() {
		this._respuesta = new RespuestaEventos();
		this._validar = new ValidacionEventos();
		this._error_NoEncontrado = NoEncontrado;
		this._Evento = Evento;
	}

	agregar_GET(req, res, next) {
		res.locals.datos = {"value": {"usuario_sesionado": req.session.passport.user}};

		this._respuesta.para_agregar_GET(req, res);
	}

	agregar_POST(req, res, next) {
		this._validar.campos(req.body, false, (error, resultados) => {
			if(error) next(error);
			res.locals.datos = resultados;

			if (res.locals.datos.error) {
				res.locals.datos.value.usuario_sesionado = req.session.passport.user;

				this._respuesta.para_agregar_POST(req, res);
			}

			else {
				res.locals.datos.value.geo_ubicacion = {
					"type": "Point",
					"coordinates": [res.locals.datos.value.lng, res.locals.datos.value.lat]
				};
				res.locals.datos.value.ubicacion = {
					"direccion": res.locals.datos.value.direccion,
					"pais": res.locals.datos.value.pais,
					"estado": res.locals.datos.value.estado,
					"ciudad": res.locals.datos.value.ciudad,
					"codigo_postal": res.locals.datos.value.codigo_postal
				};

				this._Evento.buscar({"url": res.locals.datos.value.url}, (error, evento) => {
					if (evento) {
						res.locals.datos.error = { "details": [ {
							"path": "nombre",
							"message": 'Ya existe una evento con este nombre.' 
						} ] };
						res.locals.datos.value.usuario_sesionado = req.session.passport.user;
						this._respuesta.para_agregar_POST(req, res);
					}

					else{
						if(req.session.passport.user.tipo_usr == "Administrador")
							res.locals.datos.value.aprobado = true;

						this._Evento.agregar(res.locals.datos.value, (error, creado) => {
							if(error) {
								res.locals.datos.error = error;
								
								res.locals.datos.value.usuario_sesionado = req.session.passport.user;
								this._respuesta.para_agregar_POST(req, res);
							}

							res.locals.datos = {"value": creado};
							res.locals.datos.value.usuario_sesionado = req.session.passport.user;
							this._respuesta.para_agregar_POST(req, res);
						});
					}
				});
			}
		});
	}

	visualizar(req, res, next) {
		this._Evento.buscar_visualizar({"url": req.params.url.toLowerCase()}, (error, buscado) => {
			if(error) {
				res.locals.datos = {"error": error};
				if (req.isAuthenticated())
					res.locals.datos.value.usuario_sesionado = req.session.passport.user;
				this._respuesta.para_visualizar(req, res);
			}
			if(!buscado) return next(new this._error_NoEncontrado());

			res.locals.datos = {"value": buscado};
			if (req.isAuthenticated())
				res.locals.datos.value.usuario_sesionado = req.session.passport.user;
			this._respuesta.para_visualizar(req, res);
		})
	}

	listado(req, res, next) {
		let query = { "aprobado": true };

		if(req.session.passport.user.tipo_usr == "PrestadorServicio")
			query.prestador_servicio = req.session.passport.user.id;

		this._Evento.listado({"consulta": query}, (error, lista) => {

			if(error) {
				res.locals.datos = {"error": error};
				res.locals.datos.value = {"usuario_sesionado": req.session.passport.user};
				this._respuesta.para_listado(req, res);
			}

			res.locals.datos = {"value": lista};
			res.locals.datos.value.usuario_sesionado = req.session.passport.user;
			this._respuesta.para_listado(req, res);
		})
	}

	editar_GET(req, res, next) {
		this._Evento.buscar({"url": req.params.url.toLowerCase()}, (error, buscado) => {
			if(error) {
				res.locals.datos = {"error": error};
				res.locals.datos.value = {"usuario_sesionado": req.session.passport.user};
				this._respuesta.para_editar_GET(req, res);
			}

			if(!buscado) return next(new this._error_NoEncontrado());

			res.locals.datos = {"value": buscado};
			res.locals.datos.value.usuario_sesionado = req.session.passport.user;
			this._respuesta.para_editar_GET(req, res);
		});
	}

	editar(req, res, next) {
		this._validar.campos(req.body, true, (error, resultados) => {
			if(error) return next(error);
			res.locals.datos = resultados;

			if(res.locals.datos.error){
				res.locals.datos.value.usuario_sesionado = req.session.passport.user;
				this._respuesta.para_editar(req, res);
			}

			else {
				this._Evento.buscar({"url": req.params.url.toLowerCase()}, (error, buscado) => {
					if(error) {
						res.locals.datos = {"error": error};
						res.locals.datos.value = {"usuario_sesionado": req.session.passport.user};
						this._respuesta.para_editar(req, res);
					}

					if(!buscado) return next(new this._error_NoEncontrado());
					res.locals.datos.value.geo_ubicacion = {
						"type": "Point",
						"coordinates": [res.locals.datos.value.lng, res.locals.datos.value.lat]
					};
					res.locals.datos.value.ubicacion = {
						"direccion": res.locals.datos.value.direccion,
						"pais": res.locals.datos.value.pais,
						"estado": res.locals.datos.value.estado,
						"ciudad": res.locals.datos.value.ciudad,
						"codigo_postal": res.locals.datos.value.codigo_postal
					};

					res.locals.datos.value.url = req.params.url.toLowerCase();
					this._Evento.editar(res.locals.datos.value, (error, modificado) => {
						if(error) {
							res.locals.datos.error = error;
							res.locals.datos.value.usuario_sesionado = req.session.passport.user;
							this._respuesta.para_editar(req, res);
						}
						if(!modificado) return next(new this._error_NoEncontrado());

						res.locals.datos = {"value": modificado};
						res.locals.datos.value.usuario_sesionado = req.session.passport.user;
						this._respuesta.para_editar(req, res);
					});
				});
			}
		});
	}

	responder_solicitud(req, res, next) {  // aprobar  o denegar
		this._Evento.buscar({"url": req.params.url.toLowerCase()}, (error, buscado) => {
			if(error) {
				res.locals.datos = {"error": error};
				this._respuesta.para_editar(req, res);
			}
			if(!buscado) return next(new this._error_NoEncontrado());

			if (req.params.respuesta == "aprobar")
				this._Evento.editar({"url": req.params.url.toLowerCase(), "aprobado": true}, (error, modificado) => {
					if(error) {
						res.locals.datos.error = error;
						this._respuesta.para_editar(req, res);
					}
					if(!modificado)
						res.locals.datos = {"error": "No fue posible aprobar la solicitud."};
					else
						res.locals.datos = {"value": modificado};
					this._respuesta.para_editar(req, res);
				});
			else
				this._Evento.eliminar({"url": req.params.url.toLowerCase()}, (error, modificado) => {
					if(error) {
						res.locals.datos.error = error;
						this._respuesta.para_editar(req, res);
					}
					if(!modificado)
						res.locals.datos = {"error": "No fue posible aprobar la solicitud."};
					else
						res.locals.datos = {"value": modificado};
					this._respuesta.para_editar(req, res);
				});
		});
	}

	eliminar_GET(req, res, next) {
		this._Evento.buscar({"url": req.params.url.toLowerCase()}, (error, buscado) => {
			if(error) {
				res.locals.datos = {"error": error};
				res.locals.datos.value = {"usuario_sesionado": req.session.passport.user};
				this._respuesta.para_eliminar_GET(req, res);
			}
			if(!buscado) return next(new this._error_NoEncontrado());

			res.locals.datos = {"value": buscado};
			res.locals.datos.value.usuario_sesionado = req.session.passport.user;
			res.locals.datos.value.tipo_objeto = "el evento " + buscado.nombre;
			res.locals.datos.value.mensaje_confirmacion = "¿Estás seguro de eliminarlo definitivamente?";
			this._respuesta.para_eliminar_GET(req, res);
		});
	}

	eliminar(req, res, next) {
		this._Evento.eliminar({"url": req.params.url.toLowerCase()}, (error, eliminado) => {
			if(error) {
				res.locals.datos = {"error": error};
				res.locals.datos.value = {"usuario_sesionado": req.session.passport.user};
				this._respuesta.para_eliminar(req, res);
			}
			if(!eliminado) return next(new this._error_NoEncontrado());

			res.locals.datos = {"value": {"url": "listado"}};
			res.locals.datos.value.usuario_sesionado = req.session.passport.user;
			this._respuesta.para_eliminar(req, res);
		});
	}

}
