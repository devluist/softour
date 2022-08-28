

const mongoose = require('mongoose'),
	{Schema} = mongoose,
	ObjectId = Schema.ObjectId;


const AtributosReservacion = new Schema({
	turista: {type: ObjectId, ref: "Turista", required:true},
	servicios_extra_seleccionados: {type: [String]},
	precio_total_servicios_seleccionados: {type: Number, default: 0},
	precio_total: {type: Number, default: 0}
}, {collection: "reservaciones"});



AtributosReservacion.index({
		"fecha_hora_inicial": 1,
		"fecha_hora_fin": 1,
		"item": 1,
		"cliente": 1
	},{
	name: "busca_reservaciones"
});


class Reservacion {

	static agregar(datos, cb) {
		let instanciaReservacion = new this(datos);

		instanciaReservacion.save(instanciaReservacion, (error, creado) => {
			if(error) return cb(error);

			return cb(null, creado);
		});
	}

}


AtributosReservacion.loadClass(Reservacion);


module.exports = mongoose.model('Reservacion', AtributosReservacion);
