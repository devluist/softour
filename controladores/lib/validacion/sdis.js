
const  JOI = require('joi'),
	async = require('async'),
	Validacion = require('./');


module.exports = class ValidacionSDI extends Validacion {

	constructor(){
		super();

		// ESQUEMA BASE para joi del formulario de sdi
		this._esquema_editar_sdi = JOI.object().keys({
			tipo_sdi: JOI.string().valid("", "Alojamiento", "Gastronomia"),

			lat: JOI.number().empty(""),
				lng: JOI.number().empty(""),
			pais: JOI.string().required(),
				estado: JOI.string().required(),
				ciudad: JOI.string().required(),
				direccion: JOI.string().required(),
				codigo_postal: JOI.string().required(),

			telefono: JOI.string().trim().empty('').default(''),
			pagina_web: JOI.string().empty(''),
			correo: JOI.string().empty(''),
			etiquetas: JOI.array().items(JOI.string().empty("")).unique().default([]),
			descripcion: JOI.string().trim().empty('').default('')
		});


		// ESQUEMAS PARA AGREGAR UN SDI  ================================



		this._esquema_sdi = this._esquema_editar_sdi.keys({
			url: JOI.string().empty(""),
			nombre: JOI.string().trim().regex(/^[a-zA-Z ñáéíóúÑÁÉÍÓÚ-]+$/).min(2).required(),
		});

		this._esquema_alojamiento = this._esquema_sdi.keys({
			prestador_servicio: JOI.string().required(),
			total_habitaciones: JOI.number().min(0).empty(''),
			distincion: JOI.number().empty(''),
			tipo_sdi_alojamiento: JOI.string().empty('')
		});

		this._esquema_gastronomia = this._esquema_sdi.keys({
			prestador_servicio: JOI.string().required(),
			tipo_sdi_gastronomico: JOI.string().empty(''),
			horario: JOI.string().empty("")
		});




		// ESQUEMAS PARA EDITAR UN SDI  ===================================

		this._esquema_editar_alojamiento = this._esquema_editar_sdi.keys({
			prestador_servicio: JOI.string().required(),
			total_habitaciones: JOI.number().empty(''),
			distincion: JOI.number().empty(''),
			tipo_sdi_alojamiento: JOI.string().empty('')
		});

		this._esquema_editar_gastronomia = this._esquema_editar_sdi.keys({
			prestador_servicio: JOI.string().required(),
			tipo_sdi_gastronomico: JOI.string().empty(''),
			horario: JOI.string().empty("")
		});

	}

	campos(datos, editar_sdi, callback){

		let esq;
		delete datos.tipo_espacio;
		delete datos.cantidad_categorias;

		if(!editar_sdi && datos.nombre)
			datos.url = this._depurar.urls(datos.nombre);

		switch (datos.tipo_sdi){
			case "":
				datos = this._depurar.etiquetas(datos, ["etiquetas"]);
				esq = editar_sdi ? this._esquema_editar_sdi : this._esquema_sdi;
				break;
			case "Alojamiento":
				datos = this._depurar.etiquetas(datos, ["etiquetas"]);
				esq = editar_sdi ? this._esquema_editar_alojamiento : this._esquema_alojamiento;
				break;
			case "Gastronomia":
				datos = this._depurar.etiquetas(datos, ["etiquetas"]);
				esq = editar_sdi ? this._esquema_editar_gastronomia : this._esquema_gastronomia;
				break;
		}

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
