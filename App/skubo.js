// Skubo (c) 2023 Baltasar MIT License <baltasarq@gmail.com>
/*
	FI.JS@txtMap, v0.1 / v0.6 20140612
	Tue May 30 14:26:47 2023

*/

// *** Locs ===================================================================
/** This is used in the adventure's intro and in objAtlantida's description. */
const txtIntro = "La UHU y el CSIC financian esta expedición \
                  para encontrar la ciudad perdida. \
                  La superficie de agua a explorar es inmensa, \
                  pues aunque preferentemente exploramos al sur de Doñana, \
                  en realidad cualquier punto entre \
                  Huelva y Tarifa sería válido.";

const LocKind = { "Ship": 1, "Sea": 2, "Land": 3 };

const creaLoc = function(id, syns, desc, lk) {
    toret = ctrl.locs.creaLoc(
        id,
        syns,
        desc
    );

    toret.getLocKind = function() {
        return lk;
    };

    return toret;
};


// ------------------------------------------------------------------ locStores
const locStores = creaLoc(
	"Almacenes",
	[],
	"Ves varios almacenes, supones que de pescado. \
    Puedes avanzar hacia el ${puerto, o}, por un lado del anillo, \
    o hacia una ${zona residencial, e}, por el otro. \
    Es posible ${atravesar un puente, sal} que lleva al anillo externo.",
    LocKind.Land
);

locStores.preExit = function() {
    ctrl.goto( locBridge );
};

locStores.ini = function() {
    this.setExitBi( "oeste", locHarbor );
    this.setExitBi( "este", locResidence );
};


// -------------------------------------------------------------------- locShip
const locShip = creaLoc(
	"Barco",
	[ "mytilus" ],
	"^{El Mytilus se mece suavemente sobre el ${agua, ex agua}. \
      Es vuestro turno. Es el momento de descubrir: \
      la ${Atlántida, ex atlantida} espera.}\
     <p>El buque oceanográfico ha hecho ${descender, abajo} \
     con la ${grúa, ex grua} el pequeño ${submarino , ex submarino} \
     para investigar el lecho a fondo.</p>",
    LocKind.Ship
);

locShip.ini = function() {
    this.setExitBi( "abajo", locSkubo );
};


const objGrua = ctrl.creaObj(
	"grua",
	[],
	"La grua espera inclinada sobre el agua a que vuelva el submarino.",
	locShip,
	Ent.Escenario
);

const objSuperficieAgua = ctrl.creaObj(
	"agua",
	[ "superficie", "mar" ],
	"El mar se encuentra tranquilo esta mañana. \
     La temperatura, con más de 20º, resulta muy agradable.",
	locShip,
	Ent.Escenario
);

const objAtlantida = ctrl.creaObj(
	"atlantida",
	[ "ciudad", "perdida" ],
	txtIntro,
	locShip,
	Ent.Escenario
);

const objSubmarine = ctrl.creaObj(
	"submarino",
	[ "sumergible", "explorador" ],
	"Como un pequeño torpedo amarillo, pero lleno de sensores.",
	locShip,
	Ent.Escenario
);

objSubmarine.ini = function() {
    locDepths1.objs.push( this );
};

objSubmarine.preExamine = function() {
    const loc = ctrl.locs.getCurrentLoc();
    let toret = this.desc;

    if ( loc == locShip ) {
        toret += " Ahora no está aquí.";
    }

    return toret;
};

const pnjDivers = ctrl.personas.creaPersona(
    "buceadores",
    [ "buceador", "investigadores", "companeros", "buzo", "buzos" ],
    "Otros ${investigadores, habla con buzos} se mueven a tu alrededor.",
    ctrl.locs.limbo
);

pnjDivers.preTalk = function() {
    return "Aunque no puedes hablarles, intercambias con ellos \
            el gesto universal para inmersión de que todo va bien: \
            el índice y el pulgar haciendo una 'o'.";
};

const objWatch = ctrl.creaObj(
	"reloj",
	[],
	"Marca la profundidad y el tiempo de inmersión.",
	locShip,
	Ent.Portable
);

objWatch.ini = function() {
    this.setClothing();
};

objWatch.preExamine = function() {
    const loc = ctrl.locs.getCurrentLoc();
    let toret = this.desc;
    let depth = 0;
    let time = 30;

    if ( loc.getLocKind() == LocKind.Sea ) {
        depth = 20 + Math.floor( Math.random() * 7 );
        time = 3 + Math.floor( Math.random() * 5 );
    }

    return toret + ": Dpth: " + depth + " m. T: -" + time + "'";
};

