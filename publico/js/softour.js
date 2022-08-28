
function mostrarFechas(fecha_inicio, fecha_fin) {
    moment.locale('es');
    $("#fechas-resumen").text(moment(fecha_inicio).from(moment()));

    $("#txt-fecha-inicio").text(moment(fecha_inicio).format("LLL a"));
    $("#txt-fecha-fin").text(moment(fecha_fin).format("LLL a"));
}

function mostrarEntidadesCercanas(lola) {/*
    axios.get("/api/busqueda/" + window.location.pathname.split("/")[1] + "/cerca-de/" + window.location.pathname.split("/")[2] + "?lng=" + lola[0] + "&lat=" + lola[1], configuracion)
        .then(function(res) {
            if (res.data.value.length > 0) {
                padre = "", hijo = "";

                padre = '<div class="row">'
                for (var i = 0; i < res.data.value.length; i++) {
                    hijo = '<div class="col-md-4 col-sm-6 wow zoomIn" data-wow-delay="0.1s">\
							        <div class="tarjeta_container">\
							            <div class="img_container">\
							                <a href="/' + window.location.pathname.split("/")[1] + '/' + res.data.value[i].url + '">\
							                	<img src="';
                    if (res.data.value[i].imagen_portada)
                        hijo += res.data.value[i].imagen_portada.url;
                    else
                        hijo += '/images/sin_imagen.png';
                    hijo += '" width="400" height="220" alt="image">\
							                    <div class="short_info"><span class="price">' + (res.data.value[i].precio ? '<sup>'+traduccion_publicidad[idioma].precio+' </sup>' + (idioma == "en" ? (res.data.value[i].precio/14389).toFixed(2) : res.data.value[i].precio) : traduccion_publicidad[idioma].gratis) + '</span></div>';
                    hijo += '</a>\
							            </div>\
							            <div class="tarjeta_title">\
							                <h3 class="texto"><strong>' + res.data.value[i].nombre + '</strong></h3>\
							                <div class="acciones">\
							                    <div class="calif-entidades" data-calificacion={{this.promedio_calificaciones}}>
                                    </div>
							                    <div class="interaccion">\
							                        <div class="card__share">\
			                                            <div class="card__social">\
			                                                <a class="share-icon facebook" href="#"><span class="fa fa-facebook"></span></a>\
			                                                <a class="share-icon twitter" href="#"><span class="fa fa-twitter"></span></a>\
			                                                <a class="share-icon googleplus" href="#"><span class="fa fa-google-plus"></span></a>\
			                                            </div>\
			                                            <a id="share" class="share-toggle share-icon" href="#"></a>\
			                                        </div>\
							                    </div>\
							                </div>\
							            </div>\
							        </div>\
							    </div>';
                    padre += hijo;
                };
                $(".sitios-cercanos.container").append(padre + '</div>');
            } else
                $("#cercade").remove();
        })
        .catch(function(error) {
            console.log(error);
        });
*/}

function calificarEntidad(usuario) {

	if (usuario == "Turista") {

		function guardarCalificacion(e) {
			axios.post("../../api/calificacion"+window.location.pathname+"/agregar", {"puntaje": estrellas_usuario}, configuracion)
				.then(function (res) {

					$('#mensaje-calificacion').html("Gracias! Ahora otros usuarios podrán tomar en cuenta tu voto.");
					$('#btn-calificar').empty();
					$("#calif-entidad").remove();
					$('#mensaje-calificacion').after('<div class="col-md-4" id="calif-entidad" data-calificacion="0"></div>');
					$('#calif-entidad').starrr({rating: estrellas_usuario, readOnly: true});
					$('#calif-entidad a').click(function(e){$(this).removeAttr("href")});
				})
				.catch(function (error) {
					console.log(error);
				});
		}

		axios.get('../../api/calificacion'+window.location.pathname, configuracion)
			.then(function (res){
				if (res.data.value != ""){
					$('#mensaje-calificacion').html("Ya lo has calificado con");
					$('#calif-entidad').starrr({rating: res.data.value, readOnly: true});
					$('#calif-entidad a').click(function(e){$(this).removeAttr("href")});
				}
				else {
					$('#mensaje-calificacion').html('Aún no has votado por este(a) '+window.location.pathname.split("/")[1]);
					$('#calif-entidad').starrr({change: function(e, value){ estrellas_usuario = value; }});
					$('#btn-calificar').append('<button id="boton-guardar-calificacion" class="btn-softour boton-calificar">Guardar</button>');
					$("#boton-guardar-calificacion").click(guardarCalificacion);
				}
			})
			.catch(function (error){
				console.log(error);
			})
	}
	else
		$("#calif-entidad").starrr({ rating: $("#calif-entidad").data("calificacion"), readOnly: true });
		$("#calif-entidad a").click(function(e){
			e.preventDefault();
			$(this).attr("href", "/usuario/sesionarme");
		});
}


