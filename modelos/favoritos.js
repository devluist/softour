
const mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId,
	objeto_anidado = new Schema ({
		nombre: String,
		imagen_portada: String, //url
		url: String,
		prestador_servicio: ObjectId,
		ciudad: String
	});

const AtributosFavoritos = new Schema({
	turista: {type: ObjectId, ref: "Turista", unique: true},

	lugares: {type: [objeto_anidado], default: []},
	eventos: {type: [objeto_anidado], default: []},
	experiencias: {type: [objeto_anidado], default: []},
	alojamientos: {type: [objeto_anidado], default: []},
	gastronomias: {type: [objeto_anidado], default: []}
});



class Favoritos {

	static agregar(datos, cb) {
		let instanciaFavoritos = new this(datos);

		instanciaFavoritos.save(instanciaFavoritos, (error, agregado) => {
			if(error) return cb(error);

			return cb(null, agregado);
		});
	}

	static listado(parametros, cb) {
		this.find(parametros.consulta)
			.exec((error, lista) => {
			if(error) return cb(error);

			return cb(null, lista);
		})
	}

	static contador(parametros, cb) {
		this.find(parametros.consulta)
			.count((error, cantidad) => {
			if(error) return cb(error);

			return cb(null, cantidad);
		})
	}

	static buscar(parametros, cb) {
		this.findOne(parametros.consulta)
			.exec((error, buscado) => {
			if(error) return cb(error);

			return cb(null, buscado);
		})
	}

	static eliminar(consulta, modificacion, cb) {
		this.update(consulta, modificacion, (error, buscado) => {
			if(error) return cb(error);

			return cb(null, buscado);
		})
	}

}


AtributosFavoritos.loadClass(Favoritos);


module.exports = mongoose.model('Favoritos', AtributosFavoritos);
