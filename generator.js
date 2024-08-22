const FELDGROESSE = 10;     // 10x10 Felder
const urlParams = new URLSearchParams(window.location.search);
// 70 ist die urspruengliche Groesse, erzeugt aber ein 7700x7700 Pixel großes Feld
// Die Berechnung der Groesse muss noch einmal überarbeitet werden
const ZELLGROESSE = 40;
const SEED = parseInt(urlParams.get('seed')) || Math.floor(1 + Math.random() * 99999);
var item = document.getElementById('seed-text');
item.value = SEED;
const DEBUG = urlParams.get('debug') != null && urlParams.get('debug') != undefined && urlParams.get('debug') != 'false'
const PLAN = urlParams.get('plan') != null && urlParams.get('plan') != undefined && urlParams.get('plan') != 'false'
// Falls nichts angegeben gehts auf default: 70 zurück
const RANDBREITE = ZELLGROESSE / 2; // 350 Pixel
const GESAMTGROESSE = FELDGROESSE * ZELLGROESSE + 2 * RANDBREITE; // 8000 Pixel = 800 mm = 80 cm 
// irgendwas stimmt hier nicht, das Feld ist irgendwie 7700x7700 Pixel groß

const LOGOGROESSE = RANDBREITE * 0.7; // 80% der Randbreite
const SCHIFFZEICHNER = 'Lars Lars Herud, Sören Helms, Andrea Helms';    // Name der Illustratoren
const SCHEIBENBEZEICHNUNG = 'Bogenschießen Schiffe Versenken';          // Name der Scheibe
const SEEDINFO = '[' + SEED + ']';                                      // Verwendeter Seed
const VEREINSNAME = 'Schützenverein Rahlstedt u. Umg. v. 1906 e.V.';    // Name des Vereins


const Random = class SeededRandom {
    constructor(seed) {
        this.seed = seed;
        this.m = 0x80000000;
        this.a = 1103515245;
        this.c = 12345;
        this.state = seed ? seed : Math.floor(this.nextInt() * (this.m - 1));
    }

    nextFloat() {
        return this.nextInt() / (this.m - 1);
    }
    nextInt() {
        this.state = (this.a * this.state + this.c) % this.m;
        return this.state;
    }
    nextRange(start, end) {
        var rangeSize = end - start + 1;
        var randomUnder1 = this.nextInt() / this.m;
        return start + Math.floor(randomUnder1 * rangeSize);
    }

}

// Eine Breite größer 1 ist möglich, in diesem Fall wird aber aktuell keine korrekte
// Kollisionsprüfung durchgeführt. Die Schiffe werden dann eventuell zu nah gesetzt.
// Sortioert nach gröse um es back trackking einfgachaer zu machen
const SCHIFFE = [
    {
        name: 'Flugzeugträger',
        groesse: 5,
        breite: 2,
        farbe: 'purple',
        image: 'schiffe/Flugzeugtraeger.svg',
        modify: 'scale(0.75,1)'
    },
    {
        name: 'Zerstörer',
        groesse: 4,
        breite: 1,
        farbe: 'orange',
        image: 'schiffe/Zerstoerer.svg',
    },
    {
        name: 'U-Boot',
        groesse: 3,
        breite: 1,
        farbe: 'yellow',
        image: 'schiffe/U-Boot.svg',
    },
    {
        name: 'Kreuzer',
        groesse: 2,
        breite: 1,
        farbe: 'green',
        image: 'schiffe/Kreuzer.svg',
    },
    {
        name: 'Flugzeug',
        groesse: 1,
        breite: 1,
        farbe: 'red',
        image: 'schiffe/Flugzeug.svg',
    },
    {
        name: 'Helikopter',
        groesse: 1,
        breite: 1,
        farbe: 'lightblue',
        image: 'schiffe/Helikopter.svg',
    },
    {
        name: 'Schnellboot',
        groesse: 1,
        breite: 1,
        farbe: 'darkblue',
        image: 'schiffe/Schnellboot.svg',
    },
];



