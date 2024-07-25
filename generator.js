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

    spielfeld.appendChild(svg);
}

window.onload = erstelleSpielfeld;