const objBreather = ctrl.creaObj(
	"respirador",
	[],
	"Conecta tu boca con las bombonas.",
	locShip,
	Ent.Portable
);

objBreather.ini = function() {
    this.setClothing();
};

const objSuit = ctrl.creaObj(
	"traje",
	[ "neopreno" ],
	"Tu traje de neopreno, morado y negro.",
	locShip,
	Ent.Portable
);

objSuit.ini = function() {
    this.setClothing();
};

const objCanister = ctrl.creaObj(
	"bombona",
	[ "aire", "oxigeno" ],
	"Para poder respirar, grande y oblongamente redondeada.",
	locShip,
	Ent.Portable
);

objCanister.ini = function() {
    this.setClothing();
};

objSuit.preDisrobe =
objSuit.preDrop =
objWatch.preDisrobe =
objWatch.preDrop =
objBreather.preDisrobe =
objBreather.preDrop =
objCanister.preDisrobe =
objCanister.preDrop = function() {
    const loc = ctrl.locs.getCurrentLoc();
    let toret = "Es curioso como en ocasiones, al bucear, te asaltan pensamientos suicidas.";

    if ( loc.getLocKind() != LocKind.Sea ) {
        toret = parser.sentence.act.exe( parser.sentence );
    }

    return toret;
};

const pnjGabriel = ctrl.personas.creaPersona(
	"Gabriel",
	[ "jefe", "investigador", "hombre", "persona" ],
	"Gabriel te mira, expectante.",
	locShip
);

pnjGabriel.preTalk = function() {
    ctrl.clearAnswers();

    if ( this.status == 0 ) {
        this.say( "Todos han bajado ya, Silvia. Es tu turno. \
                   ¡Baja y descúbrenos la Atlántida!" );
        this.status++;
    } else {
        this.say( "Venga Silvia, prepárate y baja." );
    }

    return;
};

pnjGabriel.ini = function() {
    this.status = 0;
};


// ------------------------------------------------------------------- locSkubo
const locSkubo = creaLoc(
	"¡Inmersión!",
	[],
	"Preparas todo el equipo, llenas la bombona \
     y te dispones a ${zambullirte, abajo}.",
    LocKind.Ship
);

locSkubo.ini = function() {
    this.setExit( "abajo", locDepths1 );
};

locSkubo.prepare = function() {
    objCanister.moveTo( player );
    objCanister.setWorn();
    objWatch.moveTo( player );
    objWatch.setWorn();
    objSuit.moveTo( player );
    objSuit.setWorn();
    objBreather.moveTo( player );
    objBreather.setWorn();
};

locSkubo.postGo = function() {
    this.prepare();
};


// ----------------------------------------------------------------- locChamber
const locChamber = creaLoc(
	"Centro del templo",
	[ "camara" ],
	"En este angosto recinto con una forma que se te antoja como \
     el del interior de una columna, solo puedes ver \
     ${unas aberturas, ex aberturas} a ambos lados y otra frente a ti.",
    LocKind.Land
);

const objAberturas = ctrl.creaObj(
	"aberturas",
	[ "huecos", "aperturas" ],
	"En ellas ves a... un buzo.",
	locChamber,
	Ent.Escenario
);

objAberturas.preExamine = function() {
    const dvCmds = document.getElementById( "dvCmds" );
    const msg = this.desc += " Con un traje de neopreno morado y negro... \
                              En la abertura frente a ti, \
                              puedes verle inerte, en el fondo del mar, \
                              y cómo otros dos buceadores \
                              le elevan con ayuda de una cuerda. De pronto, \
                              todo a tu alrededor se desvanece: \
                              el templo, la ciudad, todo se ha ido. \
                              Acompañas la penosa ascensión de \
                              los tres buceadores... siempre presente, \
                              pero como fuera de la escena. \
                              Y solo entonces, comienzas a comprender.";

    dvCmds.style.display = "none";
    ctrl.endGame( msg + objEnd.scaffolding, "res/ascension.jpg" );
};


