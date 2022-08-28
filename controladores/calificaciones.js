
const RespuestaCalificaciones = require('./lib/respuesta/calificaciones'),
	ValidacionCalificaciones = require('./lib/validacion/calificaciones'),
	Calificacion = require('../modelos/calificacion'),
	Experiencia = require('../modelos/experiencia'),
	Evento = require('../modelos/evento'),
	{ SDI, Alojamiento, Gastronomia } = require('../modelos/sdi'),
	{ Turista } = require('../modelos/persona'),
	{ NoEncontrado } = require('./lib/manejador_errores');



module.exports = class ControladorCalificaciones {

	constructor() {
		this._respuesta = new RespuestaCalificaciones();
		this._validar = new ValidacionCalificaciones();
		this._error_NoEncontrado = NoEncontrado;
		this._Calificacion = Calificacion;
		this.Turista = Turista;

		/* entidades para la url */
		this.experiencia = Experiencia;
		this.evento = Evento;
		this.gastronomia = Gastronomia;
		this.alojamiento = Alojamiento;
		this.lugar = SDI;
	}

	agregar_POST(req, res, next) {
		res.locals.datos = this._validar.puntaje(req.body);

		if(res.locals.datos.error)
			this._respuesta.para_agregar_POST(req, res);

		else {

			let tipo_entidad = req.params.tipo_entidad,
				entidad = req.params.entidad;

			this[tipo_entidad].buscar({"url": entidad}, (error, entidad_buscada) => {
				if (error) return next(error);
				if(!entidad_buscada) return next(new this._error_NoEncontrado());

				this.Turista.buscar(req.session.passport.user.usuario, (error, turista) => {
					if (error) return next(error);

					res.locals.datos.value = {
						"puntaje": res.locals.datos.value.puntaje,
						"turista": turista.id,
						"entidad": entidad,
						"tipo_entidad": tipo_entidad
					};
					this._Calificacion.agregar(res.locals.datos.value, (error, agregada) => {
						if(error) {
							res.locals.datos.error = error;

							this._respuesta.para_agregar_POST(req, res);
						}

			           	entidad_buscada.calificaciones.push(agregada.id);
			           	entidad_buscada.suma_calificaciones = entidad_buscada.suma_calificaciones + agregada.puntaje;
			           	entidad_buscada.total_calificaciones = ++entidad_buscada.total_calificaciones;
			           	entidad_buscada.promedio_calificaciones = Math.round(entidad_buscada.suma_calificaciones / entidad_buscada.total_calificaciones);

						turista.calificaciones.push(agregada.id);

		           		entidad_buscada.save();
		           		turista.save();
		           		res.locals.datos = { "value": agregada };

		           		this._respuesta.para_agregar_POST(req, res);
		           	});
				});
			});
		}
	}

	usuario_ha_votado(req, res, next) {
		this._Calificacion.existe({ "turista": req.session.passport.user.id, "entidad": req.params.entidad, "tipo_entidad": req.params.tipo_entidad}, (error, buscada) => {
			if(error) {
				res.locals.datos = {"error": error};
				this._respuesta.para_usuario_ha_votado(req, res);
			}
			if(!buscada){
				res.locals.datos = {"value": ""};
				this._respuesta.para_usuario_ha_votado(req, res);
			}

			else {
				res.locals.datos = {"value": buscada.puntaje};
				this._respuesta.para_usuario_ha_votado(req, res);
			}
		});
	}

}
