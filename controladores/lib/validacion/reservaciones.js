
const  JOI = require('joi'),
	Validacion = require('./'),
	CategoriaAlojamiento = require('../../../modelos/categoria-alojamiento'),
	CategoriaGastronomia = require('../../../modelos/categoria-gastronomia'),
	{ NoEncontrado } = require('../../lib/manejador_errores');


module.exports = class ValidacionReservacion extends Validacion {

	constructor(){
		super();
		this.CategoriaAlojamiento = CategoriaAlojamiento;
		this.CategoriaGastronomia = CategoriaGastronomia;

		/* Esquema para joi, para el registro de productos/categorias */
		this._esq_categorias_productos_alojamiento = JOI.object().keys({

			/* PRODUCTOS */
			tipo_espacio: JOI.string().trim().valid("Completo", "Habitación").required(),
			cantidad_camas: JOI.number().min(1).empty(""),
			limite_ocupantes: JOI.number().min(1).empty(""),

			/* CATEGORIAS */
			nombre: JOI.string().trim().regex(/^[a-zA-Z0-9 ñáéíóúÑÁÉÍÓÚ-]+$/).min(2).required(),
			descripcion: JOI.string().empty(""),
			precio_unitario_producto: JOI.number().min(0).empty(""),
			cantidad_habitaciones: JOI.number().min(0).empty(""),
			cantidad_baños: JOI.number().min(0).empty(""),
			metros_cuadrados: JOI.number().min(0).empty(""),
			servicios_incluidos: JOI.array().items(JOI.string().empty("")).unique().default([]),
			servicios_extras: JOI.array().items(JOI.string().empty("")).unique().default([])
		});

		this._esq_categorias_gastronomia = JOI.object().keys({

			nombre: JOI.string().trim().regex(/^[a-zA-Z0-9 ñáéíóúÑÁÉÍÓÚ-]+$/).min(2).required(),
			tipo_espacio: JOI.string().trim().valid("Restaurante", "Bar").required(),
			precio_unitario_producto: JOI.number().min(0).empty(""),
			gastronomia: JOI.string().empty(""),
			tipo_cocina: JOI.string().empty(""),
			descripcion: JOI.string().empty("")
		});
	}


	campos_alojamiento(datos, editar=false, cb){
		datos = this._depurar.etiquetas(datos, ["servicios_incluidos"]);

		if(datos.tipo_espacio == "Completo")
			return cb(null, this._ejecutar(datos, this._esq_categorias_productos_alojamiento))

		else
			this.CategoriaAlojamiento.buscar({consulta: {"nombre": datos.nombre, "alojamiento": datos.id_alojamiento}}, (error, buscado) => {
				if(error)
					cb(null, {"value": datos, "error": error});

				if(buscado && (editar == false))
					return cb(null, {"value": datos, "error": {
							"details":[{
								"path": "nombre",
								"message": "El nombre de la categoría ya existe"
							}]
						}});

				else{
					delete datos.id_alojamiento;
					return cb(null, this._ejecutar(datos, this._esq_categorias_productos_alojamiento));
				}
			});
	}

	campos_gastronomia(datos, editar=false, cb){

		this.CategoriaGastronomia.buscar({consulta: {"nombre": datos.nombre, "gastronomia": datos.id_alojamiento}}, (error, buscado) => {
			if(error)
				cb(null, {"value": datos, "error": error});

			if(buscado && (editar == false))
				return cb(null, {"value": datos, "error": {
						"details":[{
							"path": "nombre",
							"message": "El nombre de la categoría ya existe"
						}]
					}});

			else{
				delete datos.id_alojamiento;
				return cb(null, this._ejecutar(datos, this._esq_categorias_gastronomia));
			}
		});
	}
}
