
const { Persona } = require('../../modelos/persona'),
	{ SDI, Alojamiento, Gastronomia } = require('../../modelos/sdi'),
	{ UsuarioNoAutorizado } = require('./manejador_errores'),
	Evento = require('../../modelos/evento'),
	Experiencia = require('../../modelos/experiencia'),
	Imagen = require('../../modelos/imagen'),
	Calificacion = require('../../modelos/calificacion');


module.exports = class Autorizacion {

	constructor(){ 
		this._error_UsuarioNoAutorizado = UsuarioNoAutorizado;
		this.Persona = Persona;

		/* lista de entidades */
		this.imagen = Imagen;
		this.lugar = SDI;  /* no se puede cambiar a sdi xq se usa como parametro de una url */
		this.alojamiento = Alojamiento;
		this.gastronomia = Gastronomia;
		this.experiencia = Experiencia;
		this.evento = Evento;
		this.calificacion = Calificacion;
	}

	a_usuarios(lista_roles, req, next){
 		if( req.isAuthenticated() || req.autenticadoAPI ){
 			if( lista_roles.indexOf(req.session.passport.user.tipo_usr) > -1 )
                return next();
 		}
        else
        	if(lista_roles.indexOf("Anonimo") > -1)
                return next();

        return next(new this._error_UsuarioNoAutorizado());
	}

	solo_a(rol, req, next){
		if( req.isAuthenticated() || req.autenticadoAPI )
 			if( rol.indexOf(req.session.passport.user.tipo_usr) > -1 )
                return next();

        return next(new this._error_UsuarioNoAutorizado());
	}

	usuarios_sesionados(req, next){
		if( req.isAuthenticated() || req.autenticadoAPI )
			return next();

		return next(new this._error_UsuarioNoAutorizado());
	}

	usuarios_anonimos(req, next){
		if( !req.isAuthenticated() && !req.autenticadoAPI )
			return next();

		return next(new this._error_UsuarioNoAutorizado());
	}

	acceso_perfil_propio(req, next){
		if( req.isAuthenticated() || req.autenticadoAPI )
			this.Persona.buscar(req.params.usuario.toLowerCase(), (error, buscado) => {
				if(error) return next(error);
				if(!buscado ) return next();

				if (buscado.usuario == req.session.passport.user.usuario)
					return next();

				else
					return next(new this._error_UsuarioNoAutorizado());
			})

		else
			return next(new this._error_UsuarioNoAutorizado());
	}

	acceso_perfil_propio_o_uno_publico(req, res, next){
		this.Persona.buscar(req.params.usuario.toLowerCase(), (error, buscado) => {
			if(error) return next(error);
			if(!buscado ) return next();

			res.locals.esSobreDatosPropios = false;
			if( req.isAuthenticated() || req.autenticadoAPI )
				if(buscado.usuario == req.session.passport.user.usuario){
					res.locals.esSobreDatosPropios = true;
					return next();
				}

			if (buscado.tipo_usr != "Administrador")
				return next();

			return next(new this._error_UsuarioNoAutorizado());
		});
	}

	como_admin_o_acceso_cuenta_propia(req, res, next){
		this.Persona.buscar(req.params.usuario.toLowerCase(), (error, buscado) => {
			if(error) return next(error);
			if(!buscado ) return next();

			res.locals.esSobreDatosPropios = false;
			if( req.isAuthenticated() || req.autenticadoAPI ){
				if(buscado.usuario == req.session.passport.user.usuario){
					res.locals.esSobreDatosPropios = true;
					return next();
				}

				if(req.session.passport.user.tipo_usr == "Administrador")
					return next();
			}

			return next(new this._error_UsuarioNoAutorizado());
		});		
	}

	para_recurso_propio(req, next){
		if( req.isAuthenticated() || req.autenticadoAPI ){
			let clase, consulta, poblar = "prestador_servicio";

			if(req.params.entidad) {  // album, sdi, calificacion, es necesario el tipo_entidad
				clase = req.params.tipo_entidad;
				consulta = {"url": req.params.entidad};
			}
			else if(req.params.url) {  // evento, exp
				clase = req.baseUrl.split("/").pop().toLowerCase();
				consulta = {"url": req.params.url};
			}

			this[clase].findOne(consulta).populate(poblar).exec((error, entidad_buscada) => {
				if(error) return next(error);
				if( !entidad_buscada ) return next();

				if (entidad_buscada.prestador_servicio && entidad_buscada.prestador_servicio.usuario == req.session.passport.user.usuario)
					return next();

				return next(new this._error_UsuarioNoAutorizado());
			});
		}

		else
			return next(new this._error_UsuarioNoAutorizado());
	}

	como_admin_o_para_recurso_propio(req, next){
		if( req.isAuthenticated() || req.autenticadoAPI ){
			if(req.session.passport.user.tipo_usr == "Administrador")
				return next();
			if((req.session.passport.user.tipo_usr == "PrestadorServicio") && (req.params.tipo_entidad == "lugar"))
				return next();

			let clase, consulta, poblar;

			if(req.params.entidad) {  // album, reservacion (categoria, producto), sdi, calificacion (estos necesitan saber q clase de sdi es)
				clase = req.params.tipo_entidad;
				consulta = {"url": req.params.entidad};
				poblar = "prestador_servicio";
			}
			else if(req.params.url) {  // experiencia, eventos
				clase = req.baseUrl.split("/").pop().toLowerCase();
				consulta = {"url": req.params.url};
				poblar = "prestador_servicio";
			}

			this[clase].findOne(consulta).populate(poblar).exec((error, entidad_buscada) => {
				if(error) return next(error);
				if( !entidad_buscada ) return next();

				if (entidad_buscada.prestador_servicio && entidad_buscada.prestador_servicio.usuario == req.session.passport.user.usuario)
					return next();

				return next(new this._error_UsuarioNoAutorizado());
			});
		}

		else
			return next(new this._error_UsuarioNoAutorizado());
	}

	sin_acceso_API(req, next){
		if( req.header("content-type") &&  ( req.header("content-type") === "application/json" || req.header("content-type").match(/multipart\/form-data/g) ) || req.xhr )
			return next(new this._error_UsuarioNoAutorizado());

		return next();
	}

}
