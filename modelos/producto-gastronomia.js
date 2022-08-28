
const mongoose = require('mongoose'),
	{Schema} = mongoose,
	ObjectId = Schema.ObjectId;



// ProductoGastronomico ==============================

const AtributosProductoGastronomico = Schema ({
	categoria: {type: ObjectId, ref: "CategoriaGastronomia", required: true },  // Platillos a la venta. ejm: Pasta con Ensalada Cesár
	reservaciones: { type: [{}] },  /* contiene un array de objetos con los siguiente atributos:
		fecha_hora_ingreso: {type: String},  solo date con toJSON, no time
		fecha_hora_salida: {type: String},   solo date con toJSON, no time
		informacion: {type: ObjectId, ref: "Reservacion"}
	*/
}, {collection: "productos_gastronomia"});


AtributosProductoGastronomico.index({
		"reservaciones.fecha_hora_ingreso": 1,
		"reservaciones.fecha_hora_salida": 1
	 }, {
		weights: {
			precio_unitario_producto: 10,
		},
		name: "busca_producto_alojamiento",
		default_language: "spanish"
});


class ProductoGastronomico {

	static ingresar(datos, cb) {
		this.insertMany(datos, (error, creado) => {
			if(error) return cb(error);

			return cb(null, creado);
		});
	}

	static buscar(parametros, cb) {
		this.findOne(parametros.consulta)
			.select(parametros.filtro)
			.populate("categoria")
			.populate({path: "imagen_portada", select: "url" })
			.exec((error, buscado) => {
			if(error) return cb(error);

			return cb(null, buscado);
		})
	}

	static modificar(datos, cb) {
		this.findOneAndUpdate({"_id": datos.id}, datos, (error, modificado) => {
			if(error) return cb(error);

			return cb(null, modificado);
		})
	}

	static modificarTodos(datos, cb) {
		this.updateMany({"categoria": datos.categoria}, datos, (error, modificados) => {
			if(error) return cb(error);

			return cb(null, modificados);
		})
	}

	static eliminar(id, cb) {
		this.findOneAndRemove({"_id": id}, (error, eliminado) => {
			if(error) return cb(error);

			return cb(null, eliminado);
		});
	}

	static eliminarTodos(datos, cb) {
		this.deleteMany({"categoria": datos.categoria}, datos, (error, modificados) => {
			if(error) return cb(error);

			return cb(null, modificados);
		});
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

	static buscar_disponibles(parametros, cb){
		this.find(parametros.consulta)
			.select(parametros.filtro)
			.populate("categoria")
			.populate({path: "imagen_portada", select: "url" })
			.exec((error, buscado) => {
			if(error) return cb(error);

			return cb(null, buscado);
		})
	}

	static agregar_reservacion(datos, cb) {
		this.findOne({"categoria": datos.categoria}, (error, buscado) => {
			if(error) return cb(error);

			delete datos.categoria;
			delete datos.turista;
			buscado.reservaciones.push(datos);
			buscado.save((error, reservado) => {
				if(error) return cb(error);

				return cb(null, reservado);
			});
		})
	}

}

AtributosProductoGastronomico.loadClass(ProductoGastronomico);


module.exports = mongoose.model('ProductoGastronomico', AtributosProductoGastronomico);  
