
const { Router } = require('express'),
	ControladorPersonas = require('../../personas'),
	Autenticar = require('../autenticacion'),
	Autorizar = require('../autorizacion');
const 	passport = require('../passport');


module.exports = class RutasPersonas {

	constructor(){
		this._manejador_peticiones = Router();
		this._Autorizar =  new Autorizar();
		this._Autenticar =  new Autenticar();
		this._ctrlPersonas = new ControladorPersonas();


		this._url_fallo = { failureRedirect: '/usuario/sesionarme'};
		this._opciones_redes = {
			"facebook": {
		      scope: ['email'],
		      failureRedirect: '/usuario/sesionarme/'
		    },
		    "twitter": {
		      failureRedirect: '/usuario/sesionarme'
		    },
		    "google": {
		      failureRedirect: '/usuario/sesionarme',
		      scope: ['https://www.googleapis.com/auth/userinfo.email',
		                      'https://www.googleapis.com/auth/userinfo.profile']
		    }
		};
		
	}

	urls() {

		this._manejador_peticiones.all('*',
			(req, res, next) => this._Autorizar.sin_acceso_API(req, next)
		);


		this._manejador_peticiones.get('/sesionarme',
			(req, res, next) => this._Autorizar.usuarios_anonimos(req, next),
			(req, res, next) => this._ctrlPersonas.sesionarme_GET(req, res, next)
		);
		this._manejador_peticiones.post('/sesionarme',
			(req, res, next) => this._Autorizar.usuarios_anonimos(req, next),
			(req, res, next) => this._ctrlPersonas.sesionarme_POST(req, res, next)
		);

		this._manejador_peticiones.get('/sesionarme/:redes',
			(req, res, next) => this._Autorizar.usuarios_anonimos(req, next),
			(req, res, next) => passport.authenticate(req.params.redes, this._opciones_redes[req.params.redes])(req, res, next)
		);
		this._manejador_peticiones.get('/sesionarme/:redes/retorno',
			(req, res, next) => this._Autorizar.usuarios_anonimos(req, next),
			(req, res, next) => passport.authenticate(req.params.redes, this._url_fallo) (req, res, next),
			(req, res, next) => { res.redirect('/'); }
		);

		this._manejador_peticiones.get('/cerrar-sesion',
			(req, res, next) => this._Autorizar.usuarios_sesionados(req, next),
			(req, res, next) => this._ctrlPersonas.cerrar_sesion(req, res, next)
		);


		this._manejador_peticiones.get('/registrar-cuenta',
			(req, res, next) => this._Autorizar.a_usuarios(["Administrador", "Anonimo"], req, next),
			(req, res, next) => this._ctrlPersonas.registrar_cuenta_GET(req, res, next)
		);
		this._manejador_peticiones.post('/registrar-cuenta',
			(req, res, next) => this._ctrlPersonas.registrar_cuenta_POST(req, res, next)
		);



		this._manejador_peticiones.get('/listado/:tipo_usr',
			(req, res, next) => this._Autorizar.a_usuarios(["PrestadorServicio", "Administrador"], req, next),
			(req, res, next) => this._ctrlPersonas.listado(req, res, next)
		);

		this._manejador_peticiones.get('/:usuario',
			(req, res, next) => this._Autorizar.acceso_perfil_propio_o_uno_publico(req, res, next),
			(req, res, next) => this._ctrlPersonas.perfil(req, res, next)
		);



		this._manejador_peticiones.get('/:usuario/configurar-cuenta',
			(req, res, next) => this._Autorizar.solo_a(["Turista", "PrestadorServicio"], req, next),
			(req, res, next) => this._Autorizar.acceso_perfil_propio(req, next),
			(req, res, next) => this._ctrlPersonas.configurar_cuenta_GET(req, res, next)
		);
		this._manejador_peticiones.post('/:usuario/configurar-cuenta',
			(req, res, next) => this._Autorizar.solo_a(["Turista", "PrestadorServicio"], req, next),
			(req, res, next) => this._Autorizar.acceso_perfil_propio(req, next),
			(req, res, next) => this._ctrlPersonas.configurar_cuenta(req, res, next)
		);


		this._manejador_peticiones.get('/:usuario/eliminar-cuenta',
			(req, res, next) => this._Autorizar.como_admin_o_acceso_cuenta_propia(req, res, next),
			(req, res, next) => this._ctrlPersonas.eliminar_cuenta_GET(req, res, next)
		);
		this._manejador_peticiones.post('/:usuario/eliminar-cuenta',
			(req, res, next) => this._Autorizar.como_admin_o_acceso_cuenta_propia(req, res, next),
			(req, res, next) => this._ctrlPersonas.eliminar_cuenta(req, res, next)
		);


		return this._manejador_peticiones;
	}

	urls_api() {

		this._manejador_peticiones.post('/registrar-cuenta',
			(req, res, next) => this._Autenticar.usuario(req, next),
			(req, res, next) => this._ctrlPersonas.registrar_cuenta_POST(req, res, next)
		);


		this._manejador_peticiones.get('/listado/:tipo_usr',
			(req, res, next) => this._Autenticar.usuario(req, next),
			(req, res, next) => this._Autorizar.solo_a("Administrador", req, next),
			(req, res, next) => this._ctrlPersonas.listado_ps(req, res, next)
		);

		this._manejador_peticiones.get('/:usuario',
			(req, res, next) => this._Autenticar.usuario(req, next),
			(req, res, next) => this._Autorizar.acceso_perfil_propio_o_uno_publico(req, res, next),
			(req, res, next) => this._ctrlPersonas.perfil(req, res, next)
		);


		this._manejador_peticiones.put('/:usuario/configurar-cuenta',
			(req, res, next) => this._Autenticar.usuario(req, next),
			(req, res, next) => this._Autorizar.solo_a(["Turista", "PrestadorServicio"], req, next),
			(req, res, next) => this._Autorizar.acceso_perfil_propio(req, next),
			(req, res, next) => this._ctrlPersonas.configurar_cuenta(req, res, next)
		);

		this._manejador_peticiones.delete('/:usuario/eliminar-cuenta',
			(req, res, next) => this._Autenticar.usuario(req, next),
			(req, res, next) => this._Autorizar.como_admin_o_acceso_cuenta_propia(req, res, next),
			(req, res, next) => this._ctrlPersonas.eliminar_cuenta(req, res, next)
		);


		return this._manejador_peticiones;
	}

}
