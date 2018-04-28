var mapa, marcador, configuracion = {
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        }
    };

function inicializar_mapa(){

	var URL = location.host == "softour.local" ? "/mapa/{z}/{x}/{y}.png" : 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

	mapa = new L.Map('mapa').setView([10.360853210444702, -63.29223632812501], 9); /*panInsideBounds(<LatLngBounds> bounds, <Pan options> options?)*/

	L.tileLayer(URL, {
	    attribution: 'Imágenes del satelite <a href="http://openstreetmap.org">Softour</a>',
	    minZoom: 9,
	    maxZoom: 17
	}).addTo(mapa);

	$("#barra-navegacion-form").on("shown.bs.tab", function() {
    	mapa.invalidateSize();
	});
}

function agregarMarcadorOSM(lalo, solo_lectura = null){
	
	if(solo_lectura){
		let lalo_nvo = [lalo[1], lalo[0]];
		mapa.flyTo(lalo_nvo, 16);
		L.marker(lalo_nvo).addTo(mapa);
	}

	else {
		/* si voy a visualizar necesito esto */
		let cont = 0;
		mapa.eachLayer(function(layer){
			if(layer instanceof L.Marker || layer instanceof L.GeoJSON)
				cont++;
		});

		if(cont == 0){
			/* var icono_marcador = L.icon({
				    iconUrl: '/images/marker-icon.png',
				    iconSize: [30, 40]
				 }),
				 icono_hospedajes = new iconoMarcador({ iconUrl: '/images/marker-icon.png' }),
		    	 icono_experiencias = new iconoMarcador({ iconUrl: '/images/marker-icon.png' });
		    */
			marcador = L.marker(lalo, {"draggable": true}).addTo(mapa).bindTooltip("Arrastra el marcador hasta la ubicación deseada");
		}
	}
}

function capturarDatosAlArrastrarMarcadorOSM(){
	/* si voy a agregar necesito esto */
	marcador.on('moveend', function(e) {
	    $("#lat").val(marcador.getLatLng().lat);
	    $("#lng").val(marcador.getLatLng().lng);
	});
}

function geocodificar_ubicacion(lugar) {
	axios.get("../../api/busqueda/geocodificada/?u="+lugar, configuracion)
		.then(function (res) {
			mapa.flyToBounds(res.data);
			mapa.invalidateSize();
		})
		.catch(function (error) {
			console.log(error);
		});
}

function activarCreacionMarcadoresOSM(lola){
	if(lola){
		let lalo = [lola[1], lola[0]];

		agregarMarcadorOSM( lalo );
		$("#lat").val(lalo[0]);
	    $("#lng").val(lalo[1]);
		mapa.flyTo(lalo, 16);
		capturarDatosAlArrastrarMarcadorOSM();
	}
	else {
		L.Control.agregaMiUbicacion = L.Control.extend({
		    onAdd: function(mapa) {
		        var btn = L.DomUtil.create('a');
		        btn.href = "#";
		        btn.id = "btn-esquina-der-mapa";
		        btn.innerHTML = '<i class="fa fa-map-marker"></i>';
		        btn.title = "Agregar una ubicación";
		        return btn;
		    },
		    onRemove: function(mapa) {
		    }
		});
		L.control.agregaMiUbicacion = function(opcs) {
		    return new L.Control.agregaMiUbicacion(opcs);
		}
		L.control.agregaMiUbicacion({ position: 'topright' }).addTo(mapa);

	    $("#btn-esquina-der-mapa").click((e) => {
    		e.preventDefault();
	    	mapa.on('click', agregarMarcadorOSM( mapa.getCenter() ));
			capturarDatosAlArrastrarMarcadorOSM();
		});
	}
}

function agregarGeocoderOSM(){
	var GeoSearchControl = window.GeoSearch.GeoSearchControl,
		OpenStreetMapProvider = window.GeoSearch.OpenStreetMapProvider,
		proveedorGeocodificacion = new OpenStreetMapProvider(),
		buscador = new GeoSearchControl({
			proveedorGeocodificacion: proveedorGeocodificacion,
			style: 'bar',
			searchLabel: 'Ingrese ubicación...',
			autoComplete: true,
			autoCompleteDelay: 250,
			marker: {
				draggable: true
			},
			notFoundMessage: 'Oh! sin resultados. Creo que estoy perdido, ¿pudiese ingresar otra referencia?',
			messageHideDelay: 3000,
		});

	mapa.addControl(buscador);
}



inicializar_mapa();