$(document).ready(function() {

    let fechas_filtro, configuracion = {
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        }
    };

    var rutica = location.pathname.split("/")[2], 
		estrellas_usuario = 0;

    if ("lugares".indexOf(rutica) >= 0) {
        $('a[href="' + location.pathname + '"]').addClass('active');
        $('a[href="' + location.pathname + '"]').parents("ul.nav-menu > li > ul").siblings("a").addClass("active");
    } else if ("alojamientos".indexOf(rutica) >= 0) {
        $('a[href="' + location.pathname + '"]').addClass('active');
        $('a[href="' + location.pathname + '"]').parents("ul.nav-menu > li > ul").siblings("a").addClass("active");
    } else if ("gastronomia".indexOf(rutica) >= 0) {
        $('a[href="' + location.pathname + '"]').addClass('active');
        $('a[href="' + location.pathname + '"]').parents("ul.nav-menu > li > ul").siblings("a").addClass("active");
    } else if ("experiencias".indexOf(rutica) >= 0) {
        $('a[href="' + location.pathname + '"]').addClass('active');
        $('a[href="' + location.pathname + '"]').parents("ul.nav-menu > li > ul").siblings("a").addClass("active");
    } else if ("eventos".indexOf(rutica) >= 0) {
        $('a[href="' + location.pathname + '"]').addClass('active');
        $('a[href="' + location.pathname + '"]').parents("ul.nav-menu > li > ul").siblings("a").addClass("active");
    }

    if ("undefined" != typeof $.fn.datepicker) {
        fechas_filtro = $("#cuadro-fechas").datepicker({
            range: true,
            toggleSelected: false,
            multipleDatesSeparator: " - ",
            language: "es",
            inline: true,
            minDate: new Date(),
            todayButton: true
        }).data('datepicker');
        $(".datepicker--buttons").append('<span id="aplicar-fechas" class="datepicker--button" >Aplicar</span>');
        $("#aplicar-fechas").click(function(e) {
            let url = window.location.href;
            if (fechas_filtro.selectedDates) {
                if (url.lastIndexOf("/?") < 0)
                    url = url + "/?";

                if (url.lastIndexOf("desde=") < 0)
                    window.location = url + "&desde=" + fechas_filtro.selectedDates[0].toJSON().slice(0, 10) + "&hasta=" + fechas_filtro.selectedDates[1].toJSON().slice(0, 10);

                else
                    window.location = url.replace(url.match(/desde=[-0-9]+&hasta=[-0-9]+/g)[0], "desde=" + fechas_filtro.selectedDates[0].toJSON().slice(0, 10) + "&hasta=" + fechas_filtro.selectedDates[1].toJSON().slice(0, 10))
            }
        });
        $("#filtros-busqueda .dropdown-menu").click(function(e) {
            e.preventDefault();
            e.stopPropagation();
        });

        $("#aplicar-precio").click(function(e) {
            let url = window.location.href, min = $("#cuadro-precio #preciomin").val() || 0, max = $("#cuadro-precio #preciomax").val();
            if (min <= max) {

                if (url.lastIndexOf("/?") < 0)
                    url = url + "/?";

                if (url.lastIndexOf("preciomin=") < 0)
                    window.location = url + "&preciomin=" + min + "&preciomax=" + max;

                else
                    window.location = url.replace(url.match(/preciomin=[-0-9]+&preciomax=[-0-9]+/g)[0], "preciomin=" + min + "&preciomax=" + max)
            }
        });

        /*$("#inc-huespedes").click(function(e) {
            e.preventDefault();
            e.stopPropagation();
            let n = parseInt($("#texto-cantidad-huespedes").text());
            if (n < 15)
                $("#texto-cantidad-huespedes").text(++n);
        })
        $("#dec-huespedes").click(function(e) {
            e.preventDefault();
            e.stopPropagation();
            let n = parseInt($("#texto-cantidad-huespedes").text());
            if (n > 1)
                $("#texto-cantidad-huespedes").text(--n);
        })*/
    }

    if ($('#publicidad-interna').length > 0) {
        axios.get('/api/busqueda/mejor-valorados', configuracion)
            .then(function(res) {
                let padre = "",
                    hijo = "",
                    mostrar_destacados = false,
                    traduccion_publicidad = {
                    	"es": {
                    		"titulo_experiencias": "Experiencias destacadas",
                    		"titulo_eventos": "Eventos destacados",
                    		"precio": "Bs.",
                    		"gratis": "Gratis",
                    		"boton_mas": "Ver más"
                    	},
                    	"en": {
                    		"titulo_experiencias": "Featured Experiences",
                    		"titulo_eventos": "Featured Events",
                    		"precio": "$",
                    		"gratis": "Free",
                    		"boton_mas": "More"
                    	}
                    };

                /*if (res.data.entidades_alojamientos.length) {
                    padre = "", hijo = "";

                    $("#publicidad-interna .container").append('<header class="text-left  wow fadeInLeft" data-wow-delay="0.1s"> <h3>Alojamientos destacados</h3></header>');
                    padre = '<div id="alojamiento" class="row">'
                    for (var i = 0; i < res.data.entidades_alojamientos.length; i++) {
                        hijo = '<div class="col-md-4 col-sm-6 wow zoomIn" data-wow-delay="0.1s">\
							        <div class="tarjeta_container">\
							            <div class="img_container">\
							                <a href="/alojamiento/' + res.data.entidades_alojamientos[i].url + '">\
							                	<img src="';
                        if (res.data.entidades_alojamientos[i].imagen_portada)
                            hijo += res.data.entidades_alojamientos[i].imagen_portada.url;
                        else
                            hijo += '/images/sin_imagen.png';
                        hijo += '" width="800" height="533" class="img-responsive" alt="image">\
							                    <div class="short_info"><span class="price"><sup>Bs. </sup>' + res.data.entidades_alojamientos.precio + '</span></div>';
                        hijo += '</a>\
							            </div>\
							            <div class="tarjeta_title">\
							                <h3><strong>' + res.data.entidades_alojamientos[i].nombre + '</strong></h3>\
							                <div class="acciones">\
							                    <div class="calif-entidades" data-calificacion={{this.promedio_calificaciones}}>
                                    </div>
							                    <div class="interaccion">\
							                    </div>\
							                </div>\
							            </div>\
							        </div>\
							    </div>';
                        padre += hijo;
                    };
                    $("#publicidad-interna .container").append(padre + '</div>');
                    mostrar_destacados = true;
                }*/

                if (res.data.entidades_experiencias.length) {
                    padre = "", hijo = "";

                    $("#publicidad-interna .container").append('<header class="text-left  wow fadeInLeft" data-wow-delay="0.1s"> <h3>'+traduccion_publicidad[idioma].titulo_experiencias+'</h3><div class="text-right boton-mas">\
                    <a class="btn btn-primary btn-xs" href="/busqueda/experiencia">'+traduccion_publicidad[idioma].boton_mas+'</a></div></header>');
                    padre = '<div id="alojamiento" class="row">'
                    for (var i = 0; i < res.data.entidades_experiencias.length; i++) {
                        hijo = '<div class="col-md-4 col-sm-6 wow zoomIn" data-wow-delay="0.1s">\
							        <div class="tarjeta_container">\
							            <div class="img_container">\
							                <a href="/experiencia/' + res.data.entidades_experiencias[i].url + '">\
							                	<img src="';
                        if (res.data.entidades_experiencias[i].imagen_portada)
                            hijo += res.data.entidades_experiencias[i].imagen_portada.url;
                        else
                            hijo += '/images/sin_imagen.png';
                        hijo += '"  width="400" height="220" alt="image">\
							                    <div class="short_info"><span class="price">' + (res.data.entidades_experiencias[i].precio ? '<sup>'+traduccion_publicidad[idioma].precio+' </sup>' + (idioma == "en" ? (res.data.entidades_experiencias[i].precio/14389).toFixed(2) : res.data.entidades_experiencias[i].precio) : traduccion_publicidad[idioma].gratis) + '</span></div>';
                        hijo += '</a>\
							            </div>\
							            <div class="tarjeta_title">\
							                <h3 class="texto"><strong>' + res.data.entidades_experiencias[i].nombre + '</strong></h3>\
							                <div class="acciones">\
							                    <div class="calif-entidades" data-calificacion='+ res.data.entidades_experiencias[i].promedio_calificaciones+'></div>\
							                    <div class="interaccion">\
							                        <div class="card__share">\
			                                            <div class="card__social">\
			                                                <a class="share-icon facebook" href="#"><span class="fa fa-facebook"></span></a>\
			                                                <a class="share-icon twitter" href="#"><span class="fa fa-twitter"></span></a>\
			                                                <a class="share-icon googleplus" href="#"><span class="fa fa-google-plus"></span></a>\
			                                            </div>\
			                                            <a id="share" class="share-toggle share-icon" href="#"></a>\
			                                        </div>\
							                    </div>\
							                </div>\
							            </div>\
							        </div>\
							    </div>';
                        padre += hijo;
                    };
                    $("#publicidad-interna .container").append(padre + '</div>');
                    mostrar_destacados = true;
                }

                if (res.data.entidades_eventos.length) {
                    padre = "", hijo = "";

                    $("#publicidad-interna .container").append('<header class="text-left  wow fadeInLeft" data-wow-delay="0.1s"> <h3>'+traduccion_publicidad[idioma].titulo_eventos+'</h3><div class="text-right boton-mas">\
                    <a class="btn btn-primary btn-xs" href="/busqueda/evento">'+traduccion_publicidad[idioma].boton_mas+'</a></div></header>');
                    padre = '<div id="alojamiento" class="row">'
                    for (var i = 0; i < res.data.entidades_eventos.length; i++) {
                        hijo = '<div class="col-md-4 col-sm-6 wow zoomIn" data-wow-delay="0.1s">\
							        <div class="tarjeta_container">\
							            <div class="img_container">\
							                <a href="/evento/' + res.data.entidades_eventos[i].url + '">\
							                	<img src="';
                        if (res.data.entidades_eventos[i].imagen_portada)
                            hijo += res.data.entidades_eventos[i].imagen_portada.url;
                        else
                            hijo += '/images/sin_imagen.png';
                        hijo += '"  width="400" height="220" alt="image">\
							                    <div class="short_info"><span class="price">' + (res.data.entidades_eventos[i].precio ? '<sup>'+traduccion_publicidad[idioma].precio+' </sup>' + (idioma == "en" ? (res.data.entidades_eventos[i].precio/14389).toFixed(2) : res.data.entidades_eventos[i].precio) : traduccion_publicidad[idioma].gratis) + '</span></div>';
                        hijo += '</a>\
							            </div>\
							            <div class="tarjeta_title">\
							                <h3 class="texto"><strong>' + res.data.entidades_eventos[i].nombre + '</strong></h3>\
							                <div class="acciones">\
							                    <div class="calif-entidades" data-calificacion='+ res.data.entidades_eventos[i].promedio_calificaciones+'></div>\
							                    <div class="interaccion">\
							                        <div class="card__share">\
			                                            <div class="card__social">\
			                                                <a class="share-icon facebook" href="#"><span class="fa fa-facebook"></span></a>\
			                                                <a class="share-icon twitter" href="#"><span class="fa fa-twitter"></span></a>\
			                                                <a class="share-icon googleplus" href="#"><span class="fa fa-google-plus"></span></a>\
			                                            </div>\
			                                            <a id="share" class="share-toggle share-icon" href="#"></a>\
			                                        </div>\
							                    </div>\
							                </div>\
							            </div>\
							        </div>\
							    </div>';
                        padre += hijo;
                    };
                    $("#publicidad-interna .container").append(padre + '</div>');
                    mostrar_destacados = true;
                }

                /*if (res.data.entidades_gastronomicas.length) {
                    padre = "", hijo = "";

                    $("#publicidad-interna .container").append('<header class="text-left  wow fadeInLeft" data-wow-delay="0.1s"> <h3>Restaurantes destacados</h3></header>');
                    padre = '<div id="alojamiento" class="row">'
                    for (var i = 0; i < res.data.entidades_gastronomicas.length; i++) {
                        hijo = '<div class="col-md-4 col-sm-6 wow zoomIn" data-wow-delay="0.1s">\
							        <div class="tarjeta_container">\
							            <div class="img_container">\
							                <a href="/gastronomia/' + res.data.entidades_gastronomicas[i].url + '">\
							                	<img src="';
                        if (res.data.entidades_gastronomicas[i].imagen_portada)
                            hijo += res.data.entidades_gastronomicas[i].imagen_portada.url;
                        else
                            hijo += '/images/sin_imagen.png';
                        hijo += '" width="800" height="533" class="img-responsive" alt="image">\
							                    <div class="short_info"><span class="price">' + (res.data.entidades_gastronomicas.precio ? (idioma == "es" ? '<sup>Bs. </sup>' : '<sup>$ </sup>')+res.data.entidades_gastronomicas.precio : traduccion_publicidad[idioma].gratis) + '</span></div>';
                        hijo += '</a>\
							            </div>\
							            <div class="tarjeta_title">\
							                <h3><strong>' + res.data.entidades_gastronomicas[i].nombre + '</strong></h3>\
							                <div class="acciones">\
							                    <div class="calif-entidades" data-calificacion={{this.promedio_calificaciones}}>
                                    </div>
							                    <div class="interaccion">\
							                    </div>\
							                </div>\
							            </div>\
							        </div>\
							    </div>';
                        padre += hijo;
                    };
                    $("#publicidad-interna .container").append(padre + '</div>');
                    mostrar_destacados = true;
                }*/

                if (mostrar_destacados) {
                	$("#publicidad-interna").css("display", "block");
                	$(".calif-entidades").each(function() { $(this).starrr({ rating: $(this).data("calificacion"), readOnly: true }) });
                }
            })
            .catch(function(error) {
                console.log(error);
            })
    }

	if ($('#listado-favoritos').length > 0) {
		axios.get("/api/favoritos/"+ window.location.pathname.split("/").pop(), configuracion)
			.then(function(res){
				let contenido = "";

				if(res.data.lugares.length > 0){
					contenido = '<header class="section-header text-left"><br><br>\
				                	<h2 id="titulo_submenu">Lugares</h2>\
				                </header>\
				                <div class="row item-blocks-connected">';
					for (var i = 0; i < res.data.lugares.length; i++) {
						contenido += '<div class="col-xs-12 col-md-6">\
				            <a class="item-block" href="#">\
				                <header>\
				                    <img src="'+res.data.lugares[i].imagen_portada+'" alt="">\
				                    <div class="hgroup">\
				                        <h4>'+res.data.lugares[i].nombre+'</h4>\
				                        <span class="location">'+res.data.lugares[i].ciudad+'</span>\
				                    </div>\
				                </header>\
				            </a>\
				        </div>';
					};
					$("#listado-favoritos").append(contenido+ "</div>");
				}

				contenido = "";
				if(res.data.eventos.length > 0){
					contenido = '<header class="section-header text-left"><br><br>\
				                	<h2 id="titulo_submenu">Eventos</h2>\
				                </header>\
				                <div class="row item-blocks-connected">';
					for (var i = 0; i < res.data.eventos.length; i++) {
						contenido += '<div class="col-xs-12 col-md-6">\
				            <a class="item-block" href="#">\
				                <header>\
				                    <img src="'+res.data.eventos[i].imagen_portada+'" alt="">\
				                    <div class="hgroup">\
				                        <h4>'+res.data.eventos[i].nombre+'</h4>\
				                        <span class="location">'+res.data.eventos[i].ciudad+'</span>\
				                    </div>\
				                </header>\
				            </a>\
				        </div>';
					};
					$("#listado-favoritos").append(contenido+ "</div>");
				}

				contenido = "";
				if(res.data.experiencias.length > 0){
					contenido = '<header class="section-header text-left"><br><br>\
				                	<h2 id="titulo_submenu">Experiencias</h2>\
				                </header>\
				                <div class="row item-blocks-connected">';
					for (var i = 0; i < res.data.experiencias.length; i++) {
						contenido += '<div class="col-xs-12 col-md-6">\
				            <a class="item-block" href="#">\
				                <header>\
				                    <img src="'+res.data.experiencias[i].imagen_portada+'" alt="">\
				                    <div class="hgroup">\
				                        <h4>'+res.data.experiencias[i].nombre+'</h4>\
				                        <span class="location">'+res.data.experiencias[i].ciudad+'</span>\
				                    </div>\
				                </header>\
				            </a>\
				        </div>';
					};
					$("#listado-favoritos").append(contenido+ "</div>");
				}

				contenido = "";
				if(res.data.alojamientos.length > 0){
					contenido = '<header class="section-header text-left"><br><br>\
				                	<h2 id="titulo_submenu">Alojamientos</h2>\
				                </header>\
				                <div class="row item-blocks-connected">';
					for (var i = 0; i < res.data.alojamientos.length; i++) {
						contenido += '<div class="col-xs-12 col-md-6">\
				            <a class="item-block" href="#">\
				                <header>\
				                    <img src="'+res.data.alojamientos[i].imagen_portada+'" alt="">\
				                    <div class="hgroup">\
				                        <h4>'+res.data.alojamientos[i].nombre+'</h4>\
				                        <span class="location">'+res.data.alojamientos[i].ciudad+'</span>\
				                    </div>\
				                </header>\
				            </a>\
				        </div>';
					};
					$("#listado-favoritos").append(contenido+ "</div>");
				}

				contenido = "";
				if(res.data.gastronomias.length > 0){
					contenido = '<header class="section-header text-left"><br><br>\
				                	<h2 id="titulo_submenu">Gastronomía</h2>\
				                </header>\
				                <div class="row item-blocks-connected">';
					for (var i = 0; i < res.data.gastronomias.length; i++) {
						contenido += '<div class="col-xs-12 col-md-6">\
				            <a class="item-block" href="#">\
				                <header>\
				                    <img src="'+res.data.gastronomias[i].imagen_portada+'" alt="">\
				                    <div class="hgroup">\
				                        <h4>'+res.data.gastronomias[i].nombre+'</h4>\
				                        <span class="location">'+res.data.gastronomias[i].ciudad+'</span>\
				                    </div>\
				                </header>\
				            </a>\
				        </div>';
					};
					$("#listado-favoritos").append(contenido+ "</div>");
				}
				
			})
			.catch(function(error){
				console.log(error);
			})
	}

    /*if ($('.sitios-cercanos').length > 0) {
     */


    if ($("#sugerencias-ciudad").length > 0) {
        let cp = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('ciudad'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            remote: {
                url: "../../api/busqueda/sugerencias/Ubicacion/?pais=Venezuela&c=%CIUDAD",
                wildcard: "%CIUDAD"
            }
        });

        $('#ciudad').typeahead({
            highlight: true,
            hint: true,
            minLength: 1
        }, {
            name: 'lista-ciudades',
            source: cp.ttAdapter(),
            display: 'ciudad',
            limit: 5,
            templates: {
                /*empty: '<p class="msj-no-sugerencias">No hubo resultados. Por favor, intentalo nuevamente</p>',*/
                suggestion: Handlebars.compile("<p class='item-sugerencias'>{{ciudad}}</p>")
            }
        });
    }

    if ($('#sugerencias-busqueda')[0]) {
    	let eventos, lugares, alojamientos, experiencias, gastronomias, listados_resultados = [];

    	if ("lugares".indexOf(rutica) >= 0) {
	        lugares = new Bloodhound({
	            datumTokenizer: Bloodhound.tokenizers.whitespace(["etiquetas", "nombre"]),
	            queryTokenizer: Bloodhound.tokenizers.whitespace,
	            remote: {
	                url: "../../api/busqueda/sugerencias/SDI/?b=%QUERY",
	                wildcard: "%QUERY"
	            }
	        });
	        listados_resultados.push({
	            name: 'lista-lugares',
	            source: lugares.ttAdapter(),
	            display: 'nombre',
	            limit: Infinity,
	            templates: {
	                header: "<h4 class='titulares-cuadro-sugerencias'>Lugares</h4>",
	                suggestion: Handlebars.compile("<a class='item-sugerencias' href='/lugar/{{url}}'>{{nombre}} {{#if promedio_calificaciones}}<span> {{promedio_calificaciones}}  <i class='fa fa-star'></i></span> {{/if}}</a>")
	            }
	        })
	    } else if ("alojamientos".indexOf(rutica) >= 0) {
	        alojamientos = new Bloodhound({
	            datumTokenizer: Bloodhound.tokenizers.whitespace(["etiquetas", "nombre"]),
	            queryTokenizer: Bloodhound.tokenizers.whitespace,
	            remote: {
	                url: "../../api/busqueda/sugerencias/Alojamiento/?b=%QUERY",
	                wildcard: "%QUERY"
	            }
	        });
	        listados_resultados.push({
	            name: 'lista-alojamientos',
	            source: alojamientos.ttAdapter(),
	            display: 'nombre',
	            limit: Infinity,
	            templates: {
	                header: "<h4 class='titulares-cuadro-sugerencias'>Alojamientos</h4>",
	                suggestion: Handlebars.compile("<a class='item-sugerencias' href='/alojamiento/{{url}}'>{{nombre}} {{#if promedio_calificaciones}}<span> {{promedio_calificaciones}}  <i class='fa fa-star'></i></span> {{/if}}</a>")
	            }
	        })
	    } else if ("gastronomia".indexOf(rutica) >= 0) {
	        gastronomias = new Bloodhound({
	            datumTokenizer: Bloodhound.tokenizers.whitespace(["etiquetas", "nombre"]),
	            queryTokenizer: Bloodhound.tokenizers.whitespace,
	            remote: {
	                url: "../../api/busqueda/sugerencias/Gastronomia/?b=%QUERY",
	                wildcard: "%QUERY"
	            }
	        });
	        listados_resultados.push({
	            name: 'lista-gastronomia',
	            source: gastronomias.ttAdapter(),
	            display: 'nombre',
	            limit: Infinity,
	            templates: {
	                header: "<h4 class='titulares-cuadro-sugerencias'>Gastronomia</h4>",
	                suggestion: Handlebars.compile("<a class='item-sugerencias' href='/gastronomia/{{url}}'>{{nombre}} {{#if promedio_calificaciones}}<span> {{promedio_calificaciones}}  <i class='fa fa-star'></i></span> {{/if}}</a>")
	            }
	        })
	    } else if ("experiencias".indexOf(rutica) >= 0) {
	        experiencias = new Bloodhound({
	            datumTokenizer: Bloodhound.tokenizers.whitespace(["etiquetas", "nombre"]),
	            queryTokenizer: Bloodhound.tokenizers.whitespace,
	            remote: {
	                url: "../../api/busqueda/sugerencias/Experiencia/?b=%QUERY",
	                wildcard: "%QUERY"
	            }
	        });
	        listados_resultados.push({
	            name: 'lista-experiencias',
	            source: experiencias.ttAdapter(),
	            display: 'nombre',
	            limit: 3,
	            templates: {
	                header: "<h4 class='titulares-cuadro-sugerencias'>Experiencias</h4>",
	                suggestion: Handlebars.compile("<a class='item-sugerencias' href='/experiencia/{{url}}'>{{nombre}} {{#if promedio_calificaciones}}<span> {{promedio_calificaciones}}  <i class='fa fa-star'></i></span> {{/if}}</a>")
	            }
	        })
	    } else if ("eventos".indexOf(rutica) >= 0) {
	        eventos = new Bloodhound({
	            datumTokenizer: Bloodhound.tokenizers.whitespace(["etiquetas", "nombre"]),
	            queryTokenizer: Bloodhound.tokenizers.whitespace,
	            remote: {
	                url: "../../api/busqueda/sugerencias/Evento/?b=%QUERY",
	                wildcard: "%QUERY"
	            }
	        });
	        listados_resultados.push({
	            name: 'lista-eventos',
	            source: eventos.ttAdapter(),
	            display: 'nombre',
	            limit: 3,
	            templates: {
	                header: "<h4 class='titulares-cuadro-sugerencias'>Eventos</h4>",
	                suggestion: Handlebars.compile("<a class='item-sugerencias' href='/evento/{{url}}'>{{nombre}} {{#if promedio_calificaciones}}<span> {{promedio_calificaciones}}  <i class='fa fa-star'></i></span> {{/if}}</a>")
	            }
	        })
	    } else if ("general".indexOf(rutica) >= 0 || window.location.pathname.length == 1) {

	        experiencias = new Bloodhound({
	            datumTokenizer: Bloodhound.tokenizers.whitespace(["etiquetas", "nombre"]),
	            queryTokenizer: Bloodhound.tokenizers.whitespace,
	            remote: {
	                url: "../../api/busqueda/sugerencias/Experiencia/?b=%QUERY",
	                wildcard: "%QUERY"
	            }
	        });
	        listados_resultados.push({
	            name: 'lista-experiencias',
	            source: experiencias.ttAdapter(),
	            display: 'nombre',
	            limit: 3,
	            templates: {
	                header: "<h4 class='titulares-cuadro-sugerencias'>Experiencias</h4>",
	                suggestion: Handlebars.compile("<a class='item-sugerencias' href='/experiencia/{{url}}'>{{nombre}} {{#if promedio_calificaciones}}<span> {{promedio_calificaciones}}  <i class='fa fa-star'></i></span> {{/if}}</a>")
	            }
	        })

	        gastronomias = new Bloodhound({
	            datumTokenizer: Bloodhound.tokenizers.whitespace(["etiquetas", "nombre"]),
	            queryTokenizer: Bloodhound.tokenizers.whitespace,
	            remote: {
	                url: "../../api/busqueda/sugerencias/Gastronomia/?b=%QUERY",
	                wildcard: "%QUERY"
	            }
	        });
	        listados_resultados.push({
	            name: 'lista-gastronomia',
	            source: gastronomias.ttAdapter(),
	            display: 'nombre',
	            limit: Infinity,
	            templates: {
	                header: "<h4 class='titulares-cuadro-sugerencias'>Gastronomia</h4>",
	                suggestion: Handlebars.compile("<a class='item-sugerencias' href='/gastronomia/{{url}}'>{{nombre}} {{#if promedio_calificaciones}}<span> {{promedio_calificaciones}}  <i class='fa fa-star'></i></span> {{/if}}</a>")
	            }
	        })

	        lugares = new Bloodhound({
	            datumTokenizer: Bloodhound.tokenizers.whitespace(["etiquetas", "nombre"]),
	            queryTokenizer: Bloodhound.tokenizers.whitespace,
	            remote: {
	                url: "../../api/busqueda/sugerencias/SDI/?b=%QUERY",
	                wildcard: "%QUERY"
	            }
	        });
	        listados_resultados.push({
	            name: 'lista-lugares',
	            source: lugares.ttAdapter(),
	            display: 'nombre',
	            limit: Infinity,
	            templates: {
	                header: "<h4 class='titulares-cuadro-sugerencias'>Lugares</h4>",
	                suggestion: Handlebars.compile("<a class='item-sugerencias' href='/lugar/{{url}}'>{{nombre}} {{#if promedio_calificaciones}}<span> {{promedio_calificaciones}}  <i class='fa fa-star'></i></span> {{/if}}</a>")
	            }
	        })
	        alojamientos = new Bloodhound({
	            datumTokenizer: Bloodhound.tokenizers.whitespace(["etiquetas", "nombre"]),
	            queryTokenizer: Bloodhound.tokenizers.whitespace,
	            remote: {
	                url: "../../api/busqueda/sugerencias/Alojamiento/?b=%QUERY",
	                wildcard: "%QUERY"
	            }
	        });
	        listados_resultados.push({
	            name: 'lista-alojamientos',
	            source: alojamientos.ttAdapter(),
	            display: 'nombre',
	            limit: Infinity,
	            templates: {
	                header: "<h4 class='titulares-cuadro-sugerencias'>Alojamientos</h4>",
	                suggestion: Handlebars.compile("<a class='item-sugerencias' href='/alojamiento/{{url}}'>{{nombre}} {{#if promedio_calificaciones}}<span> {{promedio_calificaciones}}  <i class='fa fa-star'></i></span> {{/if}}</a>")
	            }
	        })

	        eventos = new Bloodhound({
	            datumTokenizer: Bloodhound.tokenizers.whitespace(["etiquetas", "nombre"]),
	            queryTokenizer: Bloodhound.tokenizers.whitespace,
	            remote: {
	                url: "../../api/busqueda/sugerencias/Evento/?b=%QUERY",
	                wildcard: "%QUERY"
	            }
	        });
	        listados_resultados.push({
	            name: 'lista-eventos',
	            source: eventos.ttAdapter(),
	            display: 'nombre',
	            limit: 3,
	            templates: {
	                header: "<h4 class='titulares-cuadro-sugerencias'>Eventos</h4>",
	                suggestion: Handlebars.compile("<a class='item-sugerencias' href='/evento/{{url}}'>{{nombre}} {{#if promedio_calificaciones}}<span> {{promedio_calificaciones}}  <i class='fa fa-star'></i></span> {{/if}}</a>")
	            }
	        })
	    }


        $('#cuadro-buscar').typeahead({
            highlight: true,
            hint: true,
            minLength: 3
        }, listados_resultados);

        $("#sugerencias-busqueda").on("typeahead:select", function(ev, sugerencia) {
            ev.preventDefault();
            location.href = $(".tt-cursor").attr("href");
        });
    }

    if ($(".corazon-favoritos").length > 0) {
        $(".corazon-favoritos.sesionado").each(function(i, e) {
            var tarjeta_seleccionada = $(e),
                url_nueva;

            axios.get($(e).attr("href").toLowerCase() + "/existe", configuracion)
                .then(function(res) {
                    url_nueva = $(tarjeta_seleccionada).attr("href").toLowerCase() + "/eliminar";
                    $(tarjeta_seleccionada).children("img").attr("src", "/images/like-lleno.png");
                    $(tarjeta_seleccionada).attr("href", url_nueva);
                })
                .catch(function(error) {
                    url_nueva = $(tarjeta_seleccionada).attr("href").toLowerCase() + "/agregar";
                    $(tarjeta_seleccionada).attr("href", url_nueva);
                })
        })

        $(".corazon-favoritos").click(function(e) {
            e.preventDefault();
            e.stopPropagation();
            var tarjeta_seleccionada = $(this),
                url_nueva;

            if ($(this).attr("href") == "/usuario/sesionarme")
                window.location = "/usuario/sesionarme";

            else {
                if ($(tarjeta_seleccionada).attr("href").indexOf("agregar") >= 0)
                    axios.post($(tarjeta_seleccionada).attr("href"), {}, configuracion)
                    .then(function(res) {
                        url_nueva = $(tarjeta_seleccionada).attr("href").replace("agregar", "eliminar");
                        $(tarjeta_seleccionada).children("img").attr("src", "/images/like-lleno.png");
                        $(tarjeta_seleccionada).attr("href", url_nueva);
                    })
                    .catch(function(error) {
                        url_nueva = $(tarjeta_seleccionada).attr("href").replace("eliminar", "agregar");
                        $(tarjeta_seleccionada).children("img").attr("src", "/images/like.png");
                        $(tarjeta_seleccionada).attr("href", url_nueva);
                    })
                else if ($(tarjeta_seleccionada).attr("href").indexOf("eliminar") >= 0)
                    axios.delete($(tarjeta_seleccionada).attr("href"), configuracion)
                    .then(function(res) {
                        url_nueva = $(tarjeta_seleccionada).attr("href").replace("agregar", "eliminar");
                        $(tarjeta_seleccionada).children("img").attr("src", "/images/like-lleno.png");
                        $(tarjeta_seleccionada).attr("href", url_nueva);
                    })
                    .catch(function(error) {
                        url_nueva = $(tarjeta_seleccionada).attr("href").replace("eliminar", "agregar");
                        $(tarjeta_seleccionada).children("img").attr("src", "/images/like.png");
                        $(tarjeta_seleccionada).attr("href", url_nueva);
                    })
            }
        });
    }

    if (window.Dropzone !== undefined)
        Dropzone.options.formSubirFotosAlbum = {
            dictDefaultMessage: "Arrastre las imagenes aquí"
        };

    $(".calif-entidades").each(function() { $(this).starrr({ rating: $(this).data("calificacion"), readOnly: true }) });



    if ($('.descripcion-entidad-etiquetas')[0]) {
        $('.descripcion-entidad-etiquetas').html($('.descripcion-entidad-etiquetas').html().replace(/,/g, " "));
    }



});
//////////////////////////////////script//////////////////////////
/*$(document).ready(function($) {

    $('.card__share > a').on('click', function(e) {
        e.preventDefault() // prevent default action - hash doesn't appear in url
        $(this).parent().find('div').toggleClass('card__social--active');
        $(this).toggleClass('share-expanded');
    });

});*/