async function erstelleSpielfeld() {

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '2000px');
    svg.setAttribute('height', '2000px');
    svg.setAttribute('viewBox', `0 0 ${GESAMTGROESSE} ${GESAMTGROESSE}`);

    // Äußerer Rand
    const rand = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rand.setAttribute('x', '0');
    rand.setAttribute('y', '0');
    rand.setAttribute('width', GESAMTGROESSE);
    rand.setAttribute('height', GESAMTGROESSE);
    rand.setAttribute('fill', 'none');
    rand.setAttribute('stroke', 'black');
    rand.setAttribute('stroke-width', '1');
    svg.appendChild(rand);

    // Schachbrettmuster & Koordinatengröße
    const linienStaerke = 0.5;
    const fontSkalierung = 1.6; // 2 empfohlen

    // Hintergrund (alle Felder weiß)
    const hintergrund = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    hintergrund.setAttribute('x', RANDBREITE);
    hintergrund.setAttribute('y', RANDBREITE);
    hintergrund.setAttribute('width', FELDGROESSE * ZELLGROESSE);
    hintergrund.setAttribute('height', FELDGROESSE * ZELLGROESSE);
    hintergrund.setAttribute('fill', 'white');  //'fill', (i + j) % 2 === 0 ? '#eee' : '#ddd');
    svg.appendChild(hintergrund);               // für abwechselndes Muster

    // Vertikale Linien
    for (let i = 0; i <= FELDGROESSE; i++) {
        const linie = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        linie.setAttribute('x1', RANDBREITE + i * ZELLGROESSE);
        linie.setAttribute('y1', RANDBREITE);
        linie.setAttribute('x2', RANDBREITE + i * ZELLGROESSE);
        linie.setAttribute('y2', RANDBREITE + FELDGROESSE * ZELLGROESSE);
        linie.setAttribute('stroke', 'black');
        linie.setAttribute('stroke-width', linienStaerke);
        svg.appendChild(linie);
    }

    // Horizontale Linien
    for (let j = 0; j <= FELDGROESSE; j++) {
        const linie = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        linie.setAttribute('x1', RANDBREITE);
        linie.setAttribute('y1', RANDBREITE + j * ZELLGROESSE);
        linie.setAttribute('x2', RANDBREITE + FELDGROESSE * ZELLGROESSE);
        linie.setAttribute('y2', RANDBREITE + j * ZELLGROESSE);
        linie.setAttribute('stroke', 'black');
        linie.setAttribute('stroke-width', linienStaerke);
        svg.appendChild(linie);
    }

    // Koordinaten hinzufügen
    for (let i = 0; i < FELDGROESSE; i++) {
        // Zahlen (1-10) oberhalb des Schachbretts
        const zahl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        zahl.setAttribute('x', RANDBREITE + i * ZELLGROESSE + ZELLGROESSE / 2);
        zahl.setAttribute('y', RANDBREITE / 2);
        zahl.setAttribute('text-anchor', 'middle');
        zahl.setAttribute('dominant-baseline', 'central');
        zahl.setAttribute('font-family', 'Calibri, sans-serif');
        zahl.setAttribute('font-weight', 'bold');
        zahl.setAttribute('font-size', RANDBREITE / fontSkalierung);
        zahl.textContent = i + 1;
        svg.appendChild(zahl);

        // Buchstaben (A-J) links vom Schachbrett
        const buchstabe = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        buchstabe.setAttribute('x', RANDBREITE / 2);
        buchstabe.setAttribute('y', RANDBREITE + i * ZELLGROESSE + ZELLGROESSE / 2);
        buchstabe.setAttribute('text-anchor', 'middle');
        buchstabe.setAttribute('dominant-baseline', 'central');
        buchstabe.setAttribute('font-family', 'Calibri, sans-serif');
        buchstabe.setAttribute('font-weight', 'bold');
        buchstabe.setAttribute('font-size', RANDBREITE / fontSkalierung);
        buchstabe.textContent = String.fromCharCode(65 + i);
        svg.appendChild(buchstabe);
    }

    const result = await platziereSchiffe(svg);
    // uncomment line to see debug
    result.debug.setAttribute('transform', `translate(${RANDBREITE},${RANDBREITE})`)
    if (DEBUG) {
        svg.appendChild(result.debug);
    }
    svg.appendChild(result.schiffeGruppe);
    result.schiffeGruppe.setAttribute('transform', `translate(${RANDBREITE},${RANDBREITE})`)

    platziereLogo(svg);

    platziereCredits(svg);

    platziereBezeichnung(svg);

    platziereVerein(svg);

    return svg;
}

// Schiffe zufällig platzieren
async function platziereSchiffe() {
    var rng = new Random(SEED);
    const debug = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    const schiffeGruppe = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    const field = []
    for (var c = 0; c < FELDGROESSE; c++) {
        field.push(new Array(FELDGROESSE).fill(0))
    }

    // Schiffe platzieren, bis keine Kollisionen mehr vorhanden sind
    await placeRecursive(field, schiffeGruppe, debug, SCHIFFE, rng)
    return {
        debug,
        schiffeGruppe
    }
}

