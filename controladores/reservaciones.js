
const RespuestaReservacion = require('./lib/respuesta/reservaciones'),
	ValidacionReservacion = require('./lib/validacion/reservaciones'),
	CategoriaAlojamiento = require('../modelos/categoria-alojamiento'),
	ProductoAlojamiento = require('../modelos/producto-alojamiento'),
	CategoriaGastronomia = require('../modelos/categoria-gastronomia'),
	ProductoGastronomia = require('../modelos/producto-gastronomia'),
	{ Alojamiento, Gastronomia } = require('../modelos/sdi'),
	{ Turista } = require('../modelos/persona'),
	{ NoEncontrado } = require('./lib/manejador_errores');



module.exports = class ControladorReservacion {

	constructor() {
		this._respuesta = new RespuestaReservacion();
		this._validar = new ValidacionReservacion();
		this._error_NoEncontrado = NoEncontrado;

		/* Tipos de entidades */
		this._gastronomia = Gastronomia;
		this._alojamiento = Alojamiento;

		/* Tipos de productos */
		this.Producto_alojamiento = ProductoAlojamiento;
		this.Producto_gastronomia = ProductoGastronomia;

		/* Tipos de categorias */
		this.Categoria_alojamiento = CategoriaAlojamiento;
		this.Categoria_gastronomia = CategoriaGastronomia;
	}

	agregar_producto_GET(req, res, next) {
		res.locals.datos = {"value": {"usuario_sesionado": req.session.passport.user}};

		this._respuesta.para_agregar_producto_GET(req, res);
	}

	agregar_producto_POST(req, res, next) {
		let lista_productos = [];
		this._validar["campos_"+req.params.tipo_entidad](req.body, false, (error, campos) => {
			if(error) next(error);
			res.locals.datos = campos;

			if (res.locals.datos.error) {
				res.locals.datos.value.usuario_sesionado = req.session.passport.user;

				this._respuesta.para_agregar_producto_POST(req, res);
			}

			else {

				this["_"+req.params.tipo_entidad].buscar({"url": req.params.entidad}, (error, buscado) => {
					if(error) {
						res.locals.datos.error = error;

						res.locals.datos.value.usuario_sesionado = req.session.passport.user;
						this._respuesta.agregar_producto_POST(req, res);
					}
					if(!buscado) return next(new this._error_NoEncontrado());

					res.locals.datos.value.alojamiento = buscado._id;
					this["Categoria_"+req.params.tipo_entidad].agregar(res.locals.datos.value, (error, agregado) => {
						if(error) {
							res.locals.datos.error = error;
							res.locals.datos.value.usuario_sesionado = req.session.passport.user;

							this._respuesta.para_agregar_producto_POST(req, res);
						}
						if(!agregado) return next(new this._error_NoEncontrado());

						else {
							res.locals.datos.value.categoria = agregado._id;
							if(req.params.tipo_entidad == "alojamiento"){
								if(res.locals.datos.value.tipo_espacio == "Habitación") {
									let ss, s = JSON.stringify(res.locals.datos.value);
									for (var i = 1; i <= res.locals.datos.value.cantidad_habitaciones; i++) {
										ss = s.replace("}", ',"sku":"HAB-'+res.locals.datos.value.nombre.toUpperCase()+'-'+i+'"}');
										lista_productos.push(JSON.parse(ss));
									};
								}
								else
									lista_productos.push(res.locals.datos.value);

								this["Producto_"+req.params.tipo_entidad].ingresar(lista_productos, (error, registrados) => {
									if(error) {
										res.locals.datos.error = error;

										res.locals.datos.value.usuario_sesionado = req.session.passport.user;
										this._respuesta.para_agregar_producto_POST(req, res);
									}

									if(!buscado) return next(new this._error_NoEncontrado());
									else {
										res.locals.datos = {"value": {
											"categoria": agregado,
											"producto": registrados
										}};
										res.locals.datos.value.usuario_sesionado = req.session.passport.user;

										this._respuesta.para_agregar_producto_POST(req, res);
									}
								});
							}
							else {
								res.locals.datos = {"value": {
									"categoria": agregado
								}};
								res.locals.datos.value.usuario_sesionado = req.session.passport.user;

								this._respuesta.para_agregar_producto_POST(req, res);
							}
						}
					});
				});
			}
		});
	}

}
