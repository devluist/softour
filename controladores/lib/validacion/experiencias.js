
const  JOI = require('joi'),
	async = require('async'),
	Validacion = require('./');


module.exports = class ValidacionExperiencias extends Validacion {

	constructor(){
		super();

		// esquema para joi del formulario de experiencias
		this._esquema_editar_experiencia = JOI.object().keys({
			tipo_sdi: JOI.string().valid("Experiencia"),
			prestador_servicio: JOI.string().required(),

			sdi: JOI.string().empty(""),
			lat: JOI.number().empty(""),
				lng: JOI.number().empty(""),
			pais: JOI.string().required(),
				estado: JOI.string().required(),
				ciudad: JOI.string().required(),
				direccion: JOI.string().required(),
				codigo_postal: JOI.string().required(),

			etiquetas: JOI.array().items(JOI.string().empty("")).unique().default([]),
			descripcion: JOI.string().trim().empty('').default(''),
			telefono: JOI.string().trim().empty('').default(''),
			duracion: JOI.string().trim().empty('').default(''),
			pagina_web: JOI.string().empty('').default(''),
			correo: JOI.string().required(),
			precio: JOI.number().min(0),
			fecha_inicio: JOI.string().required(),
			fecha_fin: JOI.string().required(),
			requisitos: JOI.string().trim().empty('').default(''),
			periodicidad: JOI.string().trim().empty('').default('')
		});


		this._esquema_experiencia = this._esquema_editar_experiencia.keys({
			url: JOI.string().empty(''),
			nombre: JOI.string().trim().regex(/^[a-zA-Z ñáéíóúÑÁÉÍÓÚ-]+$/).min(2).required(),
		});
	}

	campos(datos, editar_experiencia, callback){

		let esq;
		datos = this._depurar.etiquetas(datos, ["etiquetas"]);
		delete datos.fecha_inicio_fin;

		if(!editar_experiencia && datos.nombre){
			datos.url = this._depurar.urls(datos.nombre);
			esq = this._esquema_experiencia;
		}
		else
			esq = this._esquema_editar_experiencia;

		if(datos.prestador_servicio)
			this._depurar.buscar_id(datos.prestador_servicio, "PrestadorServicio", (error, ps) => {
				if(error) callback(error);
				let error_campos = {"details":[]};

				if(!ps)
					error_campos.details.push({
						"path": "prestador de servicio",
						"message": "El usuario ingresado no existe"
					});

				if(error_campos.details.length > 0)
					return callback(null, {"value": datos, "error": error_campos});

				else {
					datos.prestador_servicio = ps;
					return callback(null, this._ejecutar(datos, esq));
				}
			})
		else
			return callback(null, this._ejecutar(datos, esq));
	}
}