// ----------------------------------------------------------- locTempleTerrace
const locTempleTerrace = creaLoc(
	"Explanada del templo",
	[ "plaza", "terraza" ],
	"^{Por algunos huecos entre las diferentes estructuas \
      puedes ver los dos canales, el interior y el exterior. \
      Es obvio que te encuentras ahora en el centro, \
      despues de tanto caminar rodeando los anillos.} \
      Frente al final de la angosta pasarela, \
      se encuentra una ${edificacion, n} \
      que por su posicion y altura, debe tener gran importancia. \
      Se te antoja que es algun tipo de templo. ¿A que culto se dedicaria? \
      Una pasarela permite ${salir, sal} al anillo interior.",
    LocKind.Land
);

locTempleTerrace.preExit = function() {
    ctrl.goto( locWalkway );
};


//  ----------------------------------------------------------------- locMarket
const locMarket = creaLoc(
	"Mercado",
	[],
	"Lo que parecen los ${puestos, ex puestos} de un mercado \
     se extienden desde el ${canal, ex canal} hacia algún punto cercano \
     a la ${bóveda, ex boveda}. Podrías ${ir hasta el portal, e}, \
     o hasta un ${puente sobre el canal, n}.",
    LocKind.Land
);

locMarket.ini = function() {
    this.setExitBi( "norte", locBridge );
    this.setExitBi( "este", locPortal );
};

const pnjAtlantes = ctrl.personas.creaPersona(
	"personas",
	[ "gente", "persona", "atlante" ],
	"Definitivamente humanos. \
     Parecen ${personas, habla con personas} como cualquiera \
     que pudiera haberme cruzado \
     por la calle ayer, solo que con una floja túnica azul claro cubriéndoles \
     la mayor parte del cuerpo.",
	locMarket
);

pnjAtlantes.preTalk = function() {
    const player = ctrl.personas.getPlayer();

    player.say( "¿Cómo puedo volver a la superf...?" );
    return "Cuanto intentas comunicarte con ellos, te toman de las manos \
            y bailan contigo en círculos con grandes sonrisas... \
            cuando te sueltan, señalan en dirección al centro del anillo.";
};

const objPuestos = ctrl.creaObj(
	"puestos",
	[],
	"Solo algunas ${personas, ex personas}, probablemente los vendedores, pueden verse cerca de algunos de los puestos.",
	locMarket,
	Ent.Escenario
);


// ----------------------------------------------------------------- locWalkway
const locWalkway = creaLoc(
	"Enlace",
	[ "cruce" ],
	"Este es otro de esos puntos de paso, en este caso al anillo interior, \
     no parece que haya ${mas canales, ex canal}. \
     Se trata de un ${angosto puentecillo, ex puentecillo} \
     cubierto a modo de paraguas alargado, \
     pero para una pasarela del ancho de una persona. \
     Siguiendo el anillo, se puede ir a una ${zona residencial, arriba}, \
     Mientras que en ${sentido contrario, n} se ve lo que parece un puerto.",
    LocKind.Land
);

locWalkway.preEnter = function() {
    ctrl.goto( locTempleTerrace );
};

const objWalkway = ctrl.creaObj(
	"pasarela",
	[ "puente", "muretes", "murete", "puentecillo" ],
	"Muy alta, para permitir pasar embarcaciones por debajo, \
     con altos muretes además, \
     pero tambien muy estrecha. Se puede ${cruzar, entra}.",
	locWalkway,
	Ent.Escenario
);


// ------------------------------------------------------------------ locPortal
const locPortal = creaLoc(
	"Entrada",
	[],
	"^{Te ves succionada por el portal para aparecer, como por arte de magia, \
       de pie, sana y salva, del otro lado. Te giras hacia atrás, y solo \
       puedes intuir lo que se supone que es el agua, a raya por parte \
       de una ${fuerza desconocida para ti, ex boveda}. }\
       <p>El portal se sitúa sobre \
       una plataforma ¿${sumergida, ex boveda}? \
       con base en forma de anillo sobre un \
       ${canal, ex canal}. El anillo permite el acceso \
       en un ${sentido, este} y al ${contrario, oeste}. \
       Supones que debería poderse \
       ${cruzar el portal, entra en portal} de nuevo.</p>",
    LocKind.Land
);

locPortal.ini = function() {
    this.setExitBi( "este", locUrbanization );
    this.setExitBi( "oeste", locMarket );
};

locPortal.preLook = function() {
    const toret = this.desc;

    if ( ctrl.locs.limbo.has( objShorts ) ) {
        this.prepare();
    }

    return toret;
};

