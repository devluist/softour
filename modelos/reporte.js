
const mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;


const AtributosReporte = new Schema({
	fecha_captura_datos: { type: Date, default: new Date().toISOString() },

	visitantes_totales: {type: Number, min:0, default: 0},
	visitantes_navegadores: {type: Number, min:0, default: 0},
	visitantes_rebotes: {type: Number, min:0, default: 0},
	turistas_registrados: {type: Number, min:0, default: 0},
	turistas_hombres: {type: Number, min:0, default: 0},
	turistas_mujeres: {type: Number, min:0, default: 0},
	ps: {type: Number, min:0, default: 0},
	publicaciones: {type: Number, min:0, default: 0},
	lugares: {type: Number, min:0, default: 0},
	eventos: {type: Number, min:0, default: 0},
	experiencias: {type: Number, min:0, default: 0},
	alojamientos: {type: Number, min:0, default: 0},
	sitios_gastronomicos: {type: Number, min:0, default: 0},

	facebook: {type: {}, default: {}},
	twitter: {type: {}, default: {}},
	google: {type: {}, default: {}},
});


class Reporte {

	static agregar(datos, cb) {
		let instanciaReporte = new this(datos);

		instanciaReporte.save(instanciaReporte, (error, agregada) => {
			if(error) return cb(error);

			return cb(null, agregada);
		});
	}

	static visualizar(cb) {
		this.find({}, (error, lista) => {
			if(error) return cb(error);

			return cb(null, lista);
		})
	}

}


AtributosReporte.loadClass(Reporte);


module.exports = mongoose.model('Reporte', AtributosReporte);
