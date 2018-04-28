
const RespuestaAlbum = require('./lib/respuesta/album'),
	ValidacionAlbum = require('./lib/validacion/album'),
	Imagen = require('../modelos/imagen'),
	Evento = require('../modelos/evento'),
	Experiencia = require('../modelos/experiencia'),
	{Persona} = require('../modelos/persona'),
	{SDI, Alojamiento, Gastronomia} = require('../modelos/sdi'),
	formidable = require('formidable'),
	{ NoEncontrado } = require('../controladores/lib/manejador_errores');



module.exports = class Album {

	constructor() {
		this._respuesta = new RespuestaAlbum();
		this._validar = new ValidacionAlbum();
		this._error_NoEncontrado = NoEncontrado;
		this._Imagen = Imagen;

		/* tipo de entidades */
		this.experiencia = Experiencia;
		this.evento = Evento;
		this.lugar = SDI; /* no se puede cambiar a sdi xq se usa como parametro de una url */
		this.alojamiento = Alojamiento;
		this.gastronomia = Gastronomia;
		this.usuario = Persona;
	}

	agregar_imagen_GET(req, res, next) {

		this[req.params.tipo_entidad].buscar({"url": req.params.entidad}, (error, entidad_buscada) => {
			if (error) return next(error);
			if(!entidad_buscada) return next(new this._error_NoEncontrado());

			res.locals.datos = {
				"value": {
					"usuario_sesionado": req.session.passport.user,
					"entidad": entidad_buscada,
					"tipo_entidad": req.params.tipo_entidad
				}
			};
			this._respuesta.para_agregar_imagen_GET(req, res);
		});
	}

	agregar_imagen_POST(req, res, next) {
		let  form = new formidable.IncomingForm();

		form.parse(req, (error, campos, lista_imagenes) => {
			if (error) return next(error);

			let tipo_entidad = req.params.tipo_entidad.toLowerCase(),
				entidad = req.params.entidad.toLowerCase();

			res.locals.datos = this._validar.archivos(lista_imagenes, tipo_entidad, entidad);

			if(res.locals.datos.error)
				this._respuesta.para_agregar_imagen_POST(req, res);

			else
				this[tipo_entidad].buscar({"url": entidad}, (error, entidad_buscada) => {
					if (error) return next(error);
					if(!entidad_buscada) return next(new this._error_NoEncontrado());

					let imgs = [];

					for(let pos = res.locals.datos.value.length - 1; pos >= 0; --pos) {
						this._Imagen.almacenar(res.locals.datos.value[pos], (error, imagen) => {
				           	if (error) return next(error);

				           	entidad_buscada.imagenes.push(imagen.id);
				           	imgs.push(imagen.url);

				           	if(pos == 0) {
				           		entidad_buscada.save();
				           		res.locals.datos = { "value": imgs };

								res.locals.datos.value.usuario_sesionado = req.session.passport.user;

				           		this._respuesta.para_agregar_imagen_POST(req, res);
				           	}
				        });
					}
				});
	    });
	}

	establecer_imagen_portada(req, res, next) {
		this[req.params.tipo_entidad].buscar({"url": req.params.entidad}, (error, entidad_buscada) => {
			if (error) return next(error);
			if(!entidad_buscada) return next(new this._error_NoEncontrado());

			if(req.params.tipo_entidad == "usuario")
				entidad_buscada.foto_perfil = req.body.imagen;
			else
				entidad_buscada.imagen_portada = req.body.imagen;
			entidad_buscada.save();

			this._respuesta.para_establecer_imagen_portada(req, res);
		});
	}

}