const objShorts = ctrl.creaObj(
    "pantalones cortos",
    [ "shorts" ],
    "Sí, unos cómodos pantalones cortos.",
    ctrl.locs.limbo,
    Ent.Portable
);

const objBlouse = ctrl.creaObj(
    "camiseta",
    [ "blusa", "tiras" ],
    "La notas ligera contra tu piel.",
    ctrl.locs.limbo,
    Ent.Portable
);

objShorts.preDisrobe =
objShorts.preDrop =
objBlouse.preDisrobe =
objBlouse.preDrop = function() {
    return "El pudor te impide hacerlo.";
};

locPortal.prepare = function() {
    const player = ctrl.personas.getPlayer();

    objCanister.moveTo( ctrl.locs.limbo );
    objCanister.setWorn( false );
    objWatch.moveTo( ctrl.locs.limbo);
    objWatch.setWorn( false );
    objSuit.moveTo( ctrl.locs.limbo );
    objSuit.setWorn( false );
    objBreather.moveTo( ctrl.locs.limbo );
    objBreather.setWorn( false );

    objShorts.moveTo( player );
    objShorts.setWorn();
    objBlouse.moveTo( player );
    objBlouse.setWorn();
};

const objCanal = ctrl.creaObj(
	"canal",
	[ "agua" ],
	"A tus pies, la plataforma circular contiene una masa de agua \
     por la que circulan embarcaciones.",
	locPortal,
	Ent.Escenario
);

const objBoveda = ctrl.creaObj(
	"boveda",
	[ "cielo" ],
	"Se trata de algún tipo de fuerza invisible \
     la que mantiene las aguas alejadas, \
     puesto que, de nuevo, no puedes apreciar ningún tipo \
     de maquinaria o soporte.",
	locPortal,
	Ent.Escenario
);

const objLandPortal = ctrl.creaObj(
	"portal",
	[ "puerta", "entrada" ],
	"El portal, al igual que la ${bóveda, ex boveda}, \
     mantiene a raya el agua del mar, de manera que forma \
     una especie de escudo. \
     No hay soportes aparentes o maquinaria visible \
     de ningún tipo que produzca este efecto.",
	locPortal,
	Ent.Escenario
);

objLandPortal.preEnter = function() {
    return "No te succiona, te rechaza. La vuelta debe poder hacerse \
            desde otro lugar.";
};


// ----------------------------------------------------------------- locDepths1
const locDepths1 = creaLoc(
	"Profundidades",
	[],
	"^{Con veinticinco metros de profundidad, sabes que aunque tienes tiempo \
     la inmersión no puede ser muy larga. }\
     Buceas pegada al lecho marino. La arena, de un amarillo grisáceo, \
     apagado, se extiende en todas direcciones. \
     Otros ${buceadores, ex buzos} buscan también. Puedes ver un \
     ${reflejo, n}, más adelante. Algún tipo de ${objeto rectilíneo, abajo} \
     también llama tu atención. \
     Puedes ver un gran ${colonia de algas, ex algas}, así como \
     al ${submarino, ex submarino} de la expedición. \
     Una cuerda-guía marca el lugar por donde ${ascender al barco, arriba}.",
    LocKind.Sea
);

locDepths1.ini = function() {
    this.setExitBi( "norte", locDepths2 );
    this.setExit( "arriba", locShip );
    this.setExit( "abajo", locDepths3 );
};

const objAlgas = ctrl.creaObj(
    "algas",
    [ "alga", "colonia" ],
    "Largas algas ondulan con el movimiento del agua.",
    locDepths1,
    Ent.Scenery
);


// ----------------------------------------------------------------- locDepths2
const locDepths2 = creaLoc(
	"Profundidades",
	[],
	"Buceas pegada al lecho marino. La arena, de un amarillo grisáceo, \
     apagado, se extiende en todas direcciones. \
     Otros ${compañeros, ex buzos} bucean a tu alrededor. \
     Puedes ver una ${zona arenosa brillante, ex arena} por aquí. \
     Más adelante te parece ver un ${objeto rectilíneo, e}, \
     mientras que por el lado contrario se adivina \
     ${algo semienterrado en la arena, o}. \
     Una ${llamativa colonia de algas, s} se puede ver \
     a lo lejos.",
    LocKind.Sea
);

locDepths2.ini = function() {
    this.setExitBi( "sur", locDepths1 );
    this.setExitBi( "este", locDepths3 );
    this.setExitBi( "oeste", locDepths4 );
};