/*

	var lista_resultados_busqueda = [],
		URL,
	    iconoMarcador,
	    icono_hospedajes,
	    icono_experiencias,
	    mapa,
	    configuracion_axios,
		busqueda_url_app;




	/* ------------- API ------------------- * /


	function geocodificar_ubicacion(lugar) {
		axios.get("../../api/busqueda/geocode/"+lugar, configuracion_axios)
			.then(function (res) {
				mapa.flyToBounds(res.data);
				return "listo";
			})
			.catch(function (error) {
				console.log(error);
				return error;
			});
	}

	function buscar_entidades(cb) {

		let fronteras = mapa.getBounds(),
			tipo_entidad_url = window.location.pathname.split("/")[2],
			coordenadas_rectangulo_vista = 
				fronteras.getNorthEast().lng + "," +
				fronteras.getNorthEast().lat + ";" +

				fronteras.getSouthEast().lng + "," +
				fronteras.getSouthEast().lat + ";" +

				fronteras.getSouthWest().lng + "," +
				fronteras.getSouthWest().lat + ";" +

				fronteras.getNorthWest().lng + "," +
				fronteras.getNorthWest().lat + ";" +

				fronteras.getNorthEast().lng + "," +
				fronteras.getNorthEast().lat;

		if (tipo_entidad_url == "experiencias")
			tipo = "Experiencia";
		else
			tipo = "SDI";

		this.cb = cb;
		axios.get("../../api/busqueda/"+ tipo +"/?b="+ busqueda_url_app.get("b") + "&coord="+ coordenadas_rectangulo_vista, configuracion_axios)
			.then( (res) => {
				lista_resultados_busqueda = res.data;
				for (let i = 0; i < res.data.length; i++){
					L.geoJSON(res.data[i].geo_ubicacion, {
						pointToLayer: function (feature, latlng) {
							return L.marker(latlng, {icon: icono_hospedajes});
						}
					}).addTo(mapa);
				}
				this.cb(null);
			})
			.catch(function (error) {
				console.log(error);
			});
	}

	function eliminar_marcadores_mapa() {
		mapa.eachLayer(function(layer){
			if(layer instanceof L.Marker || layer instanceof L.GeoJSON)
				mapa.removeLayer(layer);
		})
	}

	function agregar_items_al_listado() {
		let contenido;
		for (let i = 0; i < lista_resultados_busqueda.length; i++) {
		 	contenido = '<div class="row ">\
	            <div class="htlfndr-hotel-post-wrapper col-md-12 ">\
		            <div class="htlfndr-hotel-post ">\
			            <a href="/actividad/'+lista_resultados_busqueda[i].url+'" class="htlfndr-hotel-thumbnail ">\
			            	';
			            	if (lista_resultados_busqueda[i].imagen_portada)
			            		contenido += '<img src="'+lista_resultados_busqueda[i].imagen_portada.url+'">';
			            	else
			            		contenido += '<img src="/images/sin_imagen.png">';
			            contenido += '</a>\
			             <div class="htlfndr-hotel-description ">\
					        <div class="htlfndr-description-content ">\
					            <h2 class="htlfndr-entry-title ">\
						            <a href="/actividad/'+lista_resultados_busqueda[i].url+'">'+lista_resultados_busqueda[i].nombre+'</a>\
					            </h2>\
					            <div class="htlfndr-rating-stars">\
					            	<div class="starrr calif-entidades-busqueda" data-calificacion="'+lista_resultados_busqueda[i].promedio_calificaciones+'"></div>\
						            <p class="htlfndr-hotel-reviews ">('+lista_resultados_busqueda[i].total_calificaciones+' calificaciones)</p>\
					            </div>\
					            <h5 class="htlfndr-hotel-location ">\
						            <i class="fa fa-map-marker "></i> Sitio: LUGAR EN EL MAPA\
					            </h5>\
					            <p class="htlfndr-last-booking ">Prestador Servicio: <a href="/usuario/'+lista_resultados_busqueda[i].prestador_servicio.usuario+'">'+lista_resultados_busqueda[i].prestador_servicio.nombre+'</a></p>\
					        </div>\
					        <a href="/actividad/'+lista_resultados_busqueda[i].url+'" role="button " class="htlfndr-select-hotel-button btn btn-softour">+ info</a>\
				            <!-- <div class="htlfndr-hotel-price ">\
					            <span class="htlfndr-from ">from</span>\
					            <span class="htlfndr-cost ">$ 100</span>\
					            <span class="htlfndr-per-night ">per night</span>\
					            <span class="cost ">100</span>\
				            </div> -->    \
			            </div>\
		            </div>\
	            </div>\
	    	</div>';
	    	$("#contenedor-busqueda").append(contenido);
		 };

		 /* CONTINUARA... BUAJA JA JA JA! * /
	}

}
*/
