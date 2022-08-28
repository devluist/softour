
const mongoose = require('mongoose'),
	{Schema} = mongoose,
	ObjectId = Schema.ObjectId;


const AtributosCategoriaAlojamiento = Schema ({
	nombre: {type: String, required: true},  // Si es Habitacion (por lo gral de hotel): suite, sencilla, etc --- Si es completo: Aparatamento, Casa, Posada, etc
	alojamiento: {type: ObjectId, ref: "Alojamiento", required: true },
	descripcion: String,
	precio_unitario_producto: {type: Number, default: 0},
	imagenes: {type: [ObjectId], ref: "Imagen"},
	imagen_portada: {type: ObjectId, ref: "Imagen"},
	cantidad_habitaciones: {type: Number, default: 1},
	cantidad_baños: {type: Number, default: 0},
	metros_cuadrados: {type: Number, default: 0},
	servicios_incluidos: [String],
	servicios_extras: {
		type: [{
			nombre: {type: String},
			precio_unitario_servicio: {type: Number, default: 0}
		}]
	}
}, {collection: "categoria_alojamientos"});



AtributosCategoriaAlojamiento.index({nombre:1, alojamiento:1}, {unique:true});
AtributosCategoriaAlojamiento.index({ "geo_ubicacion": "2dsphere" });


class CategoriaAlojamiento {

	static agregar(datos, cb) {
		let instancia_CategoriaAlojamiento = new this(datos);

		instancia_CategoriaAlojamiento.save(instancia_CategoriaAlojamiento, (error, creado) => {
			if(error) return cb(error);

			return cb(null, creado);
		});
	}

	static buscar(parametros, cb) {
		this.findOne(parametros.consulta)
			.select(parametros.filtro)
			.populate("alojamiento")
			.populate({path: "imagen_portada", select: "url" })
			.exec((error, buscado) => {
			if(error) return cb(error);

			return cb(null, buscado);
		})
	}

	static editar(consulta, datos, cb) {
		this.findOneAndUpdate({"nombre": consulta.nombre, "alojamiento": consulta.alojamiento}, datos, {new: true}, (error, modificado) => {
			if(error) return cb(error);

			return cb(null, modificado);
		})
	}

	static eliminar(id, cb) {
		this.findOneAndRemove({"_id": id}, (error, eliminado) => {
			if(error) return cb(error);

			return cb(null, eliminado);
		})
	}

	static listado(parametros, cb) {
		this.find(parametros.consulta)
			.select(parametros.filtro)
			.limit(parametros.cant_resultados)
			.exec((error, lista) => {
			if(error) return cb(error);

			return cb(null, lista);
		})
	}
}


AtributosCategoriaAlojamiento.loadClass(CategoriaAlojamiento);


module.exports = mongoose.model('CategoriaAlojamiento', AtributosCategoriaAlojamiento);  
