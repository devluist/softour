
const mongoose = require('mongoose'),
	{Schema} = mongoose,
	ObjectId = Schema.ObjectId;



// ProductoAlojamiento ==============================

const AtributosProductoAlojamiento = Schema ({
	sku: {type: String},  /*
		HOTEL: inventario/hotel-minerva/SNC-001   snc=sencilla
		APARTAMENTO: inventario/posada-dona-pancha/APTO
	*/
	tipo_espacio: {type: String, required: true, enum: ["Completo", "Habitación"] },  // se usa aqui pa optimizar busq
	categoria: {type: ObjectId, ref: "CategoriaAlojamiento", required: true },  // Si es Habitacion (por lo gral de hotel): suite, sencilla, etc --- Si es completo: Apartamento, Casa, Posada, etc
	cantidad_camas: {type: Number, default: 1, required: true},
	limite_ocupantes: Number,
	reservaciones: { type: [{}] },  /* contiene un array de objetos con los siguiente atributos:
		fecha_hora_ingreso: {type: String},  solo date con toJSON, no time
		fecha_hora_salida: {type: String},   solo date con toJSON, no time
		informacion: {type: ObjectId, ref: "Reservacion"}
	*/
	producto_inhabilitado: {type: Boolean, default: false}  // permite eliminar de forma gradual.. no aceptar nuevas reservaciones o inhabilitar una habitacion por reparaciones
}, {collection: "productos_alojamientos"});


AtributosProductoAlojamiento.index({sku:1,categoria:1}, {unique:true});
AtributosProductoAlojamiento.index({reservaciones:1});


class ProductoAlojamiento {

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

}

AtributosProductoAlojamiento.loadClass(ProductoAlojamiento);



module.exports = mongoose.model('ProductoAlojamiento', AtributosProductoAlojamiento);  
