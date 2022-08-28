
const mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;


const AtributosEvento = new Schema({
	url: { type: String, unique: true, required: true },
	__t: { type: String, default: "Evento"},
	nombre: {type: String, required: true},
	fecha_creacion: { type: Date, default: new Date().toISOString() },
	prestador_servicio: {type: ObjectId, ref: "PrestadorServicio", required: true },

	sdi: {type: ObjectId, ref: "SDI"},
	geo_ubicacion: { type: {}},
	ubicacion: {type: {}}, /* {
		direccion: String,
		ciudad: String  // parroquia o poblado
		estado: String
		pais: String
		codigo_postal: String
	}*/

	etiquetas: [String],
	descripcion: String,
	telefono: String,
	duracion: String,
	pagina_web: String,
	correo: String,
	precio: { type: Number, default: 0 },
	aprobado: {type:Boolean, default: false},
	fecha_inicio: Date,
	fecha_fin: Date,
	suma_calificaciones: {type: Number, default: 0},
	total_calificaciones: {type: Number, default: 0},
	promedio_calificaciones: {type: Number, min:0, max:10, default: 0},

	imagenes: {type: [ObjectId], ref: "Imagen"},
	imagen_portada: {type: ObjectId, ref: "Imagen"},
	calificaciones: {type: [ObjectId], ref: "Valoracion"}
});


AtributosEvento.index({ "geo_ubicacion": "2dsphere" });


AtributosEvento.index({
		"nombre": 'text',
		"etiquetas": 'text',
		"descripcion": 'text',
		"promedio_calificaciones": -1,
		"fecha_hora_inicio": 1
	 }, {
		weights: {
			nombre: 10,
			promedio_calificaciones: 10,
			etiquetas: 8
		},
		name: "busca_eventos",
		default_language: "spanish"
});



class Evento {

	static agregar(parametros, cb) {
		let instanciaEvento = new this(parametros);

		instanciaEvento.save(instanciaEvento, (error, creado) => {
			if(error) return cb(error);

			return cb(null, creado);
		});
	}

	static buscar(consulta, cb) {
		this.findOne(consulta)
			.populate({path: "prestador_servicio", populate: { path: 'foto_perfil', select: "url" }})
			.exec((error, buscado) => {
			if(error) return cb(error);

			return cb(null, buscado);
		})
	}

	static buscar_visualizar(consulta, cb) {
		this.findOne(consulta)
			.populate({path:"imagenes", model: "Imagen"})
			.populate("imagen_portada")
			.populate({path: "prestador_servicio", populate: { path: 'foto_perfil', select: "url" }})
			.exec((error, buscado) => {
			if(error) return cb(error);

			return cb(null, buscado);
		})
	}

	static listado(parametros, cb) {
		this.find(parametros.consulta)
			.limit(parametros.cant_resultados)
			.populate("prestador_servicio")
			.exec((error, lista) => {
			if(error) return cb(error);

			return cb(null, lista);
		})
	}

	static eliminar(consulta, cb) {
		this.findOneAndRemove(consulta, (error, eliminado) => {
			if(error) return cb(error);

			return cb(null, eliminado);
		})
	}

	static editar(parametros, cb) {
		this.findOneAndUpdate({"url": parametros.url}, parametros, {new: true}, (error, modificado) => {
			if(error) return cb(error);

			return cb(null, modificado);
		})
	}

}



const atributos_evento = AtributosEvento;
atributos_evento.loadClass(Evento);



module.exports = mongoose.model('Evento', atributos_evento);
