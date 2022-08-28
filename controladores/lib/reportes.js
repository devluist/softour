
const { Persona, Turista, PrestadorServicio, Administrador } = require('../../modelos/persona'),
	{ SDI, Alojamiento, Gastronomia } = require('../../modelos/sdi'),
	{ UsuarioNoAutorizado } = require('./manejador_errores'),
	Evento = require('../../modelos/evento'),
	Experiencia = require('../../modelos/experiencia'),
	Imagen = require('../../modelos/imagen'),
	Calificacion = require('../../modelos/calificacion');


module.exports = class ControladorReportes {

	constructor(){ 
		this._error_UsuarioNoAutorizado = UsuarioNoAutorizado;
		this.Persona = Persona;
		this.Turista = Turista;

		/* lista de entidades */
		this.lugar = SDI;  /* no se puede cambiar a sdi xq se usa como parametro de una url */
		this.alojamiento = Alojamiento;
		this.gastronomia = Gastronomia;
		this.experiencia = Experiencia;
		this.evento = Evento;
		this.calificacion = Calificacion;
	}


	usuarios_registrados(req, res, next) {
		this.Persona.listado({"tipo_usr": req.query.tipo_usr, "sexo": req.query.sexo, "fecha_registro": {$gte: req.query.desde}}, (error, lista) => {
			if (error) return next(error);

			res.locals.datos = {"value": lista.length};
			this._respuesta.para_usuarios_registrados(req, res);
		})
	}

	entidad_especifica(req, res, next) {
		this[req.params.tipo_entidad].contador((error, cantidad) => {
			if (error) return next(error);
			if(!entidad) return next(new this._error_NoEncontrado());

			if(error) {
				res.locals.datos = {"error": error};

				this._respuesta.para_entidad_especifica(req, res);
			}
		})
	}

	global_entidades(req, res, next) {
		async.parallel({
			lista_alojamientos: (cb) => this.lugar.count({"__t":null, "fecha_creacion": req.query.desde}, cb),
			lista_alojamientos: (cb) => this.alojamiento.count({"fecha_creacion": req.query.desde}, cb),
			lista_gastronomia: (cb) => this.gastronomia.count({"fecha_creacion": req.query.desde}, cb),
			lista_eventos: (cb) => this.evento.count({"fecha_creacion": req.query.desde}, cb),
			lista_experiencias: (cb) => this.experiencia.count({"fecha_creacion": req.query.desde}, cb)
		 }, (error, resultados) => {
		 	if(error) {
				res.locals.datos.error = error;
				res.locals.datos.value.usuario_sesionado = req.session.passport.user;
				this._respuesta.para_reportes_global_entidades(req, res);
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

			this._respuesta.para_reportes_global_entidades(req, res);

		})
	}


}
