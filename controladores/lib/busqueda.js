
const Busqueda = require('../../modelos/busqueda'),
	ValidacionBusquedas =  require('./validacion/busqueda'),
	RespuestaBusquedas = require('./respuesta/busqueda');


function capitalizarEntidad(palabra) {
	if(palabra.match(/lugar/)) 
		return "SDI";
	else
		return palabra.substring(0,1).toUpperCase()+palabra.substring(1);
}


module.exports = class ControladorBusquedas {

	constructor() {
		this._respuesta = new RespuestaBusquedas();
		this._busqueda = new Busqueda();
		this._validar = new ValidacionBusquedas();
		this._lista_entidades = ["Experiencia", "SDI", "Alojamiento", "Gastronomia", "PrestadorServicio", "Evento", "Ubicacion"];
		this._lista_entidades_ux = ["lugar", "lugares", "alojamiento", "alojamientos", "experiencia", "experiencias", "evento", "eventos", "gastronomia", "ubicacion"];
		this._lista_entidades_sdis = ["SDI", "Alojamiento", "Gastronomia"];
		//this.error = error;
		this._limite_resultados = 10;
		this._limite_resultados_ajax = 4;
		this._limite_resultados_busq_amplia = 3;
		this._distancia_m = 100000;
	}


	/* ======================== con mapa ========================= */

	geocodificada(req, res, next){
		if(req.hostname != "softour.tk"){
			let parametros = {
				"consulta": {"ciudad": req.query.u}
			};

			this._busqueda.geocodificada(parametros, (error, resultados)=> {
				if(error) next(error);
				if(!resultados) this._respuesta.para_buscar_nuevamente(req, res);

				else {
					if(resultados.lalo_sup_izq[0])
						req.query.coord = resultados.lalo_sup_izq[1].toString() + "," +
							resultados.lalo_sup_izq[0].toString() + ";" +

							resultados.lalo_sup_izq[1].toString() + "," +
							resultados.lalo_inf_der[0].toString() + ";" +

							resultados.lalo_inf_der[1].toString() + "," +
							resultados.lalo_inf_der[0].toString() + ";" +

							resultados.lalo_inf_der[1].toString() + "," +
							resultados.lalo_sup_izq[0].toString() + ";" +

							resultados.lalo_sup_izq[1].toString() + "," +
							resultados.lalo_sup_izq[0].toString();
					return next();
				}

			});
		}
	}

	geocodificada_middleware(req, res, next){
		if(req.hostname != "softour.tk"){
			if(req.query.u){
				let parametros = {
					"consulta": {"ciudad": req.query.u}
				};

				this._busqueda.geocodificada(parametros, (error, resultados)=> {
					if(error) next(error);
					if(!resultados){
						res.locals.datos = {"value": {"consulta": req.query.b, "destino": req.query.u} };
						this._respuesta.para_buscar_nuevamente(req, res);
					}

					else {
						res.locals.datos = [resultados.lalo_sup_izq, resultados.lalo_inf_der];
						this._respuesta.para_busqueda_geocodificada(req, res);
					}
				});
			}
		}
	}



	retornar_resultados_mapa(req, res, next) {
		let filtros = {"aprobado": true};

		if (this._lista_entcioidades_ux.indexOf(req.params.tipo_entidad) !== -1 && req.query.b) {

			if(req.query.e)
				filtros.etiquetas = req.query.e;
			if(req.params.categoria)
				filtros.categoria = req.params.categoria;
			if(req.query.premin && req.query.preciomax)
				filtros.precio = {$and: [{"precio": {$lte: req.query.preciomax}}, {"precio": {$gte: req.query.preciomin}}] };
			else if(req.query.premin)
				filtros.precio = {$gte: req.query.preciomin};
			else if(req.query.preciomax)
				filtros.precio = {$lte: req.query.preciomax};
			if(req.query.desde && req.query.hasta){
				filtros.fecha_inicio = {$gte: req.query.desde};
                filtros.fecha_fin = {$lte: req.query.hasta};
	        }

			if(req.query.coord) {
				let coord = req.query.coord.split(";");
					coord.forEach( function(x,i,a){ let d = coord[i].split(","); coord[i]= [parseFloat(d[0]), parseFloat(d[1])] });

				let	parametros = {
						"tipo_entidad": req.params.tipo_entidad,
						"consulta": req.query.b == "" ? "" : {
								"geo_ubicacion" : {
									$geoWithin : {
										$geometry : {
											type : "Polygon",
											coordinates : [[
												coord[0],
												coord[1],
												coord[2],
												coord[3],
												coord[4]
											]]
										}
									}
								},
								$text: { $search: req.query.b }
							},
						"rellenar_campos": "imagen_portada",
						"filtros": filtros
					};

				this._busqueda.en_region(parametros, (error, resultados) => {
					if(error) return next(error);

					res.json(resultados);
				});
			}

			else {
				let	parametros = {
						"rellenar_campos": "imagen_portada",
						"consulta": req.query.b != "" ? { "aprobado": true, $text: { $search: req.query.b } } : {"aprobado": true},
						"tipo_entidad": req.params.tipo_entidad,
						"filtros": filtros
					};

				this._busqueda.por_entidad(parametros, (error, resultados) => {
					if(error) return next(error);

					res.json(resultados);
				});
			}
		}

		else
			res.json({});		
	}




	/* ======================== otros ========================= */


	mejor_votados(req, res, next){
		let parametros = {
			"orden": {"promedio_calificaciones": -1},
			"rellenar_campos": "imagen_portada",
			"limite": this._limite_resultados_busq_amplia,
			"aprobado": true
		};

		this._busqueda.los_mejores(parametros, (error, resultados)=> {
			if(error) return next(error);

			res.locals.datos = resultados;
			this._respuesta.para_retornar_resultados(req, res);
		});
	}

	solicitudes_ps_GET(req, res, next){
		res.locals.datos = {
			"value": {
				"usuario_sesionado": req.session.passport.user
			}
		};
		this._respuesta.para_solicitudes_ps(req, res);
	}

	solicitudes_ps_API(req, res, next){
		let parametros = {
			"consulta": {"aprobado": false, "__t": {$exists: true}},
			"rellenar_campos": "prestador_servicio imagen_portada"
		}

		this._busqueda.amplia_solo_entidades(parametros, (error, resultados) => {
			if(error) return next(error);
			let lista_unificada = [];

			for (let i = 0; i < resultados.entidades_experiencias.length; i++) {
				lista_unificada.push(resultados.entidades_experiencias[i]);
			};
			for (let i = 0; i < resultados.entidades_sdis.length; i++) {
				lista_unificada.push(resultados.entidades_sdis[i]);
			};
			for (let i = 0; i < resultados.entidades_eventos.length; i++) {
				lista_unificada.push(resultados.entidades_eventos[i]);
			};

			res.locals.datos = {"value": lista_unificada};
			this._respuesta.para_solicitudes_ps(req, res);
		});
	}

	cantidad_solicitudes_ps_API(req, res, next){
		let parametros = {
			"consulta": {"aprobado": false, "__t": {$exists: true}}
		}

		this._busqueda.amplia_solo_contadores_entidades(parametros, (error, resultados) => {
			if(error) return next(error);

			res.locals.datos = {"value": (resultados.entidades_experiencias + resultados.entidades_sdis + resultados.entidades_eventos)};
			this._respuesta.para_solicitudes_ps(req, res);
		});
	}

	/*
		caso de uso: el usr busca solo texto (busq amplia)
		caso de uso: el usr busca texto usando coordenadas (busqueda amplia)
	*/
	resultados_sin_categoria(req, res, next){
		let parametros;

		if (req.query.b) {

			if(req.query.coord) {
				let coord = req.query.coord.split(";");
					coord.forEach( function(x,i,a){ let d = coord[i].split(","); coord[i]= [parseFloat(d[0]), parseFloat(d[1])] });

				parametros = {
						"consulta": {
								"geo_ubicacion" : {
									$geoWithin : {
										$geometry : {
											type : "Polygon",
											coordinates : [[
												coord[0],
												coord[1],
												coord[2],
												coord[3],
												coord[4]
											]]
										}
									}
								},
								$text: { $search: req.query.b },
								"aprobado": true
							},
						"consulta_cantidad": {"aprobado": true, $text: { $search: req.query.b }},
						"rellenar_campos": "imagen_portada",
						"limite": this._limite_resultados_busq_amplia
					};

				if(req.query.e)
					parametros.consulta.etiquetas = req.query.e;
				if(req.params.categoria)
					parametros.consulta.categoria = req.params.categoriacio;
				if(req.query.premin && req.query.preciomax)
					parametros.consulta.precio = {$and: [{"precio": {$lte: req.query.preciomax}}, {"precio": {$gte: req.query.preciomin}}] };
				else if(req.query.premin)
					parametros.consulta.precio = {$gte: req.query.preciomin};
				else if(req.query.preciomax)
					parametros.consulta.precio = {$lte: req.query.preciomax};
				if(req.query.desde && req.query.hasta){
					filtros.fecha_inicio = {$gte: req.query.desde};
	                filtros.fecha_fin = {$lte: req.query.hasta};
		        }

				this._busqueda.amplia_mapa(parametros, (error, resultados) => {
					if(error) return next(error);

					res.locals.datos = { 
						"value": {
							"lista_resultados_lugares": resultados.entidades_lugares,
							"lista_resultados_alojamientos": resultados.entidades_alojamientos,
							"lista_resultados_gastronomicos": resultados.entidades_gastronomicas,
							"lista_resultados_experiencias": resultados.entidades_experiencias,
							"lista_resultados_eventos": resultados.entidades_eventos,
							"cantidad_resultados_lugares": resultados.entidades_lugares ? resultados.entidades_lugares.length : 0,
							"cantidad_resultados_alojamientos": resultados.entidades_alojamientos ? resultados.entidades_alojamientos.length : 0,
							"cantidad_resultados_gastronomicos": resultados.entidades_gastronomicas ? resultados.entidades_gastronomicas.length : 0,
							"cantidad_resultados_eventos": resultados.entidades_eventos ? resultados.entidades_eventos.length : 0,
							"cantidad_resultados_experiencias": resultados.entidades_experiencias ? resultados.entidades_experiencias.length : 0,
							"consulta": req.query.b,
							"coordenadas": coord,
							"destino": req.query.u
						}
					};
					if (req.isAuthenticated())
						res.locals.datos.value.usuario_sesionado = req.session.passport.user;

					this._respuesta.para_resultados_sin_categoria(req, res);
				});
			}

			else {
				parametros = {
						"consulta": req.query.b != "" ? { "aprobado": true, $text: { $search: req.query.b } } : {"aprobado": true},
						"rellenar_campos": "imagen_portada",
						"limite": this._limite_resultados_busq_amplia
					};

				if(req.query.e)
					parametros.consulta.etiquetas = req.query.e;
				if(req.params.categoria)
					parametros.consulta.categoria = req.params.categoria;
				if(req.query.preciomin && req.query.preciomax)
					parametros.consulta.precio = {$and: [{"precio": {$lte: req.query.preciomax}}, {"precio": {$gte: req.query.preciomin}}] };
				else if(req.query.preciomin)
					parametros.consulta.precio = {$gte: req.query.preciomin};
				else if(req.query.preciomax)
					parametros.consulta.precio = {$lte: req.query.preciomax};
				if(req.query.desde && req.query.hasta){
					filtros.fecha_inicio = {$gte: req.query.desde};
	                filtros.fecha_fin = {$lte: req.query.hasta};
		        }

				this._busqueda.amplia(parametros, (error, resultados) => {
					if(error) return next(error);

					res.locals.datos = { 
						"value": {
							"lista_resultados_lugares": resultados.entidades_lugares,
							"lista_resultados_alojamientos": resultados.entidades_alojamientos,
							"lista_resultados_gastronomicos": resultados.entidades_gastronomicas,
							"lista_resultados_eventos": resultados.entidades_eventos,
							"lista_resultados_experiencias": resultados.entidades_experiencias,
							"cantidad_resultados_lugares": resultados.cantidad_resultados_lugares,
							"cantidad_resultados_alojamientos": resultados.cantidad_resultados_alojamientos,
							"cantidad_resultados_gastronomicos": resultados.cantidad_resultados_gastronomicos,
							"cantidad_resultados_eventos": resultados.cantidad_resultados_eventos,
							"cantidad_resultados_experiencias": resultados.cantidad_resultados_experiencias,
							"consulta": req.query.b
						}
					};
					if (req.isAuthenticated())
						res.locals.datos.value.usuario_sesionado = req.session.passport.user;

					this._respuesta.para_resultados_sin_categoria(req, res);
				});
			}
		}

		else {

			if(req.query.coord) {
				let coord = req.query.coord.split(";");
					coord.forEach( function(x,i,a){ let d = coord[i].split(","); coord[i]= [parseFloat(d[0]), parseFloat(d[1])] });

				parametros = {
						"consulta": {
								"geo_ubicacion" : {
									$geoWithin : {
										$geometry : {
											type : "Polygon",
											coordinates : [[
												coord[0],
												coord[1],
												coord[2],
												coord[3],
												coord[4]
											]]
										}
									}
								},
								"aprobado": true
							},
						"consulta_cantidad": {"aprobado": true},
						"rellenar_campos": "imagen_portada",
						"limite": this._limite_resultados_busq_amplia
					};

				if(req.query.e)
					parametros.consulta.etiquetas = req.query.e;
				if(req.params.categoria)
					parametros.consulta.categoria = req.params.categoria;
				if(req.query.preciomin && req.query.preciomax)
					parametros.consulta.precio = {$and: [{"precio": {$lte: req.query.preciomax}}, {"precio": {$gte: req.query.preciomin}}] };
				else if(req.query.preciomin)
					parametros.consulta.precio = {$gte: req.query.preciomin};
				else if(req.query.preciomax)
					parametros.consulta.precio = {$lte: req.query.preciomax};
				if(req.query.desde && req.query.hasta){
					filtros.fecha_inicio = {$gte: req.query.desde};
	                filtros.fecha_fin = {$lte: req.query.hasta};
		        }

				this._busqueda.amplia_mapa(parametros, (error, resultados) => {
					if(error) return next(error);

					res.locals.datos = { 
						"value": {
							"lista_resultados_lugares": resultados.entidades_lugares,
							"lista_resultados_alojamientos": resultados.entidades_alojamientos,
							"lista_resultados_gastronomicos": resultados.entidades_gastronomicas,
							"lista_resultados_eventos": resultados.entidades_eventos,
							"lista_resultados_experiencias": resultados.entidades_experiencias,
							"cantidad_resultados_lugares": resultados.entidades_lugares ? resultados.entidades_lugares.length : 0,
							"cantidad_resultados_alojamientos": resultados.entidades_alojamientos ? resultados.entidades_alojamientos.length : 0,
							"cantidad_resultados_gastronomicos": resultados.entidades_gastronomicas ? resultados.entidades_gastronomicas.length : 0,
							"cantidad_resultados_eventos": resultados.entidades_eventos ? resultados.entidades_eventos.length : 0,
							"cantidad_resultados_experiencias": resultados.entidades_experiencias ? resultados.entidades_experiencias.length : 0,
							"consulta": "",
							"coordenadas": coord,
							"destino": req.query.u
						}
					};
					if (req.isAuthenticated())
						res.locals.datos.value.usuario_sesionado = req.session.passport.user;

					this._respuesta.para_resultados_sin_categoria(req, res);
				});
			}

			else {
				if (req.isAuthenticated())
					res.locals.datos.value.usuario_sesionado = req.session.passport.user;

				res.locals.datos = {"value": {"consulta": req.query.b, "destino": req.query.u} };
				this._respuesta.para_buscar_nuevamente(req, res);
			}
		}
	}

	/*
		caso de uso: usr hace clic en una categoria general, sin texto ni coordenadas (busq por entidad)
		caso de uso: usr hace click en categoria especifica, sin texto ni coordenadas (busq por entidad)
	*/
	resultados_por_categoria(req, res, next){
		
		if (this._lista_entidades_ux.indexOf(req.params.tipo_entidad) !== -1) {
			let pagina = (Math.abs(req.query.p) || 1),
				tipo_entidad = req.params.tipo_entidad.replace(/(\w+)/, capitalizarEntidad),
				filtros = {},
				parametros;

			switch(tipo_entidad){
				case "SDI":
					filtros = req.params.atributo ? {"__t": null, "etiquetas": req.params.atributo} : {"__t": null};
					break;
				case "Alojamiento":
					filtros = req.params.atributo ? {"aprobado": true, "__t": "Alojamiento", "etiquetas": req.params.atributo} : {"aprobado": true, "__t": "Alojamiento"};
					break;
				case "Gastronomia":
					filtros = req.params.atributo ? {"aprobado": true, "__t": "Gastronomia", "etiquetas": req.params.atributo} : {"aprobado": true, "__t": "Gastronomia"};
					break;
				case "Evento":
					filtros = req.params.atributo ? {"aprobado": true, "__t": "Evento", "etiquetas": req.params.atributo} : {"aprobado": true, "__t": "Evento"};
					break;
				case "Experiencia":
					filtros = req.params.atributo ? {"aprobado": true, "__t": "Experiencia", "etiquetas": req.params.atributo} : {"aprobado": true, "__t": "Experiencia"};
					break;
			}

			if(req.query.preciomin && req.query.preciomax)
				filtros.precio = {$lte: req.query.preciomax, $gte: req.query.preciomin };
			else if(req.query.preciomin)
				filtros.precio = {$gte: req.query.preciomin};
			else if(req.query.preciomax)
				filtros.precio = {$lte: req.query.preciomax};
			if(req.params.categoria)
				filtros.categoria = req.params.categoria;
			if(req.query.desde && req.query.hasta){
				filtros.fecha_inicio = {$gte: req.query.desde};
                filtros.fecha_fin = {$lte: req.query.hasta};
	        }


			parametros = {
					"consulta": null,
					"tipo_entidad": tipo_entidad,
					"pagina": pagina,
					"filtros": filtros,
					"rellenar_campos": "imagen_portada",
					"limite": this._limite_resultados,
					"salto": this._limite_resultados * (pagina - 1)
				};

			this._busqueda.por_entidad(parametros, (error, resultados) => {
				if(error) return next(error);

				let pags = Math.ceil(Math.abs((resultados.cantidad_resultados/this._limite_resultados))),
					pag = (pagina >= 1 && pagina <= pags) ? pagina : 1,
					hay_previa = pag > 1 && pag < pags,
					hay_siguiente = pag < pags,
					atributo = req.params.atributo ? req.params.atributo+"/" : "";

				res.locals.datos = { 
					"value": {
						"tipo_entidad": tipo_entidad,
						"lista_resultados": resultados.entidades,
						"cantidad_resultados": resultados.cantidad_resultados,
						"url_previa": hay_previa ? "/busqueda/"+tipo_entidad+"/"+atributo+"?&p="+(pag-1) : false,
						"url_pagina": "/busqueda/"+tipo_entidad+"/"+atributo+"?&p="+pag, //+=1,
						"url_siguiente": hay_siguiente ? "/busqueda/"+tipo_entidad+"/"+atributo+"?&p="+(pag+1) : false,
						"cantidad_paginas": pags
					}
				};
				if (req.isAuthenticated())
					res.locals.datos.value.usuario_sesionado = req.session.passport.user;

				this._respuesta.para_resultados_por_categoria(req, res);
			});
		}

		else {
			if (req.isAuthenticated())
				res.locals.datos.value.usuario_sesionado = req.session.passport.user;

			res.locals.datos = {"value": {"consulta": req.query.b, "destino": req.query.u} };
			this._respuesta.para_buscar_nuevamente(req, res);
		}
	}

	/* no tiene value la respuesta*/
	autocompletar(req, res, next){
		let campos_solicitados = "nombre url etiquetas promedio_calificaciones __t",  // si es Experiencia, evento o lugar
			limite = 5,
			tipo_entidad = req.params.tipo_entidad,
			consulta = {
				$or: [
					{ "nombre": { $regex: new RegExp(req.query.b, "i") } },
					{ "etiquetas": { $regex: new RegExp(req.query.b, "i") } }
				]
			};

		if(tipo_entidad == "Ubicacion"){
			if(req.query.cp){
				consulta = {"pais": req.query.pais, "codigo_postal": { $regex: new RegExp(req.query.cp, "i") }}
				campos_solicitados = null;
				limite = null;
			}
			else if(req.query.c) {
				consulta = {"pais": req.query.pais, "ciudad": { $regex: new RegExp(req.query.c, "i") }}
				campos_solicitados = null;
				limite = null;
			}
		}

		else if(tipo_entidad == "PrestadorServicio"){
			consulta = { "usuario": { $regex: new RegExp(req.query.b, "i") } };
			campos_solicitados = "usuario nombre";
			limite = this._limite_resultados_ajax;
		}
		else if(tipo_entidad != "SDI")
			consulta.aprobado = true;
		else if(tipo_entidad == "SDI")
			consulta.__t = null;

		let parametros = {
			"consulta": consulta,
			"tipo_entidad": tipo_entidad,
			"campos_solicitados": campos_solicitados,
			"limite": limite,
			"rellenar_campos": ""
		};

		this._busqueda.sugerencias(parametros, (error, resultados) => {
			if(error) return next(error);

			res.locals.datos = resultados;
			this._respuesta.para_busquedas_autocompletar(req, res);
		});
	}

	entidades_cercanas(req, res, next){
		if (this._lista_entidades_ux.indexOf(req.params.tipo_entidad) !== -1) {
			if(req.query.lng && req.query.lat) {
				let tipo_entidad = req.params.tipo_entidad.replace(/(\w+)/, capitalizarEntidad),
					parametros = {
						"tipo_entidad": tipo_entidad,
						"coordenadas": [parseFloat(req.query.lng), parseFloat(req.query.lat)],
						"distancia_m": this._distancia_m,
						"limite": this._limite_resultados_busq_amplia,
						"url": req.params.url,
						"rellenar_campos": "imagen_portada"
					};

				this._busqueda.cerca_de(parametros, (error, resultados) => {
					if(error) return next(error);

					res.locals.datos = { 
						"value": resultados
					};
					if (req.isAuthenticated())
						res.locals.datos.value.usuario_sesionado = req.session.passport.user;

					this._respuesta.para_busquedas_entidades_cercanas(req, res);
				});
			}
			else {
				res.locals.datos = {"value": ""};
				this._respuesta.para_busquedas_entidades_cercanas(req, res);
			}
		}
		else {
			res.locals.datos = {"value": ""};
			this._respuesta.para_busquedas_entidades_cercanas(req, res);
		}
	}

}
