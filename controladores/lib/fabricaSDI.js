
const SDI = require('../../modelos/sdi');


module.exports = class FabricaSDI {

	constructor(){
		this._SDI = SDI;
	}

	sdiTipo(tipo_sdi) {

		switch (tipo_sdi){
			case "":
				return this._SDI.SDI;
				break;
			case "Alojamiento":
				return this._SDI.Alojamiento;
				break;
			case "Gastronomia":
				return this._SDI.Gastronomia;
				break;
		}
	}
}
