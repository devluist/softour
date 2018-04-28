
const RespuestaSDI = require('./lib/respuesta/sdis'),
	ValidacionSDI = require('./lib/validacion/sdis'),
	FabricaSDI = require('./lib/fabricaSDI'),
	{ SDI, Alojamiento, Gastronomia } = require('../modelos/sdi'),
	CategoriaAlojamiento = require('../modelos/categoria-alojamiento'),
	CategoriaGastronomia = require('../modelos/categoria-gastronomia'),
	{ NoEncontrado } = require('./lib/manejador_errores');



module.exports = class ControladorSDI {

	constructor() {
		this._respuesta = new RespuestaSDI();
		this._validar = new ValidacionSDI();
		this._fabricar = new FabricaSDI();
		this._error_NoEncontrado = NoEncontrado;
		this._SDI = SDI;
		this._Alojamiento = Alojamiento;
		this._Gastronomia = Gastronomia;
		this.Categoria_alojamiento = CategoriaAlojamiento;
		this.Categoria_gastronomia = CategoriaGastronomia;
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

				this._SDI.buscar({"url": res.locals.datos.value.url}, (error, sdi) => {
					if (sdi) {
						res.locals.datos.error = { "details": [ {
							"path": "nombre",
							"message": 'Ya existe un lugar con este nombre.' 
						} ] };
						res.locals.datos.value.usuario_sesionado = req.session.passport.user;
						this._respuesta.para_agregar_POST(req, res);
					}

					else {
						let sdi = this._fabricar.sdiTipo(res.locals.datos.value.tipo_sdi);
						if(req.session.passport.user.tipo_usr == "Administrador" &&  res.locals.datos.value.tipo_sdi != "")
							res.locals.datos.value.aprobado = true;

						sdi.agregar(res.locals.datos.value, (error, creado) => {
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
		let tipo_entidad = req.params.tipo_entidad == "lugar" ? "" : req.params.tipo_entidad.substring(0,1).toUpperCase()+req.params.tipo_entidad.substring(1),
			parametros = {"url": req.params.entidad.toLowerCase()};

		if(tipo_entidad)
			parametros.aprobado = true;

		let sdi = this._fabricar.sdiTipo(tipo_entidad);
		sdi.buscar_visualizar(parametros, (error, buscado) => {
			/* xDEPURAR: NO DEBE HABER OTRO BUSCAR*/
			if(error) {
				res.locals.datos = {"error": error};
				if (req.isAuthenticated())
					res.locals.datos.value.usuario_sesionado = req.session.passport.user;
				this._respuesta.para_visualizar(req, res);
			}
			if(!buscado) return next(new this._error_NoEncontrado());

			if(buscado.__t){
				this["Categoria_"+req.params.tipo_entidad].find({[req.params.tipo_entidad]: buscado._id}, (error, lista_categorias) => {
					if(error) {
						res.locals.datos = {"error": error};
						if (req.isAuthenticated())
							res.locals.datos.value.usuario_sesionado = req.session.passport.user;
						this._respuesta.para_visualizar_producto(req, res);
					}

					res.locals.datos = {
						"value": buscado,
						"lista_categorias": lista_categorias
					};

					if (req.isAuthenticated())
						res.locals.datos.value.usuario_sesionado = req.session.passport.user;
					this._respuesta.para_visualizar(req, res);
				});
			}
			else {
				res.locals.datos = { "value": buscado };

				if (req.isAuthenticated())
					res.locals.datos.value.usuario_sesionado = req.session.passport.user;
				this._respuesta.para_visualizar(req, res);
			}
		})
	}

	visualizar_producto(req, res, next) {
		let tipo_entidad = req.params.tipo_entidad.substring(0,1).toUpperCase()+req.params.tipo_entidad.substring(1);

		let sdi = this._fabricar.sdiTipo(tipo_entidad);
		sdi.buscar({"url": req.params.entidad.toLowerCase(), "aprobado": true}, (error, instancia) => {
			if(error) {
				res.locals.datos = {"error": error};
				if (req.isAuthenticated())
					res.locals.datos.value.usuario_sesionado = req.session.passport.user;
				this._respuesta.para_visualizar_producto(req, res);
			}
			if(!instancia) return next(new this._error_NoEncontrado());

			this["Categoria_"+req.params.tipo_entidad].buscar({"consulta": {"nombre": req.params.categoria, [req.params.tipo_entidad]: instancia._id}}, (error, buscado) => {
				if(error) {
					res.locals.datos = {"error": error};
					if (req.isAuthenticated())
						res.locals.datos.value.usuario_sesionado = req.session.passport.user;
					this._respuesta.para_visualizar_producto(req, res);
				}
				if(!buscado) return next(new this._error_NoEncontrado());

				res.locals.datos = {"value": buscado};
				if (req.isAuthenticated())
					res.locals.datos.value.usuario_sesionado = req.session.passport.user;
				this._respuesta.para_visualizar_producto(req, res);
			})
		})
	}

	listado(req, res, next) {
		let query = {},
			tipo_entidad = req.params.tipo_entidad == "lugar" ? "" : req.params.tipo_entidad.substring(0,1).toUpperCase()+req.params.tipo_entidad.substring(1);

		if(req.session.passport.user.tipo_usr == "PrestadorServicio" && req.params.tipo_entidad != "lugar")
			query.prestador_servicio = req.session.passport.user.id;

        if(tipo_entidad)
            query.aprobado = true;
        else
            query.__t = null;
        let sdi = this._fabricar.sdiTipo(tipo_entidad);
        sdi.listado({"consulta": query}, (error, lista) => {
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
		let tipo_entidad = req.params.tipo_entidad == "lugar" ? "" : req.params.tipo_entidad.substring(0,1).toUpperCase()+req.params.tipo_entidad.substring(1);

		let sdi = this._fabricar.sdiTipo(tipo_entidad);
		sdi.buscar({"url": req.params.entidad.toLowerCase()}, (error, buscado) => {
			if(error) {
				res.locals.datos = {"error": error};
				res.locals.datos.value = {"usuario_sesionado": req.session.passport.user};
				this._respuesta.para_editar_GET(req, res);
			}

			if(!buscado) return next(new this._error_NoEncontrado());

			res.locals.datos = {"value": buscado};
			res.locals.datos.value.tipo_sdi = buscado.__t;
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
				let tipo_entidad = req.params.tipo_entidad == "lugar" ? "" : req.params.tipo_entidad.substring(0,1).toUpperCase()+req.params.tipo_entidad.substring(1);

				let sdi = this._fabricar.sdiTipo(tipo_entidad);
				sdi.buscar({"url": req.params.entidad.toLowerCase()}, (error, buscado) => {
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

					res.locals.datos.value.url = req.params.entidad.toLowerCase();
					sdi.editar(res.locals.datos.value, (error, modificado) => {
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
		let tipo_entidad = req.params.tipo_entidad == "lugar" ? "" : req.params.tipo_entidad.substring(0,1).toUpperCase()+req.params.tipo_entidad.substring(1);

		let sdi = this._fabricar.sdiTipo(tipo_entidad);
		sdi.buscar({"url": req.params.entidad.toLowerCase()}, (error, buscado) => {
			if(error) {
				res.locals.datos = {"error": error};
				this._respuesta.para_editar(req, res);
			}

			if(!buscado) return next(new this._error_NoEncontrado());

			if (req.params.respuesta == "aprobar")
				sdi.editar({"url": req.params.entidad.toLowerCase(), "aprobado": true}, (error, modificado) => {
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
				sdi.eliminar({"url": req.params.entidad.toLowerCase()}, (error, modificado) => {
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
		let tipo_entidad = req.params.tipo_entidad == "lugar" ? "" : req.params.tipo_entidad.substring(0,1).toUpperCase()+req.params.tipo_entidad.substring(1);

		let sdi = this._fabricar.sdiTipo(tipo_entidad);
		sdi.buscar({"url": req.params.entidad.toLowerCase()}, (error, buscado) => {
			if(error) {
				res.locals.datos = {"error": error};
				res.locals.datos.value = {"usuario_sesionado": req.session.passport.user};
				this._respuesta.para_eliminar_GET(req, res);
			}
			if(!buscado) return next(new this._error_NoEncontrado());

			res.locals.datos = {"value": buscado};
			res.locals.datos.value.usuario_sesionado = req.session.passport.user;
			switch(buscado.__t){
				case "Alojamiento":
					res.locals.datos.value.tipo_objeto = "el alojamiento " + buscado.nombre;
					res.locals.datos.value.mensaje_confirmacion = "¿Estás seguro de eliminarlo definitivamente?";
					break;
				case "Gastronomia":
					res.locals.datos.value.tipo_objeto = "el sitio gastronómico " + buscado.nombre;
					res.locals.datos.value.mensaje_confirmacion = "¿Estás seguro de eliminarlo definitivamente?";
					break;
				default:
					res.locals.datos.value.tipo_objeto = "el lugar "+ buscado.nombre;
					res.locals.datos.value.mensaje_confirmacion = "¿Estás seguro de eliminarlo definitivamente?";
					break;
			}
			this._respuesta.para_eliminar_GET(req, res);
		});
	}

	eliminar(req, res, next) {
		let tipo_entidad = req.params.tipo_entidad == "lugar" ? "" : req.params.tipo_entidad.substring(0,1).toUpperCase()+req.params.tipo_entidad.substring(1);

		let sdi = this._fabricar.sdiTipo(tipo_entidad);
		sdi.eliminar({"url": req.params.entidad.toLowerCase()}, (error, eliminado) => {
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
