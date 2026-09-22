const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const dedicationBox =
    document.getElementById(
        "dedicationBox"
    );

let regions = [];

let sourceCanvas;
let sourceCtx;
let imageData;

let sourceWidth = 0;
let sourceHeight = 0;

let minX = Infinity;
let maxX = -Infinity;
let minY = Infinity;
let maxY = -Infinity;

let currentRegion = 0;


// ==========================
// TAMAÑO DE PANTALLA
// ==========================

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    drawScene();
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();


// ==========================
// CARGAR JSON
// ==========================

async function loadDrawing() {

    try {

        const response = await fetch(
            "resources/sunflowers.json"
        );

        if (!response.ok) {
            throw new Error(
                "No se pudo cargar sunflowers.json"
            );
        }

        regions = await response.json();

        prepareDrawing();

        requestAnimationFrame(animateDrawing);

    } catch (error) {

        console.error(
            "Error cargando el dibujo:",
            error
        );
    }
}


// ==========================
// PREPARAR IMAGEN
// ==========================

function prepareDrawing() {

    // Calcular límites sin usar Math.min(...array)
    // porque el JSON tiene muchísimos puntos

    regions.forEach((region) => {

        region.contour.forEach((point) => {

            const x = point[0];
            const y = point[1];

            if (x < minX) minX = x;
            if (x > maxX) maxX = x;

            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        });
    });


    sourceWidth =
        maxX - minX + 1;

    sourceHeight =
        maxY - minY + 1;


    // Canvas interno
    sourceCanvas =
        document.createElement("canvas");

    sourceCanvas.width =
        sourceWidth;

    sourceCanvas.height =
        sourceHeight;


    sourceCtx =
        sourceCanvas.getContext("2d");


    // Crear imagen vacía
    imageData =
        sourceCtx.createImageData(
            sourceWidth,
            sourceHeight
        );
}


// ==========================
// DIBUJAR UNA REGIÓN
// ==========================

function paintRegion(region) {

    const r =
        Math.round(region.color[0]);

    const g =
        Math.round(region.color[1]);

    const b =
        Math.round(region.color[2]);


    region.contour.forEach((point) => {

        const x =
            point[0] - minX;

        const y =
            point[1] - minY;


        const index =
            (y * sourceWidth + x) * 4;


        imageData.data[index] = r;
        imageData.data[index + 1] = g;
        imageData.data[index + 2] = b;
        imageData.data[index + 3] = 255;
    });
}


// ==========================
// ANIMACIÓN
// ==========================

function animateDrawing() {

    const regionsPerFrame = 1;

    for (
        let i = 0;
        i < regionsPerFrame;
        i++
    ) {

        if (currentRegion >= regions.length) {
            break;
        }

        paintRegion(
            regions[currentRegion]
        );

        currentRegion++;
    }

    sourceCtx.putImageData(
        imageData,
        0,
        0
    );

    drawScene();


    // ¿Todavía quedan regiones?
    if (currentRegion < regions.length) {

        requestAnimationFrame(
            animateDrawing
        );

    } else {

        // Terminó el dibujo
        setTimeout(() => {

            dedicationBox.classList.add(
                "show"
            );

        }, 700);
    }
}


// ==========================
// MOSTRAR EN PANTALLA
// ==========================

function drawScene() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.fillStyle = "black";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    if (!sourceCanvas) {
        return;
    }


    const availableWidth =
        canvas.width * 0.9;

    const availableHeight =
        canvas.height * 0.9;


    const scale = Math.min(
        availableWidth / sourceWidth,
        availableHeight / sourceHeight
    );


    const drawWidth =
        sourceWidth * scale;

    const drawHeight =
        sourceHeight * scale;


    const drawX =
        (canvas.width - drawWidth) / 2;

    const drawY =
        (canvas.height - drawHeight) / 2;


    // Mantener los píxeles definidos
    ctx.imageSmoothingEnabled = false;


    ctx.drawImage(
        sourceCanvas,
        drawX,
        drawY,
        drawWidth,
        drawHeight
    );
}

// ==========================
// INICIAR
// ==========================

loadDrawing();