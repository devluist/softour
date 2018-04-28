
const mongoose = require('mongoose'),
	{Schema} = mongoose,
	ObjectId = Schema.ObjectId;


const AtributosCategoriaGastronomia = Schema ({
	nombre: {type: String, required: true},  // Platillos a la venta Pasta con Ensalada Cesár
	tipo_espacio: {type: String, required: true, enum: ["Restaurante", "Bar"] },
	gastronomia: {type: ObjectId, ref: "Gastronomia", required: true },
	descripcion: String,
	tipo_cocina: String,
	precio_unitario_producto: {type: Number, default: 0},
	imagenes: {type: [ObjectId], ref: "Imagen"},
	imagen_portada: {type: ObjectId, ref: "Imagen"}
}, {collection: "categoria_gastronomia"});



AtributosCategoriaGastronomia.index({nombre:1, gastronomia:1}, {unique:true});
AtributosCategoriaGastronomia.index({ "geo_ubicacion": "2dsphere" });


class CategoriaGastronomia {

	static agregar(datos, cb) {
		let instancia_CategoriaGastronomia = new this(datos);

		instancia_CategoriaGastronomia.save(instancia_CategoriaGastronomia, (error, creado) => {
			if(error) return cb(error);

			return cb(null, creado);
		});
	}

	static buscar(parametros, cb) {
		this.findOne(parametros.consulta)
			.select(parametros.filtro)
			.populate("gastronomia")
			.populate({path: "imagen_portada", select: "url" })
			.exec((error, buscado) => {
			if(error) return cb(error);

			return cb(null, buscado);
		})
	}

	static editar(consulta, datos, cb) {
		this.findOneAndUpdate({"nombre": consulta.nombre, "gastronomia": consulta.gastronomia}, datos, {new: true}, (error, modificado) => {
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


AtributosCategoriaGastronomia.loadClass(CategoriaGastronomia);


module.exports = mongoose.model('CategoriaGastronomia', AtributosCategoriaGastronomia);  
