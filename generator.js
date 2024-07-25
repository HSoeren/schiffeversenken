const FELDGROESSE = 10;
const ZELLGROESSE = 70; // 700 // 70 mm * 10 Pixel/mm
const RANDBREITE = ZELLGROESSE / 2; // 350 Pixel
const GESAMTGROESSE = FELDGROESSE * ZELLGROESSE + 2 * RANDBREITE; // 8000 Pixel

const SCHIFFE = [
    { 
        name: 'Flugzeug', 
        groesse: 1, 
        svg: '/schiffe/Flugzeug.svg'
    },
    { 
        name: 'Helikopter', 
        groesse: 1, 
        svg: '/schiffe/Helikopter.svg'
    },
    { 
        name: 'Schnellboot', 
        groesse: 1, 
        svg: '/schiffe/Schnellboot.svg'
    },
    { 
        name: 'Kreuzer', 
        groesse: 2, 
        svg: '/schiffe/Kreuzer.svg'
    },
    {
        name: 'U-Boot',
        groesse: 3,
        svg: '/schiffe/U-Boot.svg'
    },
    {
        name: 'Zerstörer',
        groesse: 4,
        svg: '/schiffe/Zerstoerer.svg'
    },
    {
        name: 'Flugzeugträger',
        groesse: 5,
        svg: '/schiffe/Flugzeugtraeger.svg'
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


    spielfeld.appendChild(svg);
}

window.onload = erstelleSpielfeld;