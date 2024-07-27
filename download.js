function downloadSVG() {
    const svgElement = document.querySelector("svg");
    
    // Entferne eventuelle Skript-Tags
    const scripts = svgElement.getElementsByTagName('script');
    while (scripts.length > 0) {
        scripts[0].parentNode.removeChild(scripts[0]);
    }

    // Füge Namespace-Deklarationen hinzu
    svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgElement.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

    // Serialisiere das SVG
    const svgData = new XMLSerializer().serializeToString(svgElement);

    // Erstelle einen Blob und Download-Link
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "spielfeld.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

document.getElementById("scheibe-svg").onclick = downloadSVG;