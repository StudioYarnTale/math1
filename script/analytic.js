const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let graphs = [];

//////////////////////////////////////////////////////////
// PARSER
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
// COLOR
//////////////////////////////////////////////////////////

function randomColor(){
    return `hsl(${Math.random()*360},70%,45%)`;
}

//////////////////////////////////////////////////////////
// COORDINATE TRANSFORM
//////////////////////////////////////////////////////////

function transformX(x,xminC,xmaxC){
    return canvas.width*(x-xminC)/(xmaxC-xminC);
}

function inverseX(px,xminC,xmaxC){
    return xminC + px*(xmaxC-xminC)/canvas.width;
}

//////////////////////////////////////////////////////////
// GRID
//////////////////////////////////////////////////////////

function drawGrid(xmin,xmax,xminC,xmaxC,divisions){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    let dx=(xmax-xmin)/divisions;

    let labelStep = divisions>40 ? 10 : 5;

    ctx.strokeStyle="#ddd";
    ctx.lineWidth=1;

    for(let i=0;i<=divisions;i++){

        let x=xmin+i*dx;
        let px=transformX(x,xminC,xmaxC);

        ctx.beginPath();
        ctx.moveTo(px,0);
        ctx.lineTo(px,canvas.height);
        ctx.stroke();

        if(i%labelStep===0){

            ctx.fillStyle="#777";
            ctx.font="10px Arial";
            ctx.fillText(x.toFixed(1),px+2,canvas.height-5);
        }
    }
}

//////////////////////////////////////////////////////////
// GRAPH
//////////////////////////////////////////////////////////

function drawGraph(expr,color,xminC,xmaxC){

    ctx.strokeStyle=color;
    ctx.lineWidth=2;
    ctx.beginPath();

    let first=true;

    for(let px=0;px<canvas.width;px++){

        let x=inverseX(px,xminC,xmaxC);

        let y;

        try{
            y=mathEval(expr,x);
        }catch{
            first=true;
            continue;
        }

        if(!isFinite(y)){
            first=true;
            continue;
        }

        let py=canvas.height/2 - y*40;

        if(first){

            ctx.moveTo(px,py);
            first=false;

        }else{

            ctx.lineTo(px,py);
        }
    }

    ctx.stroke();
}

//////////////////////////////////////////////////////////
// POINTS
//////////////////////////////////////////////////////////

function drawPoints(expr,color,xmin,xmax,divisions,xminC,xmaxC){

    let dx=(xmax-xmin)/divisions;

    ctx.fillStyle=color;

    for(let i=0;i<=divisions;i++){

        let x=xmin+i*dx;

        let y;

        try{
            y=mathEval(expr,x);
        }catch{
            continue;
        }

        let px=transformX(x,xminC,xmaxC);
        let py=canvas.height/2 - y*40;

        ctx.beginPath();
        ctx.arc(px,py,4,0,Math.PI*2);
        ctx.fill();
    }
}

//////////////////////////////////////////////////////////
// TABLE
//////////////////////////////////////////////////////////

function buildTable(xmin,xmax,divisions){

    let old=document.getElementById("tableBox");
    if(old) old.remove();

    let dx=(xmax-xmin)/divisions;

    let box=document.createElement("div");
    box.id="tableBox";
    box.style.marginTop="10px";
    box.style.fontSize="10px";
    box.style.overflowX="auto";

    let table=document.createElement("table");
    table.style.margin="auto";
    table.style.borderCollapse="collapse";

    // row X
    let rowX=document.createElement("tr");

    let head=document.createElement("td");
    head.innerText="x";
    head.style.fontWeight="bold";
    head.style.padding="3px";
    rowX.appendChild(head);

    let xs=[];

    for(let i=0;i<=divisions;i++){

        let x=xmin+i*dx;
        xs.push(x);

        let td=document.createElement("td");
        td.innerText=x.toFixed(1);
        td.style.padding="3px";
        rowX.appendChild(td);
    }

    table.appendChild(rowX);

    // rows functions

    graphs.forEach((g,index)=>{

        let row=document.createElement("tr");

        let name=document.createElement("td");
        name.innerText="f"+(index+1)+"(x)";
        name.style.fontWeight="bold";
        name.style.padding="3px";
        row.appendChild(name);

        xs.forEach(x=>{

            let td=document.createElement("td");

            try{

                let y=mathEval(g.expr,x);

                td.innerText=y.toFixed(1);

            }catch{

                td.innerText=" ";
            }

            td.style.padding="3px";

            row.appendChild(td);

        });

        table.appendChild(row);

    });

    box.appendChild(table);

    canvas.parentNode.appendChild(box);
}

//////////////////////////////////////////////////////////
// DRAW
//////////////////////////////////////////////////////////

function draw(){

    const expr=document.getElementById("funcInput").value;

    if(!expr) return;

    let xmin=parseFloat(document.getElementById("xmin").value);
    let xmax=parseFloat(document.getElementById("xmax").value);
    let divisions=parseInt(document.getElementById("divisions").value);

    if(divisions>50) divisions=50;

    graphs.push({
        expr:expr,
        color:randomColor()
    });

    let width=xmax-xmin;
    let margin=0.1*width;

    let xminC=xmin-margin;
    let xmaxC=xmax+margin;

    drawGrid(xmin,xmax,xminC,xmaxC,divisions);

    graphs.forEach(g=>{

        drawGraph(g.expr,g.color,xminC,xmaxC);

        drawPoints(g.expr,g.color,xmin,xmax,divisions,xminC,xmaxC);

    });

    buildTable(xmin,xmax,divisions);
}

//////////////////////////////////////////////////////////
// CLEAR
//////////////////////////////////////////////////////////

function clearCanvas(){

    graphs=[];

    ctx.clearRect(0,0,canvas.width,canvas.height);

    let old=document.getElementById("tableBox");
    if(old) old.remove();
}

//////////////////////////////////////////////////////////
// INPUT HELPERS
//////////////////////////////////////////////////////////

function insertFunc(text){
    let input=document.getElementById("funcInput");
    input.value+=text;
}

function deleteLast(){
    let input=document.getElementById("funcInput");
    input.value=input.value.slice(0,-1);
}

function clearFunc(){
    document.getElementById("funcInput").value="";
}