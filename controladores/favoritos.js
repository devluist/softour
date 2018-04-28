
const RespuestaFavoritos = require('./lib/respuesta/favoritos'),
	Evento = require('../modelos/evento'),
	Experiencia = require('../modelos/experiencia'),
	Favoritos = require('../modelos/favoritos'),
	{Turista} = require('../modelos/persona'),
	{SDI, Alojamiento, Gastronomia} = require('../modelos/sdi'),
	{ NoEncontrado } = require('./lib/manejador_errores');



module.exports = class ControladorFavoritos {

	constructor() {
		this._respuesta = new RespuestaFavoritos();
		this._error_NoEncontrado = NoEncontrado;
		this._Favoritos = Favoritos;
		this._Turista = Turista;

		/* entidades para la url */
		this.experiencia = Experiencia;
		this.evento = Evento;
		this.gastronomia = Gastronomia;
		this.alojamiento = Alojamiento;
		this.lugar = SDI;
	}

	existe(req, res, next) {
		let tipo_entidad = req.params.tipo_entidad,
			entidad = req.params.entidad;

		this[tipo_entidad].buscar({"url": entidad}, (error, entidad_buscada) => {
			if (error) return next(error);
			if(!entidad_buscada) return next(new this._error_NoEncontrado());
			let array = tipo_entidad == "lugar" ? tipo_entidad + "es._id" : tipo_entidad + "s._id";
			this._Favoritos.buscar({"consulta": {"turista": req.session.passport.user.id, [array]: entidad_buscada._id }}, (error, fav) => {
				if(error) {
					res.locals.datos = {"error": error};
					this._respuesta.para_agregar_POST(req, res);
				}
				req.ha_votado = false;

				if(fav)
					req.ha_votado = true;

				return next();
			});
		});
	}

	visualizar_agregados(req, res, next) {
		if(req.ha_votado){
			res.locals.datos = true;
		    this._respuesta.para_agregar_POST(req, res);
		}
		else{
			res.locals.datos = null;
		    this._respuesta.para_agregar_POST(req, res);
		}
	}

	agregar_POST(req, res, next) {
		let tipo_entidad = req.params.tipo_entidad,
			entidad = req.params.entidad;

		if(req.ha_votado){
			res.locals.datos = null;
		    this._respuesta.para_agregar_POST(req, res);
		}
		else
			this[tipo_entidad].buscar_visualizar({"url": entidad}, (error, entidad_buscada) => {
				if (error) return next(error);
				if(!entidad_buscada) return next(new this._error_NoEncontrado());

				this._Favoritos.buscar({"consulta":{"turista": req.session.passport.user.id}}, (error, favs) => {
					if(error) {
						res.locals.datos = {"error": error};

						this._respuesta.para_agregar_POST(req, res);
					}

					switch(tipo_entidad){
						case "alojamiento":
							favs.alojamientos.push({
								"_id": entidad_buscada._id,
								"nombre": entidad_buscada.nombre,
								"imagen_portada": entidad_buscada.imagen_portada.url,
								"url": entidad_buscada.url,
								"prestador_servicio": entidad_buscada.prestador_servicio._id,
								"ciudad": entidad_buscada.ubicacion.ciudad
							});
						break;
						case "gastronomia":
							favs.gastronomias.push({
								"_id": entidad_buscada._id,
								"nombre": entidad_buscada.nombre,
								"imagen_portada": entidad_buscada.imagen_portada.url,
								"url": entidad_buscada.url,
								"prestador_servicio": entidad_buscada.prestador_servicio._id,
								"ciudad": entidad_buscada.ubicacion.ciudad
							});
						break;
						case "experiencia":
							favs.experiencias.push({
								"_id": entidad_buscada._id,
								"nombre": entidad_buscada.nombre,
								"imagen_portada": entidad_buscada.imagen_portada.url,
								"url": entidad_buscada.url,
								"prestador_servicio": entidad_buscada.prestador_servicio._id,
								"ciudad": entidad_buscada.ubicacion.ciudad
							});
						break;
						case "evento":
							favs.eventos.push({
								"_id": entidad_buscada._id,
								"nombre": entidad_buscada.nombre,
								"imagen_portada": entidad_buscada.imagen_portada.url,
								"url": entidad_buscada.url,
								"prestador_servicio": entidad_buscada.prestador_servicio._id,
								"ciudad": entidad_buscada.ubicacion.ciudad
							});
						break;
						case "lugar":
							favs.lugares.push({
								"_id": entidad_buscada._id,
								"nombre": entidad_buscada.nombre,
								"imagen_portada": entidad_buscada.imagen_portada.url,
								"url": entidad_buscada.url,
								"prestador_servicio": null,
								"ciudad": entidad_buscada.ubicacion.ciudad
							});
						break;
					}

		           	favs.save( (error) => {
		           		if(error) return next(error);

		           		res.locals.datos = true;
		           		this._respuesta.para_agregar_POST(req, res);
		           	});

				});
			});
	}

	eliminar(req, res, next) {
		let tipo_entidad = req.params.tipo_entidad,
			entidad = req.params.entidad;

		if(!req.ha_votado){
			res.locals.datos = null;
		    this._respuesta.para_eliminar(req, res);
		}
		else
			this[tipo_entidad].buscar({"url": entidad}, (error, entidad_buscada) => {
				if (error) return next(error);
				if(!entidad_buscada) return next(new this._error_NoEncontrado());

				this._Favoritos.buscar({"consulta":{"turista": req.session.passport.user.id}}, (error, favs) => {
					if(error) {
						res.locals.datos = {"error": error};

						this._respuesta.para_eliminar(req, res);
					}

					switch(tipo_entidad){
						case "alojamiento":
							favs.alojamientos.id(entidad_buscada._id).remove();
							break;
						case "gastronomia":
							favs.gastronomias.id(entidad_buscada._id).remove();
							break;
						case "experiencia":
							favs.experiencias.id(entidad_buscada._id).remove();
							break;
						case "evento":
							favs.eventos.id(entidad_buscada._id).remove();
							break;
						case "lugar":
							favs.lugares.id(entidad_buscada._id).remove();
							break;
					}

					favs.save((error) => {
						if(error) return next(error);

						this._respuesta.para_eliminar(req, res);
					})
				});
			});
	}

	del_turista(req, res, next) {
		this._Turista.buscar(req.params.usuario, (error, turista) => {
			if(error) {
				res.locals.datos = {"error": error};

				this._respuesta.para_favoritos_del_turista(req, res);
			}
			if(!turista) return next(new this._error_NoEncontrado);

			this._Favoritos.buscar({"consulta":{"turista": turista._id}}, (error, favs) => {
				if(error) {
					res.locals.datos = {"error": error};

					this._respuesta.para_favoritos_del_turista(req, res);
				}
				if(!favs) return next(new this._error_NoEncontrado);

	       		res.locals.datos = favs;
	       		this._respuesta.para_favoritos_del_turista(req, res);
			});
		});
	}

	vinculados_a_entidad(req, res, next) {
		this[req.params.tipo_entidad].buscar({"url": req.params.entidad}, (error, entidad) => {
			if (error) return next(error);
			if(!entidad) return next(new this._error_NoEncontrado());

			this._Favoritos.contador({consulta: {[req.params.tipo_entidad+"s.url"]: entidad.url }}, (error, cant) => {
				if(error) {
					res.locals.datos = {"error": error};

					this._respuesta.para_vinculados_a_entidad(req, res);
				}

	       		res.locals.datos = {"value": cant ? cant : 0};
	       		this._respuesta.para_vinculados_a_entidad(req, res);
			});
		})
	}

}
