const FELDGROESSE = 10;
const ZELLGROESSE = 70; // 700 // 70 mm * 10 Pixel/mm
const RANDBREITE = ZELLGROESSE / 2; // 350 Pixel
const GESAMTGROESSE = FELDGROESSE * ZELLGROESSE + 2 * RANDBREITE; // 8000 Pixel

const LOGOGROESSE = RANDBREITE * 0.7; // 80% der Randbreite
const SCHIFFZEICHNER = 'Lars Lars Herud, Sören Helms, Andrea Helms';    // Name der Illustratoren
const SCHEIBENBEZEICHNUNG = 'Bogenschießen Schiffe versenken';          // Name der Scheibe

const SCHIFFE = [
    { 
        name: 'Flugzeug', 
        groesse: 1, 
        farbe: 'red',
        image: '/schiffe/Flugzeug.svg'
    },
    { 
        name: 'Helikopter', 
        groesse: 1, 
        farbe: 'lightblue',
        image: '/schiffe/Helikopter.svg'
    },
    { 
        name: 'Schnellboot', 
        groesse: 1, 
        farbe: 'darkblue',
        image: '/schiffe/Schnellboot.svg'
    },
    { 
        name: 'Kreuzer', 
        groesse: 2, 
        farbe: 'green',
        image: '/schiffe/Kreuzer.svg'
    },
    {
        name: 'U-Boot',
        groesse: 3,
        farbe: 'yellow',
        image: '/schiffe/U-Boot.svg'
    },
    {
        name: 'Zerstörer',
        groesse: 4,
        farbe: 'orange',
        image: '/schiffe/Zerstoerer.svg'
    },
    {
        name: 'Flugzeugträger',
        groesse: 5,
        farbe: 'purple',
        image: '/schiffe/Flugzeugtraeger.svg'
    }
];

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
}

// Schiffe zufällig platzieren
function platziereSchiffe(svg) {
    let belegteFelder;          // const kann nicht verwendet werden, da belegteFelder neu gesetzt wird
    let platzierungErfolgreich = false;
    const schiffeGruppe = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(schiffeGruppe);

    // Schiffe platzieren, bis keine Kollisionen mehr vorhanden sind
    while (!platzierungErfolgreich) {
        belegteFelder = new Set();
        schiffeGruppe.innerHTML = ''; // Nur die Schiffe löschen, nicht das Spielfeld

        // für jedes Schiff in der Liste SCHIFFE wird eine zufällige Koordinate ermittelt
        // dann geprüft, ob das Schiff dort platziert werden kann, wenn ja, wird ein farbiges Rechteck gezeichnet
        SCHIFFE.forEach(schiff => {
            let platziert = false;
            while (!platziert) {
                const x = Math.floor(Math.random() * FELDGROESSE);
                const y = Math.floor(Math.random() * FELDGROESSE);
                const horizontal = Math.random() < 0.5; // zufällige Ausrichtung
                
                if (kannPlatzieren(x, y, schiff.groesse, horizontal, belegteFelder)) {
                    for (let i = 0; i < schiff.groesse; i++) {
                        const schiffX = horizontal ? x + i : x;
                        const schiffY = horizontal ? y : y + i;
                        
                        const schiffBox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                        schiffBox.setAttribute('x', RANDBREITE + schiffX * ZELLGROESSE);
                        schiffBox.setAttribute('y', RANDBREITE + schiffY * ZELLGROESSE);
                        schiffBox.setAttribute('width', ZELLGROESSE);
                        schiffBox.setAttribute('height', ZELLGROESSE);
                        schiffBox.setAttribute('fill', schiff.farbe);
                        schiffeGruppe.appendChild(schiffBox);
                        
                        belegteFelder.add(`${schiff.name}: ${schiffX},${schiffY}`);
                    }
                    platziert = true;
                }
            }
        });

        // Beenden der While-Schleife, wenn keine Kollisionen gefunden wurden
        platzierungErfolgreich = !pruefeKollisionen(belegteFelder);
    }

    console.log(belegteFelder);
}

// Funktion zur Überprüfung, ob ein Schiff an einer bestimmten Position platziert werden kann
// Regel: 1 Feld Platz drumherum
function kannPlatzieren(x, y, groesse, horizontal, belegteFelder) {
    for (let i = 0; i < groesse; i++) {
        const schiffX = horizontal ? x + i : x;
        const schiffY = horizontal ? y : y + i;
        
        if (schiffX >= FELDGROESSE || schiffY >= FELDGROESSE) {
            return false;
        }
        
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const checkX = schiffX + dx;
                const checkY = schiffY + dy;
                if (checkX >= 0 && checkX < FELDGROESSE && checkY >= 0 && checkY < FELDGROESSE) {
                    if (belegteFelder.has(`${checkX},${checkY}`)) {
                        return false;
                    }
                }
            }
        }
    }
    return true;
}

// Funktion zur Überprüfung von Kollisionen nach der Platzierung
// Alle Felder werden in ein Array umgewandelt und paarweise auf Kollisionen geprüft
function pruefeKollisionen(belegteFelder) {
    const felderArray = Array.from(belegteFelder);
    for (let i = 0; i < felderArray.length; i++) {
        const [schiff1, koordinaten1] = felderArray[i].split(': ');
        const [x1, y1] = koordinaten1.split(',').map(Number);
        
        for (let j = i + 1; j < felderArray.length; j++) {
            const [schiff2, koordinaten2] = felderArray[j].split(': ');
            const [x2, y2] = koordinaten2.split(',').map(Number);
            
            if (schiff1 !== schiff2 && Math.abs(x1 - x2) <= 1 && Math.abs(y1 - y2) <= 1) {
                return true; // Kollision gefunden
            }
        }
    }
    return false; // Keine Kollisionen
}

// Platzierung des Logos vom Sportverein
function platziereLogo(svg) {
    const logoUrl = '/assets/logo.svg';

    // Funktion zum Erstellen und Platzieren eines Logos
    function maleLogo(x, y) {
        const logo = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        logo.setAttributeNS('http://www.w3.org/1999/xlink', 'href', logoUrl);
        logo.setAttribute('width', LOGOGROESSE);
        logo.setAttribute('height', LOGOGROESSE);
        logo.setAttribute('x', x);
        logo.setAttribute('y', y);
        svg.appendChild(logo);
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

window.onload = erstelleSpielfeld;