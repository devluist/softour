
const autenticacion_basica = require('basic-auth'),
	{ Persona } = require('../../modelos/persona'),
	{ UsuarioNoAutenticado } = require('./manejador_errores');


module.exports = class Autenticacion {

	constructor() {
		this._Persona = Persona;
		this.error_UsuarioNoAutenticado = UsuarioNoAutenticado;
	}

	usuario(req, next) {
		let datos = autenticacion_basica(req);
		if (datos){
			this._Persona.buscar(datos.name.toLowerCase(), (error, buscado) => {
				if (error) return next(error);

				if (!buscado || !buscado._validar_clave(datos.pass))
					return next(new this.error_UsuarioNoAutenticado());

				req.autenticadoAPI = true;
				req.session.passport = {
					"user": {
						"tipo_usr": buscado.tipo_usr,
						"usuario": buscado.usuario,
						"id": buscado.id
					}
				}
				return next();
			})
		}
		else if(req.isAuthenticated())
			return next();
		else
			return next(new this.error_UsuarioNoAutenticado());
	}

}