const objLightSand = ctrl.creaObj(
    "arena",
    [ "brillante", "arenosa", "zona" ],
    "Al final solo parece ser lo que realmente es: arena.",
    locDepths2,
    Ent.Scenery
);


// ----------------------------------------------------------------- locDepths3
const locDepths3 = creaLoc(
	"Profundidades",
	[],
	"Buceas pegada al lecho marino. La arena, de un amarillo grisáceo, \
     apagado, se extiende en todas direcciones. \
     Puedes ver a ${otros buzos, ex buzos} buscando en todos los recovecos. \
     Algún tipo de ${objeto rectilíneo, ex lata} está semienterrado aquí. \
     Puedes ${avanzar, o} hacia una zona más luminosa, o a \
     un lejano ${promontorio de roca, arriba}. También una zona \
     con ${mucha sombra llama tu atención, abajo}.",
    LocKind.Sea
);

locDepths3.ini = function() {
    this.setExit( "arriba", locDepths5 );
    this.setExit( "abajo", locDepths1 );
};

const objCan = ctrl.creaObj(
    "lata",
    [ "recto", "rectilineo" ],
    "Con las manos casi desentierras... un bidón de lata.",
    locDepths3,
    Ent.Scenery
);


// ----------------------------------------------------------------- locDepths4
const locDepths4 = creaLoc(
	"Profundidades",
	[],
	"Buceas pegada al lecho marino. La arena, de un amarillo grisáceo, \
     apagado, se extiende en todas direcciones. Llaman la atención \
     ${algunos buzos, ex buzos}, ${una zona más luminosa, e}, y, \
     por contraste, ${una zona en sombras, baja}.",
    LocKind.Sea
);

locDepths4.ini = function() {
    this.setExitBi( "este", locDepths2 );
    this.setExit( "abajo", locDepths1 );
    this.setExit( "arriba", locDepths5 );
};


// ----------------------------------------------------------------- locDepths5
const locDepths5 = creaLoc(
	"Profundidades",
	[],
	"Buceas pegada al lecho marino. La arena, de un amarillo grisáceo, \
     apagado, cubre el lecho de una especie de valle entre rocas. \
     pronto te encuentras en una laberinto de túneles y semitúneles \
     que encuentras ávida por explorar. \
     <p>Tras una serie de recovecos, te encuentras de repente ante \
     lo que parece algún tipo de... ¿${portal, n}?",
    LocKind.Sea
);

locDepths5.ini = function() {
    this.setExit( "norte", locPortal );
};

const objSeaPortal = ctrl.creaObj(
	"portal",
	[ "puerta", "entrada" ],
	"¡Es increíble! Un portal de piedra, de colosales dimensiones, se encuentra justo delante de ti, al norte, invitándote a entrar a algún sitio... ¡en el que no hay agua!",
	locDepths5,
	Ent.Escenario
);


// ------------------------------------------------------------------ locBridge
const locBridge = creaLoc(
	"Puente",
	[],
	"Desde este punto es posible ${cruzar, entra} el ${canal, ex canal} \
     sobre una construcción del mismo ${material, ex oricalcum} \
     que has visto hasta ahora. Rodeando el anillo, puedes llegar a \
     un ${mercado, s} y a una ${urbanización, abajo}.",
    LocKind.Land
);

locBridge.preEnter = function() {
    ctrl.goto( locStores );
};

const objOricalcum = ctrl.creaObj(
	"oricalcum",
	[ "material", "piedra" ],
	"Algún tipo de roca con tonos metalizados dorados y plateados.",
	locBridge,
	Ent.Escenario
);


// ------------------------------------------------------------------ locHarbor
const locHarbor = creaLoc(
	"Puerto",
	[ "muelle" ],
	"Buena parte del anillo se emplea aquí como rampa para permitir a los \
     ${barcos, ex barcos} acceder al ${agua, ex agua}. \
     Entre los dos canales y la rampa se asientan multitud de \
     pequeños ${edificios, ex edificios}. Por todas partes, \
     especialmente en la rampa, puedes ver ${redes, ex redes} secándose. \
     Rodeando el anillo, se puede llegar a unos ${almacenes, e}. \
     En ${sentido contrario, s}, se podría llegar a una zona con una pasarela \
     por la que parece que se puede acceder al centro.",
    LocKind.Land
);

locHarbor.ini = function() {
    this.setExitBi( "sur", locWalkway );
};