async function placeRecursive(field, schiffeGruppe, debug, schiffe, rng) {
    if (schiffe.length == 0) {
        return true;
    }
    const schiff = schiffe[0]
    schiffe.shift();
    const rotation = rng.nextRange(0, 3);
    const width = rotation == 0 || rotation == 2 ? schiff.breite : schiff.groesse
    const heigth = rotation == 0 || rotation == 2 ? schiff.groesse : schiff.breite
    const x = rng.nextRange(0, FELDGROESSE - width); // Breite abziehen um nicht herrauszuragen
    const y = rng.nextRange(0, FELDGROESSE - heigth);// Höhe abziehen um nicht herrauszuragen

    for (let fy = y; fy < y + heigth; fy++) {
        for (let fx = x; fx < x + width; fx++) {
            if (field[fy][fx]) {
                return false;
            }
        }
    }


    // Schiff Laden
    const schiffBreite = ZELLGROESSE * schiff.breite;
    const schiffHöhe = ZELLGROESSE * schiff.groesse;
    const schiffBox = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Fix plazierung von svg im grid pro orientation
    let px;
    let py;
    switch (rotation) {
        case 0:
            px = ((x) * ZELLGROESSE)
            py = ((y) * ZELLGROESSE)
            break;
        case 1:
            px = ((x + width - 1) * ZELLGROESSE)
            py = ((y) * ZELLGROESSE)
            break;
        case 2:
            px = ((x + width - 1) * ZELLGROESSE)
            py = ((y + heigth - 1) * ZELLGROESSE)
            break;
        case 3:
            px = ((x) * ZELLGROESSE)
            py = ((y + heigth - 1) * ZELLGROESSE)
            break;
        default:
            px = ((x) * ZELLGROESSE)
            py = ((y - heigth + 1) * ZELLGROESSE)
            break;
    }
    // Schiff plazieren
    schiffBox.setAttribute('transform', `translate(${px},${py}) rotate(${90 * rotation} ${ZELLGROESSE / 2} ${ZELLGROESSE / 2})`);
    const svg = await urlToSvg(schiff.image, schiffBreite, schiffHöhe);
    const modShipImage = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    if (schiff.modify) {
        modShipImage.setAttribute('transform', schiff.modify)
    }
    modShipImage.appendChild(svg)

    schiffBox.appendChild(modShipImage);
    schiffeGruppe.appendChild(schiffBox);


    // debug plazieren
    for (let fy = y - 1; fy < y + heigth + 1; fy++) {
        for (let fx = x - 1; fx < x + width + 1; fx++) {
            if (fx < 0 || fx >= FELDGROESSE) {
                continue; // aus dem feld
            }
            if (fy < 0 || fy >= FELDGROESSE) {
                continue; // aus dem feld
            }
            field[fy][fx] = 1;
        }
    }
    const hitBox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    hitBox.setAttribute('width', (ZELLGROESSE * (width + 2)));
    hitBox.setAttribute('height', (ZELLGROESSE * (heigth + 2)));
    hitBox.setAttribute('transform', `translate(${ZELLGROESSE * (x - 1)},${ZELLGROESSE * (y - 1)})`);
    hitBox.setAttribute("style", "fill:rgb(0,0,255);stroke-width:2;stroke:rgb(255,0,0);fill-opacity:0.1;stroke-opacity:0.9")
    debug.appendChild(hitBox);
    let wasOk = false;
    let c = 0;
    while (!wasOk && c < 10) {
        wasOk = await placeRecursive(field, schiffeGruppe, debug, [...schiffe], rng);
        c++;
    }
    return wasOk;
}



async function urlToSvg(logoUrl, width, height) {
    const response = await fetch(logoUrl);
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }
    const text = await response.text();
    var parser = new DOMParser();
    var doc = parser.parseFromString(text, "image/svg+xml");

    const schiffBox = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    schiffBox.setAttribute('transform', `scale(${width / doc.children[0].viewBox.baseVal.width},${height / doc.children[0].viewBox.baseVal.height})`);
    for (var children of doc.children[0].children) {
        schiffBox.appendChild(children)
    }

    return schiffBox;
}

// Platzierung des Logos vom Sportverein
function platziereLogo(svg) {
    const logoUrl = 'assets/logo.svg';

    // Funktion zum Erstellen und Platzieren eines Logos
    async function maleLogo(x, y) {
        let doc = await urlToSvg(logoUrl, LOGOGROESSE, LOGOGROESSE)
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('transform', `translate(${x},${y})`);
        group.appendChild(doc);
        svg.appendChild(group);
    }

    // Platziere Logo in der oberen linken Ecke
    maleLogo(RANDBREITE * 0.2, RANDBREITE * 0.2);

    // Platziere Logo in der unteren rechten Ecke
    maleLogo(GESAMTGROESSE - RANDBREITE * 0.2 - LOGOGROESSE, GESAMTGROESSE - RANDBREITE * 0.2 - LOGOGROESSE);
}

