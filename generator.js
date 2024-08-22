const FELDGROESSE = 10;     // 10x10 Felder
const urlParams = new URLSearchParams(window.location.search);
// 70 ist die urspruengliche Groesse, erzeugt aber ein 7700x7700 Pixel großes Feld
// Die Berechnung der Groesse muss noch einmal überarbeitet werden
const ZELLGROESSE = parseInt(urlParams.get('groesse')) || 70;
const SEED = parseInt(urlParams.get('seed')) || Math.floor(1 + Math.random() * 99999);
// Falls nichts angegeben gehts auf default: 70 zurück
const RANDBREITE = ZELLGROESSE / 2; // 350 Pixel
const GESAMTGROESSE = FELDGROESSE * ZELLGROESSE + 2 * RANDBREITE; // 8000 Pixel = 800 mm = 80 cm 
// irgendwas stimmt hier nicht, das Feld ist irgendwie 7700x7700 Pixel groß

const LOGOGROESSE = RANDBREITE * 0.7; // 80% der Randbreite
const SCHIFFZEICHNER = 'Lars Lars Herud, Sören Helms, Andrea Helms';    // Name der Illustratoren
const SCHEIBENBEZEICHNUNG = 'Bogenschießen Schiffe versenken ' + SEED;          // Name der Scheibe
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
        imageHor: 'schiffe/Flugzeugtraeger-hor.svg'
    },
    {
        name: 'Zerstörer',
        groesse: 4,
        breite: 1,
        farbe: 'orange',
        image: 'schiffe/Zerstoerer.svg',
        imageHor: 'schiffe/Zerstoerer-hor.svg'
    },
    {
        name: 'U-Boot',
        groesse: 3,
        breite: 1,
        farbe: 'yellow',
        image: 'schiffe/U-Boot.svg',
        imageHor: 'schiffe/U-Boot-hor.svg'
    },
    {
        name: 'Kreuzer',
        groesse: 2,
        breite: 1,
        farbe: 'green',
        image: 'schiffe/Kreuzer.svg',
        imageHor: 'schiffe/Kreuzer-hor.svg'
    },
    {
        name: 'Flugzeug',
        groesse: 1,
        breite: 1,
        farbe: 'red',
        image: 'schiffe/Flugzeug.svg',
        imageHor: 'schiffe/Flugzeug.svg'    // gibt nur eine Orientierung
    },
    {
        name: 'Helikopter',
        groesse: 1,
        breite: 1,
        farbe: 'lightblue',
        image: 'schiffe/Helikopter.svg',
        imageHor: 'schiffe/Helikopter.svg'    // gibt nur eine Orientierung
    },
    {
        name: 'Schnellboot',
        groesse: 1,
        breite: 1,
        farbe: 'darkblue',
        image: 'schiffe/Schnellboot.svg',
        imageHor: 'schiffe/Schnellboot.svg'    // gibt nur eine Orientierung
    },
];
var rng = new Random(SEED);


function erstelleSpielfeld() {

    const spielfeld = document.getElementById('spielfeld');
    spielfeld.innerHTML = '';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '8000px');
    svg.setAttribute('height', '8000px');
    svg.setAttribute('viewBox', `0 0 ${GESAMTGROESSE} ${GESAMTGROESSE}`);

    // Äußerer Rand
    const rand = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rand.setAttribute('x', '0');
    rand.setAttribute('y', '0');
    rand.setAttribute('width', GESAMTGROESSE);
    rand.setAttribute('height', GESAMTGROESSE);
    rand.setAttribute('fill', 'none');
    rand.setAttribute('stroke', 'black');
    rand.setAttribute('stroke-width', '2');
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

    platziereSchiffe(svg);

    spielfeld.appendChild(svg);

    platziereLogo(svg);

    platziereCredits(svg);

    platziereBezeichnung(svg);

    platziereVerein(svg);
}

// Schiffe zufällig platzieren
async function platziereSchiffe(svg) {
    const debug = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    debug.setAttribute('transform', `translate(${RANDBREITE},${RANDBREITE})`)

    // uncomment line to see debug
    // svg.appendChild(debug);

    const schiffeGruppe = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    schiffeGruppe.setAttribute('transform', `translate(${RANDBREITE},${RANDBREITE})`)
    svg.appendChild(schiffeGruppe);

    const field = []
    for (var c = 0; c < FELDGROESSE; c++) {
        field.push(new Array(FELDGROESSE).fill(0))
    }
    // Schiffe platzieren, bis keine Kollisionen mehr vorhanden sind
    await placeRecursive(field, schiffeGruppe, debug, SCHIFFE)
}

async function placeRecursive(field, schiffeGruppe, debug, schiffe) {
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
    const schiffBox = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

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
    schiffBox.setAttribute('width', schiffBreite);
    schiffBox.setAttribute('height', schiffHöhe);
    schiffBox.setAttribute('transform', `translate(${px},${py}) rotate(${90 * rotation} ${ZELLGROESSE / 2} ${ZELLGROESSE / 2})`);
    const svg = await urlToSvg(schiff.image);
    schiffBox.appendChild(svg);
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
    // hitBox.setAttribute('fill', "red");
    hitBox.setAttribute("style", "fill:rgb(0,0,255);stroke-width:3;stroke:red;fill-opacity:0.1;stroke-opacity:0.9")
    debug.appendChild(hitBox);
    let wasOk = false;
    let c = 0;
    while (!wasOk && c < 10) {
        wasOk = await placeRecursive(field, schiffeGruppe, debug, [...schiffe]);
        c++;
    }
    return wasOk;
}



async function urlToSvg(logoUrl) {
    const response = await fetch(logoUrl);
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }
    const text = await response.text();
    var parser = new DOMParser();
    var doc = parser.parseFromString(text, "image/svg+xml");
    return doc.children[0];
}

// Platzierung des Logos vom Sportverein
function platziereLogo(svg) {
    const logoUrl = 'assets/logo.svg';

    // Funktion zum Erstellen und Platzieren eines Logos
    async function maleLogo(x, y) {
        let doc = await urlToSvg(logoUrl)
        doc.setAttribute('width', LOGOGROESSE);
        doc.setAttribute('height', LOGOGROESSE);
        doc.setAttribute('x', x);
        doc.setAttribute('y', y);
        svg.appendChild(doc);
    }

    // Platziere Logo in der oberen linken Ecke
    maleLogo(RANDBREITE * 0.2, RANDBREITE * 0.2);

    // Platziere Logo in der unteren rechten Ecke
    maleLogo(GESAMTGROESSE - RANDBREITE * 0.2 - LOGOGROESSE, GESAMTGROESSE - RANDBREITE * 0.2 - LOGOGROESSE);
}

// Platzierung der Credits am rechten Rand
function platziereCredits(svg) {
    const creditsText = 'Idee & Konzept: Lars Herud – Illustration: ' + SCHIFFZEICHNER + ' – Programmierung: Sören Helms';
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
    const abmessung = GESAMTGROESSE / 10;

    bezeichnung.setAttribute('x', RANDBREITE);
    bezeichnung.setAttribute('y', GESAMTGROESSE - RANDBREITE / 3);
    bezeichnung.setAttribute('font-size', ZELLGROESSE / 5);
    bezeichnung.setAttribute('font-family', 'Calibri, sans-serif');
    bezeichnung.setAttribute('font-weight', 'bold');
    bezeichnung.setAttribute('text-anchor', 'start');
    bezeichnung.textContent = `${SCHEIBENBEZEICHNUNG} (${abmessung} x ${abmessung} cm)`;

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

window.onload = erstelleSpielfeld;