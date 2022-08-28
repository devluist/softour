
const passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	{Persona, Turista, PrestadorServicio} = require('../../../modelos/persona'),
	Favoritos = require('../../../modelos/favoritos');


// =============================================
// REGISTRAR PERSONA ===========================
// =============================================

module.exports.local_registro = new LocalStrategy({
		usernameField : 'usuario',
		passwordField : 'clave',
		passReqToCallback : true
	},
	(req, usuario, clave, done) => {

		// asincrono
		// Persona.findOne no se ejecuta hasta que se envien datos de vuelta
		process.nextTick(() => {

			Persona.findOne({ $or: [ {usuario: req.body.usuario}, {correo: req.body.correo} ] }, (error, user) => {
				let msj;
				if (error)    return done(error);

				// Usuario ya existe?
				if (user){
					if (user.correo == req.body.correo)
						msj = 'El correo '+req.body.correo+' ya esta registrado, porfavor intente iniciar sesion con este correo.'
					else
						msj = 'El usuario '+req.body.usuario+' ya existe, intente ingresar otro nombre de usuario.'

					return done(null, false, {
						"details": [
							{
								"path": "correo",
								"message": msj
							}
						]});
				}

				else {
					req.body.proveedor = "local";
					if (req.body.tipo_usr == "Turista")
						Turista.registrar(req.body, (error, usr_registrado) => {
							if (error)  return done(null, false, error);

							Favoritos.agregar({"turista": usr_registrado._id}, (error) => {
								if(error)  return done(null, false, error);

								return done(null, usr_registrado);
							})
						});

					else
						PrestadorServicio.registrar(req.body, (error, usr_registrado) => {
							if (error)  return done(null, false, error);

							return done(null, usr_registrado);
						});
				}
			});
		});
	}
);


// =============================================
// SESIONAR PERSONA ============================
// =============================================
module.exports.local_sesion = new LocalStrategy({
		usernameField : 'usuario',
		passwordField : 'clave',
		passReqToCallback : true
	},
	(req, usuario, clave, done) => {

		Persona.findOne({ $or: [ {usuario: usuario}, {correo: usuario} ] }, (error, user) => {
				if (error)
					return done(error);

				if (!user)
					return done(null, false, {
					"details": [
						{
							"path": "usuario",
							"message": 'No se consiguió ningún usuario con estos datos'
						}
					]});

				if (!user._validar_clave(clave))
					return done(null, false, {
					"details": [
						{
							"path": "contraseña",
							"message":'Clave incorrecta, porfavor verifique'
						}
					]});

				return done(null, user);
		});
	}
);