const objBuildings = ctrl.creaObj(
	"edificios",
	[ "edificio" ],
	"Si tuvieras que adivinar, dirías que se trata de lonjas y almacenas. \
     Hay ${personas, ex personas} moviéndose entre ellos.",
	locHarbor,
	Ent.Escenario
);

const objRamp = ctrl.creaObj(
	"rampa",
	[],
	"Múltiples ${embarcaciones, ex barcos} están varados en ella. \
     Son sobre todo de pequeño tamaño.",
	locHarbor,
	Ent.Escenario
);

const objNets = ctrl.creaObj(
	"redes",
	[],
	"Secándose al aire.",
	locHarbor,
	Ent.Escenario
);

const objShips = ctrl.creaObj(
	"barcos",
	[ "barco", "embarcacion", "embarcaciones" ],
	"Los barcos entran y salen del puerto, \
     contribuyendo al tráfico en el ${canal, ex canal}.",
	locHarbor,
	Ent.Escenario
);

// --------------------------------------------------------------- locResidence
const locResidence = creaLoc(
	"Residencia",
	[ "residencial" ],
	"Las ${personas, ex personas} aquí se encuentran enfrascadas en tareas \
     aparentemente cotidianas. Por primera vez, puedes ver \
     ${niños, ex ninos}, están jugando, todos con su túnica azul, \
     aunque esta es de un azul intenso, más oscuro, \
     en contraste con el celeste anterior. \
     Cercano a ti puedes ver un gran ${edificio, ex edificio}, \
     contra el canal exterior y alejado del ${canal interior, ex canal}. \
     ${Siguiendo el anillo, abajo} en un sentido, \
     parece que se puede cruzar el canal, mientras que en sentido contrario \
     se llega a lo que parecen unos ${almacenes, o}.",
    LocKind.Land
);

locResidence.ini = function() {
    this.setExitBi( "abajo", locWalkway );
};

const objEdificio = ctrl.creaObj(
	"edificio",
	[],
	"Se trata de una gran construccion del mismo material de antes, \
     con sus tonalidades petreas, plateadas y aureas. \
     Por la gran cantidad de ventanas, deduces que parece... \
     un complejo de apartamentos...",
	locResidence,
	Ent.Escenario
);

const pnjNinnos = ctrl.personas.creaPersona(
    "niños",
    [ "nino", "ninos" ],
    "Los ${niños, habla con ninos} juegan y se divierten entre ellos.",
    locResidence
);

pnjNinnos.ini = function() {
    this.status = 0;
};

pnjNinnos.preTalk = function() {
    const player = ctrl.personas.getPlayer();
    let toret = "Te miran durante un momento, sonríen y... \
                 señalan al centro del anillo.";

    player.say( "Hola, niños..." );

    if ( this.status == 0 ) {
        this.status++;
        toret += " Empiezas a sentirte inquieta. ¿Qué está pasando?";
    }

    return toret;
};


// ------------------------------------------------------------------ locTemple
const locTemple = creaLoc(
	"Templo",
	[],
	"^{El interior del templo está muy oscuro, tus ojos tardan \
     en acostumbrarse a la luz. En cuanto te adentras en él, \
     un sentimiento ominoso te invade, no puedes evitar un mal presagio, \
     o simplemente una mala sensación. }\
     El interior es bastante más pequeño de lo que anticipabas. \
     Algún tipo de ${pequeña cámara, ex camara} se encuentra ${frente a ti, n}. \
     Puedes ver dos ${atlantes, ex sacerdotes}, portando sendos báculos iguales.",
    LocKind.Land
);

locTemple.ini = function() {
    this.setExit( "norte", locChamber );
    this.setExitBi( "sur", locTempleTerrace );
};

const pnjSacerdotes = ctrl.personas.creaPersona(
	"sacerdotes",
	[ "atlantes", "atlante", "baston", "baculo", "bastones", "baculos", "tunica", "tunicas" ],
	"Estos dos atlantes son algún tipo de sacerdotes en este oscuro templo. \
     Ambos llevan una túnica negra, y... \
     no sonríen como el resto de gente que has encontrado hasta ahora. \
     Cuando les miras interrogativamente, señalan con su bastón el ${centro del templo, ex camara}.",
	locTemple
);

pnjSacerdotes.preTalk = function() {
    return "Pese a tus esfuerzos, \
            se limitan a señalar el centro de la ${cámara, ex camara}.";
};

