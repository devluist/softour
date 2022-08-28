
const  JOI = require('joi'),
	Validacion = require('./');


module.exports = class ValidacionPersonas extends Validacion {

	constructor(){
		super();

		/* Esquema para joi, para el registro de personas */
		this._esquema_registrar_cuenta = JOI.object().keys({
			nombre: JOI.string().trim().regex(/^[a-zA-Z ñáéíóúÑÁÉÍÓÚ-]+$/).min(2).required(),

			usuario: JOI.string().trim().regex(/^[a-z0-9_]+$/).min(5).max(40),
			correo: JOI.string().trim().regex(/^[a-z_0-9\.]+@[a-z0-9]+\.[a-z]+$/i).required(),
			clave: JOI.string().required(),
			tipo_usr: JOI.any().valid("Turista","PrestadorServicio","Administrador").required()
		});

		this._esquema_iniciar_sesion = JOI.object().keys({
			usuario: JOI.string().required(),
			clave: JOI.string().required(),
		});



		/* Esquemas para joi, para configuracion de cuenta */

		this._esquema_configuracion = JOI.object().keys({
			sexo: JOI.any().valid("M","F"),
			biografia: JOI.string().empty('').default(''),
			edad: JOI.number().min(7).max(120)
		});

		this._esquema_configuracion_ps = JOI.object().keys({
			sexo: JOI.any().valid("M","F"),
			biografia: JOI.string().empty('').default(''),
			edad: JOI.number().min(7).max(120),
			telefono: JOI.string().trim().empty('').default('')
		});
}


	campos(datos, tipo_usr, config_cuenta = false){		

		let esq;
		if (config_cuenta)
			if(tipo_usr)
		 		esq = this._esquema_configuracion_ps;
		 	else
		 		esq = this._esquema_configuracion;

		else
			if(tipo_usr)
		 		esq = this._esquema_registrar_cuenta;
		 	else
		 		esq = this._esquema_iniciar_sesion;

		if(datos.usuario) datos.usuario = datos.usuario.toLowerCase();

		return this._ejecutar(datos, esq);
	}

}