// Platzierung der Credits am rechten Rand
function platziereCredits(svg) {
    const creditsText = 'Idee & Konzept: Lars Herud – Illustration: ' + SCHIFFZEICHNER + ' – Programmierung: Sören Helms, Jonas Veenhof';
    const githubText = 'Quellcode auf GitHub: https://github.com/HSoeren/schiffeversenken';

    const credits = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    credits.setAttribute('x', GESAMTGROESSE - RANDBREITE / 1.6);
    credits.setAttribute('y', GESAMTGROESSE - RANDBREITE);
    credits.setAttribute('font-size', ZELLGROESSE / 8);
    credits.setAttribute('font-family', 'Calibri, sans-serif');
    credits.setAttribute('font-weight', 'normal');
    credits.setAttribute('text-anchor', 'start');
    credits.setAttribute('transform', `rotate(270, ${GESAMTGROESSE - RANDBREITE / 1.6}, ${GESAMTGROESSE - RANDBREITE})`);
    credits.textContent = creditsText;

    svg.appendChild(credits);
}

// Platzierung der Scheibenbezeichnung am unteren Rand
function platziereBezeichnung(svg) {
    const bezeichnung = document.createElementNS('http://www.w3.org/2000/svg', 'text');

    bezeichnung.setAttribute('x', RANDBREITE);
    bezeichnung.setAttribute('y', GESAMTGROESSE - RANDBREITE / 3);
    bezeichnung.setAttribute('font-size', ZELLGROESSE / 5);
    bezeichnung.setAttribute('font-family', 'Calibri, sans-serif');
    bezeichnung.setAttribute('font-weight', 'bold');
    bezeichnung.setAttribute('text-anchor', 'start');
    bezeichnung.textContent = `${SCHEIBENBEZEICHNUNG} ${SEEDINFO}`;

    svg.appendChild(bezeichnung);
}

// Platzierung des Vereinsnamens am unteren Rand
function platziereVerein(svg) {
    const verein = document.createElementNS('http://www.w3.org/2000/svg', 'text');

    verein.setAttribute('x', GESAMTGROESSE - RANDBREITE);
    verein.setAttribute('y', GESAMTGROESSE - RANDBREITE / 3);
    verein.setAttribute('font-size', ZELLGROESSE / 5);
    verein.setAttribute('font-family', 'Calibri, sans-serif');
    verein.setAttribute('font-weight', 'normal');
    verein.setAttribute('text-anchor', 'end');
    verein.textContent = VEREINSNAME;

    svg.appendChild(verein);
}


