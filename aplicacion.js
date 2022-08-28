
require('dotenv').config();

let path = require('path'),
	express = require('express'),

	// clases
	{ NoEncontrado } = require('./controladores/lib/manejador_errores'),
	BaseDatos = require('./configuracion/base_datos'),
	Configuracion = require('./configuracion'),
	ControladorPrincipal = require('./controladores/lib/ruta');

const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')  // WARNING: This was added to run this old project

const i18n=require("i18n-express");

class Aplicacion {
	/*
		Se encarga de centralizar todos los recursos para cumplir con la lógica del negocio. Es el punto de partida desde donde una vez configurada, se ejecuta la aplicacion
	*/



	constructor() {

		this.configuracion = new Configuracion();
		this.ControladorPrincipal = new ControladorPrincipal();


		// LIBRERIAS BASICAS PARA LA APLICACION  ======================

		this.bodyParser = require('body-parser');

		/* Manejo de las Vistas */
		this.exp_handlebars = require('express-handlebars');
		this.Handlebars = require('handlebars');  // WARNING: This was added to run this old project

		/* Manejo de Sesiones */
		this.passport = require('passport');
		this.sesion = require('express-session');
		this.cookieParser = require('cookie-parser');


		/* Internacionalización */
		this.i18n = i18n;

		/* Instanciar el framework que usara la aplicacion */
		this.app = express();
	}

