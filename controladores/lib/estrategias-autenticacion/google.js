
const Configuracion = require('../../../configuracion'),
	GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
	{Persona, Turista, PrestadorServicio} = require('../../../modelos/persona');

const config = new Configuracion();

module.exports = new GoogleStrategy({
		clientID: config.google.clientID,
		clientSecret: config.google.clientSecret,
		callbackURL: config.google.callbackURL
	},

	function(accessToken, refreshToken, perfil, done) {
		Persona.findOne({ 'google.id': perfil.id }, function(error, usr) {
			if (error) return done(error);
			if (!usr) {
                
                usr = new Turista({
					nombre: perfil.displayName,
					correo: perfil.emails ? perfil.emails[0].value : "",
					proveedor: 'google',
					google: perfil._json
				});

				usr.usuario = usr._crear_nombre_usuario(perfil);
				usr.save(function(error) {
					if (error) console.log(error);

					return done(error, usr);
				});
			}
			else
				return done(error, usr);
		});
	}
);
