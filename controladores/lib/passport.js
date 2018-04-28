
const {Persona} = require('../../modelos/persona'),
	passport = require('passport');

const {local_registro, local_sesion} = require('./estrategias-autenticacion/local');
const google = require('./estrategias-autenticacion/google');
const facebook = require('./estrategias-autenticacion/facebook');
const twitter = require('./estrategias-autenticacion/twitter');


// =============================================
// configuracion de sesion en passport =========
// =============================================


// cuando sesiona
passport.serializeUser((persona, done) => {
  return done(null, {usuario: persona.usuario, tipo_usr: persona.tipo_usr, id: persona.id});
});

// cuando cierra sesion
passport.deserializeUser((persona, done) => {
  Persona.find({usuario: persona.usuario}, (error, p) => {
	return done(error, p);
  });
});


passport.use("registrar-usuario", local_registro);
passport.use("sesionar-usuario", local_sesion);
passport.use(google);
passport.use(facebook);
passport.use(twitter);

module.exports = passport;