const objCamara = ctrl.creaObj(
	"camara",
	[ "centro" ],
	"La cámara se encuentra en el ${centro exacto del templo, n}, \
     y tiene varias aberturas, aunque es muy angosto.",
	locTemple,
	Ent.Escenario
);


// ------------------------------------------------------------ locUrbanization
const locUrbanization = creaLoc(
	"Urbanizacion",
	[],
	"Varias ${casas, ex casas} se organizan en cuadrícula \
     desde una explanada cerca del ${canal, ex canal} \
     hasta algún punto cercano a la ${bóveda, ex boveda}. \
     Desde aquí se puede recorrer el anillo hasta ${el portal, o}, \
     o en sentido contrario hasta un ${puente sobre el canal, arriba}.",
    LocKind.Land
);

locUrbanization.ini = function() {
    this.setExitBi( "arriba", locBridge );
};

const objStone = ctrl.creaObj(
	"piedra",
	[],
	"La piedra es excepcionalmente dura al tacto, \
     y jurarías que está hecha de la combinación de algún tipo de roca \
     con una aleación ligera... Tiene un tono metalizado \
     entre dorado y plateado ¿Sería este el famoso oricalcum?",
	locUrbanization,
	Ent.Escenario
);

const objCasas = ctrl.creaObj(
	"casas",
	[ "casa" ],
	"Las casas son bajas, hechas aparentemente de algún tipo \
     de ${piedra, ex piedra} con tonos metalizados, \
     pero sin puertas ni ventanas.",
	locUrbanization,
	Ent.Escenario
);


// End ------------------------------------------------------------------------
objEnd = {};
objEnd.msgEnd = "<c>Rfcreb dhr unlnf qvfsehgnqb qr rfgr eryngb. \
                 Pbzb unoeáf nqvivanqb, gvrar tenaqrf pbzcbaragrf \
                 baíevpbf dhr dhvmáf gr unlna qrwnqb pba qhqnf, b dhvmáf \
                 unlnf vagrecergnqb qr znaren \
                 qvsreragr n phnaqb lb yb pbaproí. \
                 N pbagvahnpvóa ivrar han rkcyvpnpvóa \
                 ernyvfgn fboer rfgr grzn; \
                 gú qrorf qrpvqve fv dhvrerf yrreyn b ab.\
                 </c>\
                 <c>Zv vqrn phnaqb peré ry whrtb ren eryngne han rkcrevrapvn \
                 baíevpn erynpvbanqn pba ry rairaranzvragb cbe ybf tnfrf ny \
                 ntbgnefr yn obgryyn qr bkítrab/avgeótrab.\
                 </c>\
                 <c>Cvqb creqóa qr nagrznab cbedhr frthenzragr nythvra dhr \
                 cenpgvdhr ohprb qveá dhr rfgn fvghnpvóa ab rf ernyvfgn.\
                 </c>\
                 <c>Yn phrfgvóa rf dhr yn cebgntbavfgn rfgá gna zbgvinqn cbe \
                 rapbagene yn Ngyáagvqn dhr \
                 nchen unfgn ry svany fh obzoban... \
                 yb dhr yr genr pbafrphrapvnf \
                 pngnfgeósvpnf. Ha cevzre qrgnyyr, \
                 dhr ur fnpnqb qr ybf fhrñbf baíevpbf, rf dhr ry erybw qr \
                 vazrefvóa ahapn qrihryir qbf qngbf vthnyrf.\
                 </c>\
                 <c>Yn cebgntbavfgn raphragen ry \
                 cbegny l fr zrgr. Ln rfgá sngny, \
                 cbedhr fh fhopbafpvragr un zrmpynqb fh qrfrb qr rapbagene \
                 yn Ngyáagvqn pba fh arprfvqnq qr ibyire n yn fhcresvpvr \
                 (arprfvqnq dhr un vqb eryrtnaqb n ha frthaqb cynab). \
                 Ndhí ln cbqrzbf fnore dhr rfgá cnfnaqb nytb tenir fv unprzbf \
                 ha vairagnevb... ¡fhf ebcnf una pnzovnqb pbzcyrgnzragr!\
                 </c>\
                 <c>Rkcybenaqb yn pvhqnq creqvqn, abf rapbagenerzbf pba han \
                 fvghnpvóa pbzb vqrny, ra yn dhr gbqbf ybf unovgnagrf \
                 fbaeíra l onvyna, creb ab fba qr tena nlhqn, pyneb; rkprcgb \
                 dhr abf frñnyna ry prageb qr yn pvhqnq. N zrqvqn dhr abf \
                 npredhrzbf ny prageb, abgnerzbf dhr ybf pbyberf fr ina \
                 qrfqvohwnaqb. Rfgb gvrar dhr ire pba yn ivqn qr yn \
                 cebgntbavfgn, dhr fr in creqvraqb.\
                 </c>\
                 <c>Phnaqb yyrtnzbf ny prageb, abf zrgrzbf ra ry grzcyb bfpheb l \
                 nyyí rapbagenzbf n qbf fnpreqbgrf \
                 pba gúavpnf artenf. Rfgb rf \
                 qrovqb gnzovéa n yn céqvqn qr ivqn (pnqn irm zrabf pbybe l \
                 yhm), creb fboer gbqb rfbf qbf fnpreqbgrf fba ra ernyvqnq \
                 ybf qbf ohmbf dhr gr una rapbagenqb. Phnaqb gr zrgrf \
                 ra rfn páznen, rf phnaqb svanyzragr gh nyzn fr frcnen qr gh \
                 phrecb l nfvfgrf \"qrfqr shren\" (pbzb gnagbf dhr una ihrygb \
                 qr fvghnpvbarf prepnanf n yn zhregr una eryngnqb), \
                 n yn nfprafvóa qr gh phrecb unpvn yn fhcresvpvr, \
                 yb pháy n yn irm fveir qr fízvy pba yn gna znavqn nfprafvóa \
                 unpvn yn yhm. Fí, ry genwr qr arbcerab zbenqb l arteb rf \
                 ry ghlb, chrqrf fnoreyb fv unprf ha vairagnevb \
                 ny vavpvb qr yn niraghen.\
                 </c>";

