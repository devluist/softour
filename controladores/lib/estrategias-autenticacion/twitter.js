
const Configuracion = require('../../../configuracion'),
	TwitterStrategy = require('passport-twitter').Strategy,
	{Persona, Turista, PrestadorServicio} = require('../../../modelos/persona');

const config = new Configuracion();


module.exports = new TwitterStrategy({
		consumerKey: config.twitter.clientID,
		consumerSecret: config.twitter.clientSecret,
		callbackURL: config.twitter.callbackURL
	},
	function(accessToken, refreshToken, perfil, done) {

		Persona.findOne({ 'twitter.id_str': perfil.id }, function(error, usr) {
			if (error) return done(error);
			
			if (!usr) {

				usr = new Turista({
					nombre: perfil.displayName,
					correo: perfil.emails ? perfil.emails[0].value : "",
					proveedor: 'twitter',
					twitter: perfil._json
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
