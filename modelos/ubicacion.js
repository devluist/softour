
const mongoose = require('mongoose');

const AtributosUbicacion = new mongoose.Schema({
	pais: String,
	estado: String,
	ciudad: String,
	codigo_postal: String,
	municipio: String,
	lalo_sup_izq: [String], // latitudlongitud superior izquierda
	lalo_inf_der: [String] // latitudlongitud inferior derecha
}, {collection: "ubicaciones"});

/* uso lalo xq no lo necesito pa mongo sino pa leaflet. No puede ser unico con pais xq en vzla hay varios codigos pa distintos sitios */
AtributosUbicacion.index({codigo_postal:1});



class Ubicacion {

	static buscar(parametros, cb) {
		this.findOne(parametros.consulta)
			.exec((error, buscado) => {
				if(error) return cb(error);

				return cb(null, buscado);
			});
	}

	static listado(parametros, cb) {
		this.find(parametros.consulta)
			.limit(parametros.limite)
			.exec((error, buscado) => {
				if(error) return cb(error);

				return cb(null, buscado);
			});
	}

}


const atributos_ubicacion = AtributosUbicacion;
atributos_ubicacion.loadClass(Ubicacion);

module.exports = mongoose.model('Ubicacion', atributos_ubicacion);
