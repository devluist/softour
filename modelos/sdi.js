
const mongoose = require('mongoose'),
	{Schema} = mongoose,
	ObjectId = Schema.ObjectId;



// SDI ==============================

const AtributosSDI = Schema ({
	nombre: { type: String, required: true },
	fecha_creacion: { type: Date, default: new Date().toISOString() },
	url: { type: String, unique: true, required: true },

	geo_ubicacion: {type: {}},
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
	pagina_web: String,
	correo: String,
	imagenes: {type: [ObjectId], ref: "Imagen"},
	imagen_portada: {type: ObjectId, ref: "Imagen"},
	calificaciones: {type: [ObjectId], ref: "Calificacion"},
	promedio_calificaciones: {type: Number, min:0, max:10, default: 0},
	suma_calificaciones: {type: Number, default: 0},
	total_calificaciones: {type: Number, default: 0}
});


AtributosSDI.index({ "geo_ubicacion": "2dsphere" });

AtributosSDI.index({
		"nombre": 'text',
		"etiquetas": 'text',
		"descripcion": 'text',
		"tipo_sdi_alojamiento": 'text',
		"tipo_habitaciones_disponibles": 'text',
		"promedio_calificaciones": 1,
		"__t": 1
	 }, {
		weights: {
			nombre: 10,
			promedio_calificaciones: 10,
			etiquetas: 8,
			tipo_sdi_alojamiento: 5
		},
		name: "busca_sdis",
		default_language: "spanish"
});




class SDI {

	get tipo_sdi() {
		return this.__t;
	}

	static agregar(parametros, cb) {
		let instanciaSDI = new this(parametros);

		instanciaSDI.save(instanciaSDI, (error, creado) => {
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


	static editar(parametros, cb) {
		this.findOneAndUpdate({"url": parametros.url}, parametros, {new: true}, (error, modificado) => {
			if(error) return cb(error);

			return cb(null, modificado);
		})
	}

	static eliminar(consulta, cb) {
		this.findOneAndRemove(consulta, (error, eliminado) => {
			if(error) return cb(error);

			return cb(null, eliminado);
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

	static listado_mapa(parametros, cb) {
		this.find(parametros)
			.where("geo_ubicacion")
			.near({center: parametros.coord, maxDistance: parametros.dist, spherical: true})
			.limit(parametros.cant_resultados)
			.populate("prestador_servicio")
			.exec((error, lista) => {
			if(error) return cb(error);

			return cb(null, lista);
		})
	}

}

AtributosSDI.loadClass(SDI);




// HOSPEDAJE ==============================

const AtributosAlojamiento = new Schema ({
	prestador_servicio: {type: ObjectId, ref: "PrestadorServicio", required: true },
	aprobado: {type:Boolean, default: false},
	total_habitaciones: Number,
	distincion: Number,
	tipo_sdi_alojamiento: String /* posada, hotel, hostal */
});

// GASTRONOMIA ==============================

const AtributosGastronomia  = new Schema ({
	prestador_servicio: {type: ObjectId, ref: "PrestadorServicio", required: true },
	aprobado: {type:Boolean, default: false},
	horario: String,
	tipo_sdi_gastronomico: String  /*  restaurant, puesto comida rapida,... */
});



// ==============================
// HERENCIA ==============================
// ==============================

let sdi = mongoose.model('SDI', AtributosSDI);  
sdi.discriminator('Alojamiento', AtributosAlojamiento);
sdi.discriminator('Gastronomia', AtributosGastronomia);



// ==============================
// EXPORTAR ==============================
// ==============================

module.exports = {
	"SDI": sdi,
	"Alojamiento": mongoose.model('Alojamiento'),
	"Gastronomia": mongoose.model('Gastronomia')
}
