let Ubicacion = require("../modelos/ubicacion"),
    { Administrador } = require("../modelos/persona");


module.exports = class Configuracion {
    /*
        Administra todos los parametros de la aplicación según el entorno en el que se ejecute
    */

    constructor() {
        this.SIN_IMAGEN = '/images/sin_imagen.png';
        this.opciones_joi = {
            "abortEarly": false,
            "convert": true,
            "language": {
                "any": {
                    "unknown": 'campo no permitido',
                    "invalid": 'contiene un valor no valido',
                    "empty": 'no puede estar vacío',
                    "required": 'se requiere llenar este campo',
                    "allowOnly": 'debe ser uno de estos: {{valids}}',
                    "default": 'hubo un error al ejecutar el metodo por defecto'
                },
                "array": {
                    "base": 'debe ser un Array',
                    "includes": "el valor de la posición {{pos}} no coincide con ningún tipo permitido'",
                    "includesSingle": "el valor de '{{!key}}' no coincide con ningún tipo permitido'",
                    "includesOne": "en la posición {{pos}} hubo un fallo porque {{reason}}'",
                    "includesOneSingle": "en el valor de '{{!key}}' hubo un fallo porque {{reason}}'",
                    "includesRequiredUnknowns": "no contiene los valores {{unknownMisses}} requeridos'",
                    "includesRequiredKnowns": "no contiene {{knownMisses}}'",
                    "includesRequiredBoth": "no contiene {{knownMisses}} y otro(s) valor(es) requeridos {{unknownMisses}}'",
                    "excludes": "la posición {{pos}} contiene un valor excluido'",
                    "excludesSingle": "el valor '{{!key}}' contiene un valor excluido'",
                    "min": "debe contener al menos {{limit}} items'",
                    "max": "debe contener una cantidad menor o igual a {{limit}} items'",
                    "length": "debe contener máximo {{limit}} items'",
                    "ordered": "en la posición {{pos}} hubo un fallo porque {{reason}}'",
                    "orderedLength": "en la posición {{pos}} hubo un fallo porque el Array debe contener al menos {{limit}} items'",
                    "sparse": "no debe ser un Array esparcido'",
                    "unique": "contiene un valor duplicado",
                },
                "number": {
                    "base": "debe ser un número'",
                    "min": "debe ser mayor  o igual a {{limit}}'",
                    "max": "debe ser menor o igual a {{limit}}'",
                    "less": "debe ser menor a {{limit}}'",
                    "greater": "debe ser mayor a {{limit}}'",
                    "float": "debe ser float o double'",
                    "integer": "debe ser un entero'",
                    "negative": "debe ser un número negativo'",
                    "positive": "debe ser un número positivo'",
                    "precision": "no debe haber mas de {{limit}} decimales'",
                    "ref": "la referencia '{{ref}}' no es un número'",
                    "multiple": "debe ser un multiplo de {{multiple}}",
                },
                "string": {
                    "base": "debe ser una cadena'",
                    "min": "debe tener una longitud de al menos {{limit}} caracteres'",
                    "max": "debe tener una longitud de menor o igual a {{limit}} caracteres'",
                    "length": "la longitud de ser de {{limit}} caracteres'",
                    "alphanum": "debe contener solo caracteres alfa-númericos'",
                    "token": "debe contener solo caracteres alfa-númericos y guión bajo'",
                    "regex": {
                        "base": "Al parecer ingresó caracteres no permitidos, por favor verifique",
                        "name": "para el valor '{{!value}}' no se pudo encontrar coincidencias con el patron requerido {{name}} pattern'",
                        "invert": {
                            "base": "para el valor '{{!value}}' las conincidencias del patron invertido: {{pattern}}'",
                            "name": "para el valor '{{!value}}' las coincidencias del patron {{name}}",
                        }
                    },
                    "email": "debe ser un correo valido'",
                    "uri": "debe ser una uri valida'",
                    "uriRelativeOnly": "debe ser una uri relativa valida'",
                    "uriCustomScheme": "debe ser una uri valida con un esquema que coincida con el patron de esquema {{scheme}}'",
                    "isoDate": "debe ser una fecha ISO 8601 valida'",
                    "guid": "debe ser una GUID valida'",
                    "hex": "debe contener solo caracteres hexadecimales'",
                    "base64": "debe ser una cadena base64 valida'",
                    "hostname": "debe ser una hostname valido'",
                    "lowercase": "solo caracteres en minúscula'",
                    "uppercase": "solo caracteres en mayuscula'",
                    "trim": "no debe contener espacios ni al comienzo o final de la cadena'",
                    "creditCard": "debe ser una tarjeta de credito'",
                    "ref": "hace referencia a '{{ref}}', el cual no es un número'",
                    "ip": "debe ser una direccion de IP valida con una {{cidr}} CIDR'",
                    "ipVersion": "debe ser una direccion de IP valida de una de las siguientes versiones {{version}} con una {{cidr}} CIDR",
                },
                "object": {
                    "base": "debe ser un objeto'",
                    "child": "{{reason}}",
                    "min": "debe tener al menos de {{limit}} campos'",
                    "max": "debe tener un maximo de {{limit}} campos'",
                    "length": "debe tener {{limit}} campos'",
                    "allowUnknown": "Este campo no esta permitido'",
                    "with": "!!'{{mainWithLabel}}' falta el par requerido '{{peerWithLabel}}''",
                    "without": "!!'{{mainWithLabel}}' hay un conflict con el par requerido '{{peerWithLabel}}''",
                    "missing": "debe contener al menos uno de {{peersWithLabels}}'",
                    "type": "debe ser una instancia de '{{type}}''",
                    "schema": "debe ser una instancia de Joi",
                }
            }
        };

        this.google = {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL
        };
        this.twitter = {
            clientID: process.env.TWITTER_CLIENT_ID,
            clientSecret: process.env.TWITTER_SECRET,
            callbackURL: process.env.TWITTER_CALLBACK_URL
        };

        this.facebook = {
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_SECRET,
            callbackURL: process.env.FACEBOOK_CALLBACK_URL
        };

        this.puerto = 4000;
        this.RUTA_ARCHIVOS_PUBLICOS = "./publico";
        this.RUTA_ARCHIVOS_SUBIDOS = './publico/subidas';

        this.bd = 'mongodb://127.0.0.1/softour';
    }

    cargar_datos() {
        Ubicacion.find((error, localidades) => {
            if (error) return next(error);
            if (localidades.length == 0){

                let lista_ubicaciones_sucre = [
                    {"ciudad": "Araya", "codigo_postal": 6102, "municipio": "Cruz Salmerón Acosta", "lalo_sup_izq": [10.562873684953255,-64.2819929122925], "lalo_inf_der": [10.58742618631411,-64.22410011291505]},
                    {"ciudad": "Chacopata", "codigo_postal": 6101, "municipio": "Cruz Salmerón Acosta"},
                    // manicuare -- Cruz Salmerón Acosta


                    {"ciudad": "Espin", "codigo_postal": 6110, "municipio": "Mejía"},
                    {"ciudad": "San Antonio del Golfo", "codigo_postal": 6110, "municipio": "Mejía", "lalo_sup_izq": [ 10.451265925214617,-63.77224445343018], "lalo_inf_der": [10.436156755181035,-63.797693252563484]},
                    // san antonio jose de sucre --- Arismendi


                    {"ciudad": "Acarigua", "codigo_postal": 6106, "municipio": "Montes"},
                    {"ciudad": "Arenas", "codigo_postal": 6106, "municipio": "Montes"},
                    {"ciudad": "Cumanacoa", "codigo_postal": 6106, "municipio": "Montes", "lalo_sup_izq": [10.219314738850382,-63.97673606872559], "lalo_inf_der": [10.268471922667292,-63.86095046997071]},
                    {"ciudad": "Cocollar", "codigo_postal": 6101, "municipio": "Montes"},
                    // {"ciudad": "Las Piedras de Cocollar", "codigo_postal": 6101, "municipio": ""},


                    {"ciudad": "Cariaco", "codigo_postal": 6126, "municipio": "Ribero", "lalo_sup_izq": [10.510935732838998,-63.52612495422364], "lalo_inf_der": [10.480722472115904,-63.57702255249024]},
                    {"ciudad": "Muelle de Cariaco", "codigo_postal": 6101, "municipio": "Ribero"},
                    {"ciudad": "Catuaro", "codigo_postal": 6150, "municipio": "Ribero"},
                    {"ciudad": "Santa Cruz", "codigo_postal": 6150, "municipio": "Ribero"},


                    {"ciudad": "Cumaná", "codigo_postal": 6101, "municipio": "Sucre", "lalo_sup_izq": [10.486292736450036,-64.06986236572267], "lalo_inf_der": [10.388038871123564,-64.30143356323244]},
                    {"ciudad": "Carúpano", "codigo_postal": 6150, "municipio": "", "lalo_sup_izq": [10.594470956973122,-63.36175918579102], "lalo_inf_der": [10.692658986616914,-63.13018798828126]},
                    {"ciudad": "Macuro", "codigo_postal": 6150, "municipio": ""},
                    {"ciudad": "Nueva Colombia", "codigo_postal": 6150, "municipio": ""},
                    {"ciudad": "Playa Grande", "codigo_postal": 6150, "municipio": ""},
                    {"ciudad": "Punta Brava (Tunapuycito)", "codigo_postal": 6154, "municipio": ""},
                    {"ciudad": "Quebrada Seca", "codigo_postal": 6101, "municipio": ""},
                    {"ciudad": "Río Casanay", "codigo_postal": 6168, "municipio": ""},
                    {"ciudad": "San Juan de Unare", "codigo_postal": 6150, "municipio": ""},
                    {"ciudad": "Río Grande", "codigo_postal": 6160, "municipio": ""},
                    {"ciudad": "Altos de Sucre", "codigo_postal": 6123, "municipio": ""},
                    {"ciudad": "Bohordal", "codigo_postal": 6150, "municipio": ""},
                    {"ciudad": "Caigüire", "codigo_postal": 6101, "municipio": ""},
                    {"ciudad": "Campearito", "codigo_postal": 6150, "municipio": ""},
                    {"ciudad": "Guanoco", "codigo_postal": 6150, "municipio": ""},
                    {"ciudad": "Guarapiche", "codigo_postal": 6168, "municipio": ""},
                    {"ciudad": "Guarauna", "codigo_postal": 6150, "municipio": ""},
                    {"ciudad": "Guariquen", "codigo_postal": 6150, "municipio": ""},
                    {"ciudad": "El Peñón", "codigo_postal": 6101, "municipio": ""},
                    {"ciudad": "Saucedo", "codigo_postal": 6150, "municipio": ""},
                    {"ciudad": "Valle de San Bonifacio", "codigo_postal": 6150, "municipio": ""},
                    {"ciudad": "Yoco", "codigo_postal": 6150, "municipio": ""},
                    {"ciudad": "Agua Fria", "codigo_postal": 6150, "municipio": ""},
                    {"ciudad": "Guaca", "codigo_postal": 6150, "municipio": ""},
                    {"ciudad": "Guanoco", "codigo_postal": 6150, "municipio": ""},
                    {"ciudad": "Guayana", "codigo_postal": 6150, "municipio": ""},
                    {"ciudad": "Las Vegas", "codigo_postal": 6101, "municipio": ""},
                    {"ciudad": "Los Altos De Santa fe", "codigo_postal": 6101, "municipio": ""},
                    {"ciudad": "Los Arroyos", "codigo_postal": 6150, "municipio": ""},
                    {"ciudad": "Río Salado", "codigo_postal": 6150, "municipio": ""},
                    {"ciudad": "Río Seco", "codigo_postal": 6150, "municipio": ""},
                    {"ciudad": "San Vicente", "codigo_postal": 6150, "municipio": ""},
                    {"ciudad": "Casanay", "codigo_postal": 6168, "municipio": ""},


                    {"ciudad": "Güiria", "codigo_postal": 6161, "municipio": "Valdez"},
                    {"ciudad": "Cristóbal Colón", "codigo_postal": 6160, "municipio": "Valdez"},
                    // bideau, punta de piedras -- valdez

                    {"ciudad": "Campo Claro", "codigo_postal": 6101, "municipio": "Mariño"},
                    {"ciudad": "Marabal", "codigo_postal": 6156, "municipio": "Mariño"},
                    {"ciudad": "Irapa", "codigo_postal": 6156, "municipio": "Mariño"},
                    // san antonio de irapa -- Mariño

                    {"ciudad": "El Morro de Puerto Santo", "codigo_postal": 6163, "municipio": "Arismendi"},
                    {"ciudad": "Río Caribe", "codigo_postal": 6164, "municipio": "Arismendi"},
                    {"ciudad": "Puerto Santo", "codigo_postal": 6163, "municipio": "Arismendi"},

                    {"ciudad": "Yaguaraparo", "codigo_postal": 6155, "municipio": "Cajigal"},
                    {"ciudad": "El Paujil", "codigo_postal": 6150, "municipio": "Cajigal"},
                    //libertad -- Cajigal

                    {"ciudad": "El Rincón", "codigo_postal": 6150, "municipio": "Benítez"},
                    {"ciudad": "Tunapuicito", "codigo_postal": 6150, "municipio": "Benítez"},
                    {"ciudad": "El Pilar", "codigo_postal": 6152, "municipio": "Benítez"},
                    //unión -- Benítez


                    // mariño, rómulo gallegos - Andrés Eloy Blanco


                    {"ciudad": "Macarapana", "codigo_postal": 6101, "municipio": "Bermúdez"},
                    //santa rosa, santa catalina, bolívar, santa teresa


                    {"ciudad": "Marigüitar", "codigo_postal": 6107, "municipio": "Bolívar"},

                    {"ciudad": "San José de Aerocuar", "codigo_postal": 6167, "municipio": "Andrés Mata"},
                    // tavera acosta -- andrés mata


                    {"ciudad": "Santa Fe", "codigo_postal": 6101, "municipio": "Sucre"},
                    // SANTA inéz, altagracia, ayacucho, san juan, valentin valiente, raúl león -- sucre


                    {"ciudad": "Santa María de Cariaco", "codigo_postal": 6150, "municipio": "Ribero"},
                    //rendón -- ribero


                    {"ciudad": "Soro", "codigo_postal": 6150, "municipio": "Mariño"},
                    {"ciudad": "Tunapuy", "codigo_postal": 6154, "municipio": "Libertador"},
                    // campo elías -- Libertador

                    {"ciudad": "Guaraunos", "codigo_postal": 6150, "municipio": "Benítez"}
                    // general francisco a vásquez -- Benítez
                ];
                for (let i = 0; i <= lista_ubicaciones_sucre.length - 1; i++){
                    new Ubicacion({
                        "pais": "Venezuela",
                        "estado": "Sucre",
                        "ciudad": lista_ubicaciones_sucre[i].ciudad,
                        "codigo_postal": lista_ubicaciones_sucre[i].codigo_postal,
                        "municipio": lista_ubicaciones_sucre[i].municipio,
                        "lalo_sup_izq": lista_ubicaciones_sucre[i].lalo_sup_izq,
                        "lalo_inf_der": lista_ubicaciones_sucre[i].lalo_inf_der
                    }).save((error)=>{
                        if(error) console.log(error);
                    });
                }

                console.log("La base de datos fue inicializada exitosamente");
            }
        });

        Administrador.findOne({ "usuario": "deslt" }, (error, admin) => {
            if (error) return next(error);

            if (!admin) { // clave = secret
                new Administrador({ "nombre": "Luis Tena", "usuario": "deslt", "correo": "luistena@softour.com", "clave": "$2a$10$V.PBnuHMLOjoYlTtlyE4wu9esjDdw.I/shYut7cPgdhlGnVLYgYs." }).save((error)=>{
                    if(error) console.log(error);
                });
 
                console.log("El usuario admin fue creado exitosamente");
            }
        });
    }
};