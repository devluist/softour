
const Persona = require('../../modelos/persona');


module.exports = class FabricaUsuarios {

	constructor(){
		this._usuario = Persona;
	}

	usuarioTipo(tipo_usr) {

		switch (tipo_usr){
			case "Turista":
				return this._usuario.Turista;
				break;
			case "PrestadorServicio":
				return this._usuario.PrestadorServicio;
				break;
			case "Administrador":
				return this._usuario.Administrador;
				break;
		}
	}
}
