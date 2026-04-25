const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let activeInput = null;

let scale = 40;
let originX = canvas.width / 2;
let originY = canvas.height / 2;

let isDragging = false;
let dragStartX, dragStartY;

let graphs = [];

//////////////////////////////////////////////////////////
// INIT
//////////////////////////////////////////////////////////

window.onload = function () {

    const calcInput = document.getElementById("calcInput");
    const funcInput = document.getElementById("funcInput");

    calcInput.addEventListener("focus", () => activeInput = calcInput);
    funcInput.addEventListener("focus", () => activeInput = funcInput);

    activeInput = funcInput;

    drawGrid();
};

//////////////////////////////////////////////////////////
// GRID
//////////////////////////////////////////////////////////

function drawGrid() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;

    for (let x = originX % scale; x < canvas.width; x += scale) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = originY % scale; y < canvas.height; y += scale) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(canvas.width, originY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, canvas.height);
    ctx.stroke();
}

//////////////////////////////////////////////////////////
// MATH PARSER
//////////////////////////////////////////////////////////

function transformExpr(expr) {

    return expr
        .replace(/\blog10\b/g, "Math.log10")
        .replace(/\blog\b/g, "Math.log")
        .replace(/\basinh\b/g, "Math.asinh")
        .replace(/\bacosh\b/g, "Math.acosh")
        .replace(/\batanh\b/g, "Math.atanh")
        .replace(/\bsinh\b/g, "Math.sinh")
        .replace(/\bcosh\b/g, "Math.cosh")
        .replace(/\btanh\b/g, "Math.tanh")
        .replace(/\basin\b/g, "Math.asin")
        .replace(/\bacos\b/g, "Math.acos")
        .replace(/\batan\b/g, "Math.atan")
        .replace(/\bsin\b/g, "Math.sin")
        .replace(/\bcos\b/g, "Math.cos")
        .replace(/\btan\b/g, "Math.tan")
        .replace(/\bexp\b/g, "Math.exp")
        .replace(/\bsqrt\b/g, "Math.sqrt")
        .replace(/\babs\b/g, "Math.abs")
        .replace(/\brad\(/g, "(Math.PI/180)*(")
        .replace(/\bdeg\(/g, "(180/Math.PI)*(")
        .replace(/\^/g, "**");
}

function mathEval(expr, x) {
    expr = transformExpr(expr);
return Function("x", "return (" + expr + ")")(x);
}

//////////////////////////////////////////////////////////
// REDRAW SYSTEM
//////////////////////////////////////////////////////////

function redrawAll() {
    drawGrid();

    graphs.forEach(g => {

        ctx.strokeStyle = g.color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        let first = true;

        for (let px = 0; px < canvas.width; px++) {

            let realX = (px - originX) / scale;

            let y;

            try {
                y = mathEval(g.expr, realX);
            } catch {
                first = true;
                continue;
            }

            if (!isFinite(y)) {
                first = true;
                continue;
            }

            let py = originY - y * scale;

            if (first) {
                ctx.moveTo(px, py);
                first = false;
            } else {
                ctx.lineTo(px, py);
            }
        }

        ctx.stroke();
    });
}

//////////////////////////////////////////////////////////
// DRAW FUNCTION
//////////////////////////////////////////////////////////

function draw() {

    const expr = document.getElementById("funcInput").value;
    if (!expr) return;

    graphs.push({
        expr: expr,
        color: randomColor()
    });

    redrawAll();
}

//////////////////////////////////////////////////////////
// CALCULATOR
//////////////////////////////////////////////////////////

function calcEval(expr) {
    expr = transformExpr(expr);
    return Function("return " + expr)();
}






function calculate() {

    const expr = document.getElementById("calcInput").value;

    try {

        const result = calcEval(expr);
        lastResult = result;

        const box = document.getElementById("scientificBox");

        // Основной текст результата
        document.getElementById("calcResult").innerText =
            "Result: f(x) = " + result;

        // --- ЛОГИКА ФОРМАТА ---
        const absVal = Math.abs(result);

        if (absVal >= 10000 || (absVal > 0 && absVal < 0.001)) {

            // Научная запись
            const digits = 3;
            const exp = result.toExponential(digits);
            const [mantissa, exponent] = exp.split("e");

            box.innerHTML =
                mantissa + " × 10<sup>" + parseInt(exponent) + "</sup>";

        } else {

            // Обычный вид (аккуратное округление до 6 знаков максимум)
            box.innerHTML = parseFloat(result.toFixed(3));
        }

        box.style.display = "block";

        addToHistory(expr, result);

    } catch {
        document.getElementById("calcResult").innerText = "Error";
    }
}




let lastResult = null;
function showScientific() {

    if (lastResult === null) return;

    const digits = 3;

    const exp = lastResult.toExponential(digits);
    const [mantissa, exponent] = exp.split("e");

    const formatted =
        mantissa + " × 10<sup>" + parseInt(exponent) + "</sup>";

    const box = document.getElementById("scientificBox");
    box.innerHTML = formatted;
    box.style.display = "block";
}


function addToHistory(expr, result) {
    const history = document.getElementById("calcHistory");
    const item = document.createElement("li");
    item.textContent = expr + " = " + result;
    history.prepend(item);
}

//////////////////////////////////////////////////////////
// INTERFACE
//////////////////////////////////////////////////////////

function insertFunc(value) {
    if (!activeInput) return;
    activeInput.value += value;
    activeInput.focus();
}

function clearFunc() {
    document.getElementById("funcInput").value = "";
}

function deleteLast() {
    if (!activeInput) return;
    activeInput.value = activeInput.value.slice(0, -1);
    activeInput.focus();
}

function clearCanvas() {
    graphs = [];
    drawGrid();
}

function randomColor() {
    return `hsl(${Math.random()*360}, 80%, 45%)`;
}

//////////////////////////////////////////////////////////
// ZOOM
//////////////////////////////////////////////////////////

canvas.addEventListener("wheel", function(event) {
    event.preventDefault();
    const zoomFactor = 1.1;

    if (event.deltaY < 0) scale *= zoomFactor;
    else scale /= zoomFactor;

    redrawAll();
});

//////////////////////////////////////////////////////////
// PAN
//////////////////////////////////////////////////////////

canvas.addEventListener("mousedown", function(e) {
    isDragging = true;
    dragStartX = e.offsetX;
    dragStartY = e.offsetY;
});

canvas.addEventListener("mousemove", function(e) {

    if (!isDragging) return;

    originX += e.offsetX - dragStartX;
    originY += e.offsetY - dragStartY;

    dragStartX = e.offsetX;
    dragStartY = e.offsetY;

    redrawAll();
});

canvas.addEventListener("mouseup", () => isDragging = false);
canvas.addEventListener("mouseleave", () => isDragging = false);

//////////////////////////////////////////////////////////
// ENTER KEY
//////////////////////////////////////////////////////////

document.getElementById("calcInput")
.addEventListener("keydown", function(event) {
    if (event.key === "Enter") calculate();
});

document.getElementById("funcInput")
.addEventListener("keydown", function(event) {
    if (event.key === "Enter") draw();
});


//////////////////////////////////////////////////////////
// CALC WRAPPERS (возвращаем умное поведение)
//////////////////////////////////////////////////////////

function wrapCalc(wrapperStart, wrapperEnd = ")") {
    const input = document.getElementById("calcInput");
    let expr = input.value.trim();
    if (!expr) return;
    input.value = wrapperStart + expr + wrapperEnd;
    input.focus();
}

function negateCalc() {
    const input = document.getElementById("calcInput");
    let expr = input.value.trim();
    if (!expr) return;
    input.value = "(-1)*(" + expr + ")";
    input.focus();
}

function wrapRoot(n) {
    const input = document.getElementById("calcInput");
    let expr = input.value.trim();
    if (!expr) return;
    input.value = "Math.pow((" + expr + "),1/" + n + ")";
    input.focus();
}


function clearCalc() {
    document.getElementById("calcInput").value = "";
    document.getElementById("calcResult").innerText = "";
}


let angleMode = "rad";

function toDeg() {

    const input = document.getElementById("calcInput");
    let value = parseFloat(input.value);

    // если не число — попробуем вычислить
    if (isNaN(value)) {
        try {
            value = calcEval(input.value);
        } catch {
            return;
        }
    }

    input.value = parseFloat((value * 180 / Math.PI).toFixed(6));
    angleMode = "deg";
}



function toRad() {

    const input = document.getElementById("calcInput");
    let value = parseFloat(input.value);

    // если не число — вычисляем выражение
    if (isNaN(value)) {
        try {
            value = calcEval(input.value);
        } catch {
            return;
        }
    }

    value = value * Math.PI / 180;

    input.value = parseFloat(value.toFixed(6));
    angleMode = "rad";
}