	_configurar (){

		let hbs;

		BaseDatos = new BaseDatos(this.configuracion.bd, this.configuracion.opciones);
		this.BD = BaseDatos.conectar();

		this.app.use(this.bodyParser.json({limit: '1024kb' }));
		this.app.use(this.bodyParser.urlencoded({ limit: '1024kb', extended: false }));



		// sesiones ==================================================

		/*this.app.use(require('csurf')());
		this.app.use(function(req, res, next) {
			res.locals._csrfToken = req.csrfToken();
			next();
		});*/
		this.app.use(this.cookieParser('53k1-t0z'));
		this.app.use(this.sesion({
			secret: '2P44-4Q44-JccD',
			resave: true,
			saveUninitialized: true
		}));
		this.app.use(this.passport.initialize());
		this.app.use(this.passport.session());



		// vistas ==================================================

		this.app.set('views', "vistas");
		this.app.use(express.static(path.join(__dirname,'publico')));

		hbs = this.exp_handlebars.create({
			defaultLayout: 'base',

			handlebars: allowInsecurePrototypeAccess(this.Handlebars), // WARNING: This was added to run this old project

			layoutsDir: this.app.get('views') + '/esqueleto',
			partialsDir: [this.app.get('views') + '/fragmentos'],
			//Handlebars: this.Handlebars,
			helpers: {
				section: function(name, options) {
					if (!this._sections) this._sections = {};
					this._sections[name] = options.fn(this);
					return null;
				},
				if_mod: function (v1, operador, v2, options) {
					switch (operador) {
						case '==':
							return (v1 == v2) ? options.fn(this) : options.inverse(this);
						case '===':
							return (v1 === v2) ? options.fn(this) : options.inverse(this);
						case '!=':
							return (v1 != v2) ? options.fn(this) : options.inverse(this);
						case '!==':
							return (v1 !== v2) ? options.fn(this) : options.inverse(this);
						case '<':
							return (v1 < v2) ? options.fn(this) : options.inverse(this);
						case '<=':
							return (v1 <= v2) ? options.fn(this) : options.inverse(this);
						case '>':
							return (v1 > v2) ? options.fn(this) : options.inverse(this);
						case '>=':
							return (v1 >= v2) ? options.fn(this) : options.inverse(this);
						case '&&':
							return (v1 && v2) ? options.fn(this) : options.inverse(this);
						case '||':
							return (v1 || v2) ? options.fn(this) : options.inverse(this);
						default:
							return options.inverse(this);
					}
				},
				paginador: function (paginas, url_pag){
					let ret= "",temp="", pag = url_pag.split(/&p=[0-9]+/)[0], num_pag = url_pag.split(/&p=([0-9])+/)[1];

					for(let iteracion=1; iteracion<=paginas; iteracion++) {
						if (iteracion != num_pag)
							temp = '<li><a href="'+pag+'&p='+iteracion+'">'+iteracion+'</a></li>';
						else
							temp = '<li class="current"><a href="#">'+iteracion+'</a></li>';

						ret = ret + temp;
					}
					return ret;
				},
				a_fecha: function(fecha) {
					return fecha.toLocaleDateString() + " a las " + fecha.toLocaleTimeString();
				}
			}
		});
		this.app.engine('handlebars', hbs.engine);
		this.app.set('view engine', 'handlebars');



		// internacionalizacion =====================================

		this.app.use(i18n({
			translationsPath: path.join(__dirname, 'i18n'),
			siteLangs: ["en","es"],
			textsVarName: 'traduccion',
			defaultLang: "es"
		}));



		// rutas api ==============================================

		this.app.use('/api/experiencia', this.ControladorPrincipal.generar_rutas_experiencias_api() );
		this.app.use('/api/usuario', this.ControladorPrincipal.generar_rutas_personas_api() );
		this.app.use('/api/album', this.ControladorPrincipal.generar_rutas_albums_api() );
		this.app.use('/api/calificacion', this.ControladorPrincipal.generar_rutas_calificaciones_api() );
		/*this.app.use('/api/mensajeria', this.ControladorPrincipal.generar_rutas_mensajeria_api() );*/
		this.app.use('/api/busqueda', this.ControladorPrincipal.generar_rutas_busqueda_api() );
		this.app.use('/api/evento', this.ControladorPrincipal.generar_rutas_eventos_api() );
		this.app.use('/api/favoritos', this.ControladorPrincipal.generar_rutas_favoritos_api() );
		this.app.use('/api/reservacion', this.ControladorPrincipal.generar_rutas_reservaciones_api() );
		this.app.use('/api', this.ControladorPrincipal.generar_rutas_sdis_api() );



		// rutas web ==============================================

		this.app.use('/experiencia', this.ControladorPrincipal.generar_rutas_experiencias() );
		this.app.use('/usuario', this.ControladorPrincipal.generar_rutas_personas() );
		this.app.use('/album', this.ControladorPrincipal.generar_rutas_albums() );
		this.app.use('/calificacion', this.ControladorPrincipal.generar_rutas_calificaciones() );
		this.app.use('/busqueda', this.ControladorPrincipal.generar_rutas_busqueda() );
		this.app.use('/evento', this.ControladorPrincipal.generar_rutas_eventos() );
		//this.app.use('/itinerario', this.ControladorPrincipal.generar_rutas_itinerarios() );
		//this.app.use('/mensajeria', this.ControladorPrincipal.generar_rutas_mensajeria() );
		this.app.use('/reservacion', this.ControladorPrincipal.generar_rutas_reservaciones() );
		this.app.use('', this.ControladorPrincipal.generar_rutas_sdis() );
		this.app.use('', this.ControladorPrincipal.generar_rutas_generales() );



		this.app.use((req, res, next) => {
			return next(new NoEncontrado());
		});

		this.app.use((error, req, res, next) => {

			res.locals = {};
			res.locals.estatus = error.estatus || error.status || 500;
			res.locals.nombre = error.nombre || error.name;
			res.locals.mensaje = error.mensaje || error.message || 'Algo salió mal.';
			res.locals.tipo = error.tipo || error.type;
			//console.log(error.stack);

			if (req.isAuthenticated())
				res.locals.datos = {"value": {"usuario_sesionado": req.session.passport.user}};

			if( req.header("content-type") &&  ( req.header("content-type") === "application/json" || req.header("content-type").match(/multipart\/form-data/g) ) || req.xhr ){
				return res.status(res.locals.estatus).json({"Error": res.locals })
			}
			else
				return res.status(res.locals.estatus).render("error", {layout:"error"});
		});

	}

	ejecutar () {
		this._configurar()
		this.app.listen(this.configuracion.puerto);
		console.log("Servidor iniciado exitosamente. Abre en tu navegador el sitio: localhost");
		module.exports.configuracion = this.configuracion;

		this.configuracion.cargar_datos();
	}
}

var aplicacion = new Aplicacion();

aplicacion.ejecutar();