objEnd.rot13decoder = function(msg) {
    const codeUpperA = "A".charCodeAt( 0 );
    const codeUpperZ = "Z".charCodeAt( 0 );
    const codeLowerA = "a".charCodeAt( 0 );
    const codeLowerZ = "z".charCodeAt( 0 );
    const lengthAlphabet = codeUpperZ - codeUpperA + 1;
    let toret = "";

    for(let i = 0; i < msg.length; ++i) {
        let chCode = msg.charCodeAt( i );

        if ( ( chCode >= codeUpperA
           &&  chCode <= codeUpperZ )
          || ( chCode >= codeLowerA
           &&  chCode <= codeLowerZ ))
        {
            // Position in alphabet
            let chBase = codeUpperA;
            let chPos = chCode - codeUpperA;

            if ( chCode >= codeLowerA ) {
                chBase = codeLowerA;
                chPos = chCode - codeLowerA;
            }

            // Decode
            chCode = chBase + ( ( chPos + 13 ) % lengthAlphabet );
        }

        toret += String.fromCharCode( chCode );
    }

    return toret;
};

objEnd.scaffolding = "<p>Fin.</p>\
                      <p><a href='javascript: window.location.reload()'> \
                      Volver a leer</a>.</p>\
                      <details><summary>Curiosidades</summary>"
                      + objEnd.rot13decoder( objEnd.msgEnd )
                      + "</details>";

// Start ----------------------------------------------------------------------
const player = ctrl.personas.creaPersona(
    "Silvia",
    ["jugador", "jugadora", "submarinista"],
    "Silvia, investigadora científica y submarinista en busca de la Atlántida.",
    locShip
);

player.postAction = function() {
    const loc = ctrl.locs.getCurrentLoc();

    if ( loc.getLocKind() == LocKind.Land ) {
        objBoveda.moveTo( loc );
        objCanal.moveTo( loc );

        if ( loc != locTemple ) {
            pnjAtlantes.moveTo( loc );
        }
    }
    else
    if ( loc.getLocKind() == LocKind.Sea
      && loc != locDepths5 )
    {
        pnjDivers.moveTo( loc );
    }

    return;
};

ctrl.ini = function() {
    ctrl.setTitle( "Skubo" );
    ctrl.setIntro( "<p>En busca de la Atlántida.<br/></p>\
                    <p>" + txtIntro + "</p>"
    );
    ctrl.setPic( "res/portada.jpg" );
    ctrl.setAuthor( "baltasarq@gmail.com" );
    ctrl.setVersion( "20230530" );
    ctrl.personas.changePlayer( player );
    ctrl.places.setStart( locShip );

    locSkubo.prepare();
}
