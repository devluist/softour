
const { Turista, PrestadorServicio } = require('../../modelos/persona'),
	{ SDI } = require('../../modelos/sdi'),
	Experiencia = require('../../modelos/experiencia'),
	Evento = require('../../modelos/evento'),
	Ubicacion = require('../../modelos/ubicacion');

module.exports = class DepurarDatos {

	constructor(){
		this.Turista = Turista;
		this.PrestadorServicio = PrestadorServicio;
		this.SDI = SDI;
		this.Ubicacion = Ubicacion;
		this.Evento = Evento;
		this.Experiencia = Experiencia;
	}

	urls(cadena) {
		/*
			Retorna una URL alfanumerica separada por guiones a partir de una cadena
		*/
		cadena = cadena.toLowerCase().trim().replace(/\s/g, "-").replace(/ñ/g, "n").replace(/á/g, "a").replace(/é/g, "e").replace(/í/g, "i").replace(/ó/g, "o").replace(/ú/g, "u").replace(/[^a-z|0-9|-]+/g,"");

		return cadena;
	}

	etiquetas(datos, lista_cadenas){
		for(let pos = lista_cadenas.length - 1; pos >= 0; --pos)
			datos[lista_cadenas[pos]] = datos[lista_cadenas[pos]].split(/\s*,\s*/).filter(function(val){if (val != "") return val.toLowerCase(); });
		return datos;
	}

	archivos(lista_imagenes, tipo_entidad, entidad) {
		let imgs = [],
			campos = Object.keys(lista_imagenes);

		for(let pos = campos.length - 1; pos >= 0; --pos)
			imgs.push({
				"peso": lista_imagenes[campos[pos]].size,
				"tipo_entidad": tipo_entidad,
				"entidad": entidad,
				"ruta": lista_imagenes[campos[pos]].path,
				"extension": lista_imagenes[campos[pos]].name.split(".").pop()
			});

		return imgs;
	}

	buscar_id(objeto, tipo_entidad, cb){
		let query;

		switch(tipo_entidad){
			case "Turista":
			case "PrestadorServicio":
				query = {"usuario": objeto};
				break;
			case "SDI":
			case "Experiencia":
			case "Evento":
				query = {"nombre": objeto};
				break;
			case "Ubicacion":
				query = {"ciudad": objeto};
				break;
			default:
				return "";
		}

		this[tipo_entidad].findOne(query, (error, obj) => {
			if(error) return cb(error);

			if(obj)
				return cb(null, obj.id);
			else
				return cb(null, null);
		});

	}

	buscar_id_url(objeto, tipo_entidad, cb){
		let query;

		switch(tipo_entidad){
			case "SDI":
			case "Experiencia":
			case "Evento":
				query = {"url": objeto};
				break;
			default:
				return "";
		}

		this[tipo_entidad].findOne(query, (error, obj) => {
			if(error) return cb(error);

			if(obj)
				return cb(null, obj.id);
			else
				return cb(null, null);
		});

	}

}
