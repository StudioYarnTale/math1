
let activeInput = null;


//////////////////////////////////////////////////////////
// INIT
//////////////////////////////////////////////////////////

window.onload = function () {

    const calcInput = document.getElementById("calcInput");
    calcInput.addEventListener("focus", () => activeInput = calcInput);
    activeInput = calcInput;
    calcInput.focus();
};



function insertFunc(value) {
    if (!activeInput) return;
    activeInput.value += value;
    activeInput.focus();
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


function deleteLast() {
    if (!activeInput) return;
    activeInput.value = activeInput.value.slice(0, -1);
    activeInput.focus();
}


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