
const Configuracion = require('../../../configuracion'),
	FacebookStrategy = require('passport-facebook').Strategy,
	{Persona, Turista, PrestadorServicio} = require('../../../modelos/persona');

const config = new Configuracion();


module.exports = new FacebookStrategy({
        clientID: config.facebook.clientID,
        clientSecret: config.facebook.clientSecret,
        callbackURL: config.facebook.callbackURL
    },
    function(accessToken, refreshToken, perfil, done) {
        
        Persona.findOne({ 'facebook.id': perfil.id }, function(error, usr) {
            if (error) return done(error);

            if (!usr) {
                usr = new Turista({
                    nombre: perfil.displayName,
                    correo: perfil.emails ? perfil.emails[0].value : "",
                    proveedor: 'facebook',
                    facebook: perfil._json
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
