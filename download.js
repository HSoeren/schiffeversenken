function downloadSVG() {
    const svgElement = document.getElementById("spielfeld");
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "spielfeld.svg";
    link.click();
    URL.revokeObjectURL(url);
}

document.getElementById("spielfeld").onclick = downloadSVG;