async function erstellePlan() {
    const response = await fetch("assets/spielzettel.svg");
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }
    const text = await response.text();
    var parser = new DOMParser();
    var svg = parser.parseFromString(text, "image/svg+xml").children[0];

    const result = await platziereSchiffe(svg);
    const linienStaerke = 2;
    const fontSkalierung = 1.2;
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const RANDBREITE = 40;
    // Vertikale Linien
    for (let i = 0; i <= FELDGROESSE; i++) {
        const linie = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        linie.setAttribute('x1', RANDBREITE + i * ZELLGROESSE);
        linie.setAttribute('y1', RANDBREITE);
        linie.setAttribute('x2', RANDBREITE + i * ZELLGROESSE);
        linie.setAttribute('y2', RANDBREITE + FELDGROESSE * ZELLGROESSE);
        linie.setAttribute('stroke', 'black');
        linie.setAttribute('stroke-width', linienStaerke);
        group.appendChild(linie);
    }

    // Horizontale Linien
    for (let j = 0; j <= FELDGROESSE; j++) {
        const linie = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        linie.setAttribute('x1', RANDBREITE);
        linie.setAttribute('y1', RANDBREITE + j * ZELLGROESSE);
        linie.setAttribute('x2', RANDBREITE + FELDGROESSE * ZELLGROESSE);
        linie.setAttribute('y2', RANDBREITE + j * ZELLGROESSE);
        linie.setAttribute('stroke', 'black');
        linie.setAttribute('stroke-width', linienStaerke);
        group.appendChild(linie);
    }
    for (let i = 0; i < FELDGROESSE; i++) {
        // Zahlen (1-10) oberhalb des Schachbretts
        const zahl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        zahl.setAttribute('x', RANDBREITE + i * ZELLGROESSE + ZELLGROESSE / 2);
        zahl.setAttribute('y', RANDBREITE / 2);
        zahl.setAttribute('text-anchor', 'middle');
        zahl.setAttribute('dominant-baseline', 'central');
        zahl.setAttribute('font-family', 'Calibri, sans-serif');
        zahl.setAttribute('font-weight', 'bold');
        zahl.setAttribute('font-size', RANDBREITE / fontSkalierung);
        zahl.textContent = i + 1;
        group.appendChild(zahl);

        // Buchstaben (A-J) links vom Schachbrett
        const buchstabe = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        buchstabe.setAttribute('x', RANDBREITE / 2);
        buchstabe.setAttribute('y', RANDBREITE + i * ZELLGROESSE + ZELLGROESSE / 2);
        buchstabe.setAttribute('text-anchor', 'middle');
        buchstabe.setAttribute('dominant-baseline', 'central');
        buchstabe.setAttribute('font-family', 'Calibri, sans-serif');
        buchstabe.setAttribute('font-weight', 'bold');
        buchstabe.setAttribute('font-size', RANDBREITE / fontSkalierung);
        buchstabe.textContent = String.fromCharCode(65 + i);
        group.appendChild(buchstabe);
    }
    group.appendChild(result.schiffeGruppe);
    result.schiffeGruppe.setAttribute('transform', `translate(${RANDBREITE},${RANDBREITE})`)
    result.debug.setAttribute('transform', `translate(${RANDBREITE},${RANDBREITE})`)
    if (DEBUG) {
        group.appendChild(result.debug);
    }
    group.setAttribute('transform', `scale(0.4,0.4)`);


    var tleft = svg.getElementById('TOPLEFT');
    tleft.appendChild(group.cloneNode(true));
    tleft.setAttribute('transform', "matrix(4.16667,0,0,4.16667,0,0) translate(55,220)")
    var tright = svg.getElementById('TOPRIGHT');
    tright.appendChild(group.cloneNode(true));
    tright.setAttribute('transform', "matrix(4.16667,0,0,4.16667,0,0) translate(310,220)")
    var dleft = svg.getElementById('BOTTOMLEFT');
    dleft.appendChild(group.cloneNode(true));
    dleft.setAttribute('transform', "matrix(4.16667,0,0,4.16667,0,0) translate(55,490)")
    var dright = svg.getElementById('BOTTOMRIGHT');
    dright.appendChild(group.cloneNode(true));
    dright.setAttribute('transform', "matrix(4.16667,0,0,4.16667,0,0) translate(310,490)")

    const planseed = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    planseed.setAttribute('x', 10);
    planseed.setAttribute('y', 10);
    planseed.setAttribute('text-anchor', 'left');
    planseed.setAttribute('dominant-baseline', 'central');
    planseed.setAttribute('font-family', 'Calibri, sans-serif');
    planseed.setAttribute('font-weight', 'normal');
    planseed.setAttribute('font-size', '20 px');
    planseed.textContent = '[' + SEED + ']';
    planseed.setAttribute('transform', `scale(0.5,0.5) translate(650,120)`);
    var head = svg.getElementById('HEAD');
    head.appendChild(planseed);
    return svg;
}

async function zeigePlan() {
    const spielfeld = document.getElementById('spielfeld');
    spielfeld.innerHTML = '';
    const plan = await erstellePlan();
    spielfeld.appendChild(plan);
}

async function zeigeSpielfeld() {
    const spielfeld = document.getElementById('spielfeld');
    spielfeld.innerHTML = '';
    const plan = await erstelleSpielfeld();;
    spielfeld.appendChild(plan);
}

function downloadfile(spielfeld, name) {
    spielfeld.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    spielfeld.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

    // Serialisiere das SVG
    const svgData = new XMLSerializer().serializeToString(spielfeld);

    // Erstelle einen Blob und Download-Link
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${name}-${SEED}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}
async function downloadPlan() {
    const spielfeld = await erstellePlan();
    downloadfile(spielfeld, 'SpielPlan');
}

document.getElementById("spielplan-svg").onclick = downloadPlan;

window.onload = () => {
    if (PLAN) {
        zeigePlan();
    }
    else {
        zeigeSpielfeld();
    }
};

async function downloadSVG() {
    const spielfeld = await erstelleSpielfeld();
    downloadfile(spielfeld, 'Spielfeld');
}

document.getElementById("scheibe-svg").onclick = downloadSVG;

document.getElementById("neuer-seed").onclick = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('seed', Math.floor(1 + Math.random() * 99999));
    window.location.href = url.href;

};

document.getElementById("seed-open").onclick = () => {
    var item = document.getElementById('seed-text');
    const url = new URL(window.location.href);
    url.searchParams.set('seed', item.value);
    window.location.href = url.href;

};




