
const RutasGenerales = require('./generales'),
	RutasExperiencias = require('./experiencias'),
	RutasBusquedas = require('./busqueda'),
	RutasAlbums = require('./albums'),
	RutasReservaciones = require('./reservaciones'),
	RutasEventos = require('./eventos'),
	RutasCalificaciones = require('./calificaciones'),
	RutasSDI = require('./sdis'),
	RutasFavoritos = require('./favoritos'),
	RutasPersonas = require('./personas');


module.exports = class ControladorPrincipal {

	generar_rutas_generales(){
		let rutas = new RutasGenerales();
		return rutas.urls();
	}

	generar_rutas_busqueda_api(){
		let rutas = new RutasBusquedas();
		return rutas.urls_api();
	}

	generar_rutas_busqueda(){
		let rutas = new RutasBusquedas();
		return rutas.urls();
	}



	generar_rutas_eventos_api(){
		let rutas = new RutasEventos();
		return rutas.urls_api();
	}

	generar_rutas_eventos(){
		let rutas = new RutasEventos();
		return rutas.urls();
	}



	generar_rutas_favoritos_api(){
		let rutas = new RutasFavoritos();
		return rutas.urls_api();
	}

	generar_rutas_favoritos(){
		let rutas = new RutasFavoritos();
		return rutas.urls();
	}



	generar_rutas_reservaciones_api(){
		let rutas = new RutasReservaciones();
		return rutas.urls_api();
	}

	generar_rutas_reservaciones(){
		let rutas = new RutasReservaciones();
		return rutas.urls();
	}



	generar_rutas_experiencias_api(){
		let rutas = new RutasExperiencias();
		return rutas.urls_api();
	}

	generar_rutas_experiencias(){
		let rutas = new RutasExperiencias();
		return rutas.urls();
	}



	generar_rutas_sdis_api(){
		let rutas = new RutasSDI();
		return rutas.urls_api();
	}

	generar_rutas_sdis(){
		let rutas = new RutasSDI();
		return rutas.urls();
	}



	generar_rutas_albums_api(){
		let rutas = new RutasAlbums();
		return rutas.urls_api();
	}

	generar_rutas_albums(){
		let rutas = new RutasAlbums();
		return rutas.urls();
	}



	generar_rutas_calificaciones_api(){
		let rutas = new RutasCalificaciones();
		return rutas.urls_api();
	}

	generar_rutas_calificaciones(){
		let rutas = new RutasCalificaciones();
		return rutas.urls();
	}



	generar_rutas_personas_api(){
		let rutas = new RutasPersonas();
		return rutas.urls_api();
	}

	generar_rutas_personas(){
		let rutas = new RutasPersonas();
		return rutas.urls();
	}


}