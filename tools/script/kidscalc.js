
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

//////////////////////////////////////////////////////////
// ENTER KEY
//////////////////////////////////////////////////////////

document.getElementById("calcInput")
.addEventListener("keydown", function(event) {
    if (event.key === "Enter") calculate();
});



//////////////////////////////////////////////////////////
// CALCULATOR
//////////////////////////////////////////////////////////

function calcEval(expr) {
    expr = transformExpr(expr);
    return Function("return " + expr)();
}


function calculate() {
    const input = document.getElementById("calcInput");
    let expr = input.value;
    if (!expr) return;
    try {
        const result = calcEval(expr);
        // показываем результат в том же поле
		input.value = Number(result.toFixed(3));
    } catch {
        input.value = "Error";
        setTimeout(() => {
            input.value = "";
        }, 1500);
    }
}

function sqrtCalc(){
    const input = document.getElementById("calcInput");
    if(!input.value) return;
    try{
        let value = calcEval(input.value);
        value = Math.sqrt(value);
        input.value = Number(value.toFixed(3));
    }catch{
        input.value="Error";
    }
}

function percentCalc(){
    const input = document.getElementById("calcInput");
    if(!input.value) return;
    try{
        let value = calcEval(input.value);
        value = value / 100;
        input.value = Number(value.toFixed(3));
    }catch{
        input.value="Error";
    }
}

function negateCalc() {
    const input = document.getElementById("calcInput");
    let expr = input.value.trim();
    if (!expr) return;
    input.value = "(-1)*(" + expr + ")";
    input.focus();
}


function clearCalc() {
    document.getElementById("calcInput").value = "";
    document.getElementById("calcResult").innerText = "";
}


function closeCalc(){
document.querySelector(".kids_calc_wrapper").style.display="none";
}

//закрытие по ESC
document.addEventListener("keydown", function(e){
if(e.key === "Escape"){
closeCalc();
}

});