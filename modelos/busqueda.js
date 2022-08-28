
const {SDI, Alojamiento, Gastronomia} = require('./sdi'),
	{PrestadorServicio, Turista} =  require('./persona'),
	Experiencia =  require('./experiencia'),
	Ubicacion =  require('./ubicacion'),
	Evento =  require('./evento'),
	async = require("async");


module.exports = class Busqueda {

	constructor(){
		this.Turista = Turista;
		this.PrestadorServicio = PrestadorServicio;
		this.Experiencia = Experiencia;
		this.Ubicacion = Ubicacion;
		this.SDI = SDI;
		this.Evento = Evento;
		this.Alojamiento = Alojamiento;
		this.Gastronomia = Gastronomia;
	}



	/* usando el mapa */

	en_region(parametros, cb){
		this[parametros.tipo_entidad].find(parametros.consulta)
			.where(parametros.filtros)
   			.populate(parametros.rellenar_campos)
			.exec((error, resultados) => {
				if (error) cb(error);

				else cb(null, resultados);
			});
	}

	amplia_mapa(parametros, cb){
		async.parallel({
			entidades_experiencias: (callback) => {
				this.Experiencia
					.find(parametros.consulta)
					.limit(parametros.limite)
					.populate(parametros.rellenar_campos)
		   			.exec(callback);
			 },
			entidades_eventos: (callback) => {
				this.Evento
					.find(parametros.consulta)
					.limit(parametros.limite)
					.populate(parametros.rellenar_campos)
		   			.exec(callback);
			 },
			entidades_lugares: (callback) => {
				parametros.consulta.__t = null;

				this.SDI
					.find(parametros.consulta)
					.limit(parametros.limite)
					.populate(parametros.rellenar_campos)
		   			.exec(callback);
			 },
			entidades_alojamientos: (callback) => {
				this.Alojamiento
					.find(parametros.consulta)
					.limit(parametros.limite)
					.populate(parametros.rellenar_campos)
		   			.exec(callback);
			 },
			entidades_gastronomicas: (callback) => {
				this.Gastronomia
					.find(parametros.consulta)
					.limit(parametros.limite)
					.populate(parametros.rellenar_campos)
		   			.exec(callback);
			 }
		}, (error, resultados) => {
			if (error) cb(error);

			cb(null, resultados);
		});
	}

	cerca_de(parametros, cb){
		this[parametros.tipo_entidad].find({
			    geo_ubicacion: {
			    	$nearSphere: {
			    		$geometry: {
				    		type: "Point",
				    		coordinates: parametros.coordenadas
				    	},
				    	$maxDistance: parametros.distancia_m
				    }
				},
				"aprobado": true,
				"url": {$not: {$eq: parametros.url}},
			})
			.limit(parametros.limite)
			.populate(parametros.rellenar_campos)
			.exec((error, resultados) => {
				if (error) cb(error);

				cb(null, resultados);
			});
	}



	/* usando solo texto */

	los_mejores(parametros, cb) {
		async.parallel({
			entidades_experiencias: (callback) => {
				this.Experiencia
					.find({})
					.sort(parametros.orden)
					.limit(parametros.limite)
					.populate(parametros.rellenar_campos)
		   			.exec(callback);
			 },
			entidades_eventos: (callback) => {
				this.Evento
					.find({})
					.sort(parametros.orden)
					.limit(parametros.limite)
					.populate(parametros.rellenar_campos)
					.exec(callback);
			 }
		}, (error, resultados) => {
			if (error) cb(error);

			cb(null, resultados);
		});
	}

	por_entidad(parametros, cb){
		async.parallel({
			entidades: (callback) => {
				this[parametros.tipo_entidad]
					.find(parametros.consulta)
					.where(parametros.filtros)
					.limit(parametros.limite)
		   			.skip(parametros.salto)
		   			.populate(parametros.rellenar_campos)
	   				.exec(callback);
			 },
			cantidad_resultados: (callback) => {
				this[parametros.tipo_entidad]
					.find(parametros.consulta)
					.where(parametros.filtros)
					.select("_id")
					.count(callback)
			}
		}, (error, resultados) => {
			if (error) cb(error);

			cb(null, resultados);
		});
	}

	amplia_solo_entidades(parametros, cb) { /* solicitudes ps */
		async.parallel({
			entidades_experiencias: (callback) => {
				this.Experiencia
					.find(parametros.consulta)
					.populate(parametros.rellenar_campos)
		   			.exec(callback);
			 },
			entidades_sdis: (callback) => {
				this.SDI
					.find(parametros.consulta)
		   			.populate(parametros.rellenar_campos)
		   			.exec(callback);
			 },
			entidades_eventos: (callback) => {
				this.Evento
					.find(parametros.consulta)
		   			.populate(parametros.rellenar_campos)
		   			.exec(callback);
			 }
		}, (error, resultados) => {
			if (error) cb(error);

			cb(null, resultados);
		});
	}

	amplia_solo_contadores_entidades(parametros, cb) { /* solicitudes ps */
		async.parallel({
			entidades_experiencias: (callback) => {
				this.Experiencia
					.find(parametros.consulta)
					.count(callback);
			 },
			entidades_sdis: (callback) => {
				this.SDI
					.find(parametros.consulta)
		   			.count(callback);
			 },
			entidades_eventos: (callback) => {
				this.Evento
					.find(parametros.consulta)
		   			.count(callback);
			 }
		}, (error, resultados) => {
			if (error) cb(error);

			cb(null, resultados);
		});
	}

	amplia(parametros, cb){
		async.parallel({
			entidades_experiencias: (callback) => {
				this.Experiencia
					.find(parametros.consulta)
					.limit(parametros.limite)
					.populate(parametros.rellenar_campos)
		   			.exec(callback);
			 },
			entidades_eventos: (callback) => {
				this.Evento
					.find(parametros.consulta)
		   			.limit(parametros.limite)
					.populate(parametros.rellenar_campos)
		   			.exec(callback);
			 },
			entidades_lugares: (callback) => {
				parametros.consulta.__t = null;
				this.SDI
					.find(parametros.consulta)
					.limit(parametros.limite)
					.populate(parametros.rellenar_campos)
					.exec(callback);
			 },
			entidades_alojamientos: (callback) => {
				this.Alojamiento
					.find(parametros.consulta)
					.limit(parametros.limite)
					.populate(parametros.rellenar_campos)
		   			.exec(callback);
			 },
			entidades_gastronomicas: (callback) => {
				this.Gastronomia
					.find(parametros.consulta)
					.limit(parametros.limite)
					.populate(parametros.rellenar_campos)
		   			.exec(callback);
			 },

			cantidad_resultados_experiencias: (callback) => {
				this.Experiencia
					.find(parametros.consulta)
					.select("_id")
					.count(callback);
			 },
			cantidad_resultados_eventos: (callback) => {
				this.Evento
					.find(parametros.consulta)
					.select("_id")
					.count(callback);
			 },
			cantidad_resultados_lugares: (callback) => {
				parametros.consulta.__t = null;
				this.SDI
					.find(parametros.consulta)
					.select("_id")
					.count(callback);
			 },
			cantidad_resultados_alojamientos: (callback) => {
				this.Alojamiento
					.find(parametros.consulta)
					.select("_id")
					.count(callback);
			 },
			cantidad_resultados_gastronomicos: (callback) => {
				this.Gastronomia
					.find(parametros.consulta)
					.select("_id")
					.count(callback);
			 }
		}, (error, resultados) => {
			if (error) cb(error);

			cb(null, resultados);
		});
	}

	geocodificada(parametros, cb){
		this["Ubicacion"]
			.findOne(parametros.consulta)
   			.exec((error, resultados) => {
				if (error) cb(error);

				cb(null, resultados);
			});
	}

	sugerencias(parametros, cb){
		this[parametros.tipo_entidad]
			.find(parametros.consulta)
			.select(parametros.campos_solicitados)
			.limit(parametros.limite)
			.populate(parametros.rellenar_campos)
			.exec((error, resultados) => {
				if (error) cb(error);
				cb(null, resultados);
			});
	}

}
