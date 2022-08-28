
const mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;


const AtributosCalificacion = new Schema({
	turista: {type: ObjectId, ref: "Turista", required: true },
	puntaje: {type: Number, min:0, max:5, default: 0},
	tipo_entidad: {type: String, required:true},
	entidad: {type: String, required:true}

}, {collection: "calificaciones"});


class Calificacion {

	static agregar(datos, cb) {
		let instanciaCalificacion = new this(datos);

		instanciaCalificacion.save(instanciaCalificacion, (error, agregada) => {
			if(error) return cb(error);

			return cb(null, agregada);
		});
	}

	static existe(datos, cb) {
		this.findOne({"turista": datos.turista, "entidad": datos.entidad, "tipo_entidad": datos.tipo_entidad}, (error, buscada) => {
			if(error) return cb(error);

			return cb(null, buscada);
		})
	}

}


AtributosCalificacion.loadClass(Calificacion);


module.exports = mongoose.model('Calificacion', AtributosCalificacion);
