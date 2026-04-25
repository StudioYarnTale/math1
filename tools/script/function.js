// ======================
// GLOBAL VARIABLES
// ======================

// canvas
const canvas = document.getElementById("grid");
const ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;

// grid settings
const minorPx = 40;
const majorPx = 20;
const padding = 40;
const snapStep = 0.5;

// coordinate system
let xmin = -10;
let xmax = 10;
let ymin = -10;
let ymax = 10;
let centerX;
let centerY;
let scale;

// input focus
let activeInput = null;

// interaction
let mode = "point";
let mouseX = null;
let mouseY = null;
let mouseDown = false;
let vectorStart = null;

// drawing objects
let points = [];
let vectors = [];
let freehandLines = [];
let currentFreehand = [];
let labels = [];

// functions
let functions = [];

// color
let currentColor = "#ff3366";






// ======================
// MAIN PROGRAM
// ======================
//****строим все!!!******
draw();







// ======================
//EventListener
// ======================

canvas.addEventListener("click",function(e){
	if(mode==="text"){
		let rect = canvas.getBoundingClientRect();
		let x = e.clientX - rect.left;
		let y = e.clientY - rect.top;
		let mx = (x-centerX)/scale;
		let my = (centerY-y)/scale;
		let text = prompt("Enter text:");
		if(text){
			labels.push({
				x:mx,
				y:my,
				text:text,
				color:currentColor
			});
			draw();
		}
		return;
	}
	let rect = canvas.getBoundingClientRect();
	let x = e.clientX - rect.left;
	let y = e.clientY - rect.top;
	let mx = (x-centerX)/scale;
	let my = (centerY-y)/scale;
	if(document.getElementById("snapToggle").checked){
		mx = snap(mx);
		my = snap(my);
	}
	if(mode==="point"){
		points.push({x:mx, y:my, color:currentColor});
		draw();
		return;
	}
	if(mode==="vector"){
		if(vectorStart===null){
			vectorStart = {x:mx,y:my};
		}else{
			vectors.push({
				x1:vectorStart.x,
				y1:vectorStart.y,
				x2:mx,
				y2:my,
				color:currentColor
			});
			vectorStart=null;
			draw();
		}
	}
	if(mode==="line"){
		if(vectorStart===null){
			vectorStart={x:mx,y:my};
		}else{
			vectors.push({
				x1:vectorStart.x,
				y1:vectorStart.y,
				x2:mx,
				y2:my,
				color:currentColor,
				type:"line"
			});
			vectorStart=null;
			draw();
		}
	}
});


canvas.addEventListener("mousemove",function(e){
	let rect = canvas.getBoundingClientRect();
	let x = e.clientX - rect.left;
	let y = e.clientY - rect.top;
	let mx = (x-centerX)/scale;
	let my = (centerY-y)/scale;
	document.getElementById("coords").innerText =
	"x = " + mx.toFixed(2) + "   y = " + my.toFixed(2);
	mouseX = mx;
	mouseY = my;
	if(mode==="freehand" && mouseDown){
		currentFreehand.push({x:mx,y:my});
		draw();
	}else{
		draw();
	}
});


canvas.addEventListener("mousedown",function(e){
	if(mode==="freehand"){
		mouseDown=true;
		currentFreehand=[];
		let rect = canvas.getBoundingClientRect();
		let x = e.clientX - rect.left;
		let y = e.clientY - rect.top;
		let mx = (x-centerX)/scale;
		let my = (centerY-y)/scale;
		currentFreehand.push({x:mx,y:my});
	}
});


canvas.addEventListener("mouseup",function(){
	if(mode==="freehand" && mouseDown){
		mouseDown=false;
		freehandLines.push(currentFreehand);
		draw();
	}
});


document.addEventListener("keydown",function(e){
	if(e.key==="Enter"){
		drawFunctionInput();
	}
});




/////////////////////////
// MATH PARSER
/////////////////////////
function transformExpr(expr){
return expr
        .replace(/\blog10\b/g, "Math.log10")
        .replace(/\blog\b/g, "Math.log")
		.replace(/\basinh\b/g, "Math.asinh")
        .replace(/\bacosh\b/g, "Math.acosh")
        .replace(/\batanh\b/g, "Math.atanh")
        .replace(/\bsinh\b/g, "Math.sinh")
        .replace(/\bcosh\b/g, "Math.cosh")
        .replace(/\btanh\b/g, "Math.tanh")
	.replace(/\basin\b/g,"Math.asin")
	.replace(/\bacos\b/g,"Math.acos")
	.replace(/\batan\b/g,"Math.atan")
	.replace(/\bsin\b/g,"Math.sin")
	.replace(/\bcos\b/g,"Math.cos")
	.replace(/\btan\b/g,"Math.tan")
	.replace(/\bexp\b/g,"Math.exp")
	.replace(/\bsqrt\b/g,"Math.sqrt")
	.replace(/\babs\b/g,"Math.abs")
	    .replace(/\brad\(/g, "(Math.PI/180)*(")
        .replace(/\bdeg\(/g, "(180/Math.PI)*(")
	.replace(/\^/g,"**");
}

function evalExpr(expr,vars){
expr = transformExpr(expr);
return Function(...Object.keys(vars),
"return "+expr)(...Object.values(vars));
}





// ======================
// MATH FUNCTIONS
// ======================

function round1(x){
return Math.round(x*10)/10;
}




// ========================================
// Draw Function - MAIN to draw everything
// ========================================
function draw(){
ctx.clearRect(0,0,width,height);
scale = (width - 2*padding) / (xmax - xmin);
centerX = padding - xmin*scale;
centerY = padding + ymax*scale;
drawGrid();
drawAxes();
drawLabels();
drawTitle();
drawSmoothFunctions();
drawParametricFunctions();
drawPolarFunctions();
drawTablePoints();
drawPoints();
drawVectors();
drawCursorCoords();
drawTextLabels();
drawFreehand();
updateTables();
}


// ======================
// BUTTON FUNCTIONS
// ======================
// ******interface**Button  Keyboard******


function insertText1(text){
let type = document.getElementById("functionType").value;
let field;
if(type==="cartesian") field = document.getElementById("fx");
if(type==="parametric") field = document.getElementById("xt"); 
if(type==="polar") field = document.getElementById("rf");
field.value += text;
field.focus();
}




document.querySelectorAll("input.func").forEach(el=>{
    el.addEventListener("focus",function(){
        activeInput=this;
    });
});



function insertText(text){

if(!activeInput) return;
activeInput.value += text;
activeInput.focus();
}


function niceBounds(min,max){
	let nmin = Math.floor(min/5)*5;
	let nmax = Math.ceil(max/5)*5;
	return [nmin,nmax];
}


function updateRange(){
	let x1 = parseFloat(document.getElementById("xmin").value);
	let x2 = parseFloat(document.getElementById("xmax").value);
	if(!isNaN(x1) && !isNaN(x2)){
	[xmin,xmax] = niceBounds(x1,x2);
	[ymin,ymax] = niceBounds(x1,x2);
	draw();
	}
}

function setColor(color){
    currentColor = color;
}




// ======================================================
// CANVAS FUNCTIONS = to draw canvas, grid, axes labels
// ======================================================
function drawGrid(){
let step = 0.5;
for(let x = Math.floor(xmin/step)*step; x <= xmax; x += step){
	let px = centerX + x*scale;
	ctx.beginPath();
		if(Math.abs(x % 1) < 0.0001){
			ctx.strokeStyle="#a8d6d1";
			ctx.lineWidth=1;
		}else{
			ctx.strokeStyle="#e3f2f1";
			ctx.lineWidth=0.5;
		}
ctx.moveTo(px,padding);
ctx.lineTo(px,height-padding);
ctx.stroke();
}
for(let y = Math.floor(ymin/step)*step; y <= ymax; y += step){
	let py = centerY - y*scale;
	ctx.beginPath();
	if(Math.abs(y % 1) < 0.0001){
		ctx.strokeStyle="#a8d6d1";
		ctx.lineWidth=1;
	}else{
		ctx.strokeStyle="#e3f2f1";
		ctx.lineWidth=0.5;
	}
ctx.moveTo(padding,py);
ctx.lineTo(width-padding,py);
ctx.stroke();
}
}


function drawAxes(){
	ctx.strokeStyle="#2c6e6f";
	ctx.lineWidth=2;
	ctx.beginPath();
	ctx.moveTo(0,centerY);
	ctx.lineTo(width,centerY);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(centerX,0);
	ctx.lineTo(centerX,height);
	ctx.stroke();
}


function drawLabels(){
	ctx.font="italic 12px Cambria Math";
	ctx.fillStyle="#204748";
	ctx.textAlign="center";
	ctx.textBaseline="top";
	for(let x=Math.ceil(xmin);x<=xmax;x++){
		if(x===0) continue;
			let px=centerX + x*scale;
			ctx.fillText(x,px,centerY+6);
	}
	ctx.textAlign="right";
	ctx.textBaseline="middle";
	for(let y=Math.ceil(ymin);y<=ymax;y++){
		if(y===0) continue;
			let py=centerY - y*scale;
			ctx.fillText(y,centerX-6,py);
	}
}


function drawTitle(){
	ctx.font="italic 14px Cambria Math";
	ctx.fillStyle="#5f8f8b";
	ctx.textAlign="left";
	ctx.fillText("Math Playground — Cartesian plane", 585, 820);
	ctx.fillText("Y",403, 15);
	ctx.fillText("X",810, 407);
}









// ========================================================
// DRAW FUNCTIONS = to draw POINT VECTOR LINE FREEHAND Coordinates
// ========================================================

function drawCursorCoords(){
	if(mouseX===null) return;
	let px = centerX + mouseX*scale;
	let py = centerY - mouseY*scale;
	ctx.font = "14px Cambria Math";
	ctx.fillStyle = "#204748";
	ctx.textAlign = "left";
	let text = "(" + mouseX.toFixed(1) + ", " + mouseY.toFixed(1) + ")";
	ctx.fillText(text, px + 10, py - 10);
}


function drawPoint(x,y,color){
	let px = centerX + x*scale;
	let py = centerY - y*scale;
	ctx.beginPath();
	ctx.arc(px,py,5,0,Math.PI*2);
	ctx.fillStyle = color;
	ctx.fill();
}


function drawPoints(){
	for(let p of points){
		drawPoint(p.x,p.y,p.color);
	}
}

function drawVectors(){
	for(let v of vectors){
		if(v.type==="line"){
			let px1 = centerX + v.x1*scale;
			let py1 = centerY - v.y1*scale;
			let px2 = centerX + v.x2*scale;
			let py2 = centerY - v.y2*scale;
			ctx.strokeStyle=v.color;
			ctx.lineWidth=1.5;
			ctx.beginPath();
			ctx.moveTo(px1,py1);
			ctx.lineTo(px2,py2);
			ctx.stroke();
		}else{
			drawVector(v.x1,v.y1,v.x2,v.y2,v.color);
		}
	}
}


function drawVector(x1,y1,x2,y2,color){
let px1 = centerX + x1*scale;
let py1 = centerY - y1*scale;
let px2 = centerX + x2*scale;
let py2 = centerY - y2*scale;
	ctx.strokeStyle=color;
	ctx.lineWidth=2;
	ctx.beginPath();
	ctx.moveTo(px1,py1);
	ctx.lineTo(px2,py2);
	ctx.stroke();
	drawArrow(px1,py1,px2,py2);
}

function drawArrow(x1,y1,x2,y2){
	let headLength = 10;
	let dx = x2 - x1;
	let dy = y2 - y1;
	let angle = Math.atan2(dy,dx);
	ctx.beginPath();
	ctx.moveTo(x2,y2);
	ctx.lineTo(
	x2 - headLength*Math.cos(angle - Math.PI/12),
	y2 - headLength*Math.sin(angle - Math.PI/12)
	);
	ctx.moveTo(x2,y2);
	ctx.lineTo(
	x2 - headLength*Math.cos(angle + Math.PI/12),
	y2 - headLength*Math.sin(angle + Math.PI/12)
	);
	ctx.stroke();
}


function drawLine(x1,y1,x2,y2,color){
let px1 = centerX + x1*scale;
let py1 = centerY - y1*scale;
let px2 = centerX + x2*scale;
let py2 = centerY - y2*scale;
ctx.strokeStyle=color;
ctx.lineWidth=1;
ctx.beginPath();
ctx.moveTo(px1,py1);
ctx.lineTo(px2,py2);
ctx.stroke();
}






// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
// GRAPH FUNCTIONS INPUT & DRAW BLOCK
// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
//***** the core - Function computation*****

function buildTable(func, pmin, pmax){
	const N = 20;
	const dp = (pmax-pmin)/(N-1);
	let table = {
		p:[],
		x:[],
		y:[],
		r:[]
	};
	for(let i=0;i<N;i++){
		let p = pmin + i*dp;
		let x,y,r;
			if(func.type==="cartesian"){
				x = p;
				y = evalExpr(func.expr,{x:p});
			}
			if(func.type==="parametric"){
				x = evalExpr(func.xExpr,{t:p});
				y = evalExpr(func.yExpr,{t:p});
			}
			if(func.type==="polar"){
				r = evalExpr(func.rExpr,{fi:p});
				x = r*Math.cos(p);
				y = r*Math.sin(p);
				table.r.push(r);
			}
		table.p.push(p);
		table.x.push(x);
		table.y.push(y);
	}
	func.table = table;
}



function updateFunctionInputs(){
	let type = document.getElementById("functionType").value;
		document.getElementById("cartesianBlock").style.display="none";
		document.getElementById("parametricBlock").style.display="none";
		document.getElementById("polarBlock").style.display="none";
	if(type==="cartesian")
		document.getElementById("cartesianBlock").style.display="inline";
	if(type==="parametric")
		document.getElementById("parametricBlock").style.display="inline";
	if(type==="polar")
		document.getElementById("polarBlock").style.display="inline";
}



function drawFunctionInput(){
	let type = document.getElementById("functionType").value;
	let color = currentColor;
	if(type==="cartesian"){
		let expr = document.getElementById("fx").value;
		let f = {
			type:"cartesian",
			expr:expr,
			color:color
		};
		buildTable(f,xmin,xmax);
		functions.push(f);
	}
	if(type==="parametric"){
		let xExpr = document.getElementById("xt").value;
		let yExpr = document.getElementById("yt").value;
		let f = {
			type:"parametric",
			xExpr:xExpr,
			yExpr:yExpr,
			color:color
		};
		buildTable(f,-10,10);
		functions.push(f);
	}
	if(type==="polar"){
		let rExpr = document.getElementById("rf").value;
		let f = {
			type:"polar",
			rExpr:rExpr,
			color:color
		};
		buildTable(f,0,2*Math.PI);
		functions.push(f);
		}
draw();
}



function drawParametricFunctions(){
	for(let f of functions){
		if(f.type!=="parametric") continue;
			ctx.strokeStyle = f.color;
			ctx.lineWidth = 2;
			ctx.beginPath();
		let first=true;
		let tmin=-10;
		let tmax=10;
		let step=(tmax-tmin)/600;
			for(let t=tmin; t<=tmax; t+=step){
				let x,y;
				try{
				x=evalExpr(f.xExpr,{t:t});
				y=evalExpr(f.yExpr,{t:t});
				}catch{
				first=true;
				continue;
				}
		if(!isFinite(x)||!isFinite(y)){
			first=true;
			continue;
		}
		let px=centerX+x*scale;
		let py=centerY-y*scale;
		if(first){
			ctx.moveTo(px,py);
			first=false;
		}else{
			ctx.lineTo(px,py);
		}
		}
	ctx.stroke();
	}
}


function drawPolarFunctions(){
	for(let f of functions){
		if(f.type!=="polar") continue;
			ctx.strokeStyle=f.color;
			ctx.lineWidth=2;
			ctx.beginPath();
		let first=true;
		let fimin=0;
		let fimax=2*Math.PI;
		let step=(fimax-fimin)/600;
			for(let fi=fimin; fi<=fimax; fi+=step){
				let r;
				try{
					r=evalExpr(f.rExpr,{fi:fi});
				}catch{
					first=true;
				continue;
				}
				if(!isFinite(r)){
					first=true;
				continue;
				}
				let x=r*Math.cos(fi);
				let y=r*Math.sin(fi);
				let px=centerX+x*scale;
				let py=centerY-y*scale;
				if(first){
					ctx.moveTo(px,py);
					first=false;
				}else{
					ctx.lineTo(px,py);
				}
			}
		ctx.stroke();
	}
}


//************ Draw functions**********************
function drawSmoothFunctions(){
	for(let f of functions){
		if(f.type!=="cartesian") continue;
		ctx.strokeStyle = f.color;
		ctx.lineWidth = 2;
		ctx.beginPath();
		let first = true;
		let prevY = null;
		let step = (xmax - xmin) / 600;
		for(let x = xmin; x <= xmax; x += step){
			let y;
			try{
				y = evalExpr(f.expr,{x:x});
			}catch{
			first = true;
				continue;
			}
				if(!isFinite(y)){
					first = true;
				continue;
				}
			let px = centerX + x*scale;
			let py = centerY - y*scale;
			if(prevY !== null){
				if(Math.abs(y - prevY) > 20){
					first = true;
				}
			}
			if(first){
				ctx.moveTo(px,py);
				first=false;
			}else{
				ctx.lineTo(px,py);
			}
			prevY = y;
		}
	ctx.stroke();
	}
}



function drawFunctions(){
	for(let f of functions){
		ctx.strokeStyle=f.color;
		ctx.lineWidth=2;
		ctx.beginPath();
		let first=true;
			for(let i=0;i<f.table.x.length;i++){
				let px=centerX + f.table.x[i]*scale;
				let py=centerY - f.table.y[i]*scale;
					if(first){
						ctx.moveTo(px,py);
						first=false;
					}
					else{
					ctx.lineTo(px,py);
					}
			}
		ctx.stroke();
	}
}



//************ Draw function points (dots)******************

function drawTablePoints(){
	for(let f of functions){
		if(!f.table) continue;
			for(let i=0;i<f.table.x.length;i++){
				let x = f.table.x[i];
				let y = f.table.y[i];
				let px = centerX + x*scale;
				let py = centerY - y*scale;
				ctx.beginPath();
				ctx.arc(px,py,3,0,Math.PI*2);
				ctx.fillStyle = f.color;
				ctx.fill();
				ctx.strokeStyle = "#666666";
				ctx.lineWidth = 1;
				ctx.stroke();
			}
	}
}




// ======================
// TABLE FUNCTIONS
// ======================
//*****Draw Table ********
function buildHTMLTable(func){
let html="<table class='table'>";
	if(func.type==="cartesian"){
	html+=row("x",func.table.p);
	html+=row("y",func.table.y);
	}
	if(func.type==="parametric"){
	html+=row("t",func.table.p);
	html+=row("x",func.table.x);
	html+=row("y",func.table.y);
	}
	if(func.type==="polar"){
	html+=row("φ",func.table.p);
	html+=row("r",func.table.r);
	html+=row("x",func.table.x);
	html+=row("y",func.table.y);
	}
html+="</table>";
return html;
}


function row(label,data){
let r="<tr><th>"+label+"</th>";
	for(let v of data){
		r+="<td>"+round1(v)+"</td>";
	}
	r+="</tr>";
return r;
}



function buildLegend(){
let html="";
	for(let f of functions){
		html+=`
		<div class="legendItem">
		<span class="legendColor" style="color:${f.color}">■</span>
		<span class="legendText">${describeFunction(f)}</span>
		</div>
		`;
	}
return html;
}


function describeFunction(f){
	if(f.type==="cartesian")
return "f(x) = "+f.expr;
	if(f.type==="parametric")
return "x(t)="+f.xExpr+" , y(t)="+f.yExpr;
	if(f.type==="polar")
return "r(φ)="+f.rExpr;
}


function updateTables(){
let html="";
	for(let f of functions){
		html += "<div class='funcBlock'>";
		html += buildLegendItem(f);   // легенда
		html += buildHTMLTable(f);    // таблица
		html += "</div>";
	}
document.getElementById("functionTables").innerHTML = html;
}


function buildLegendItem(f){
return `
<div class="legendItem">
<span style="display:inline-block;
width:12px;height:12px;
background:${f.color};
margin-right:6px;
"></span>
${describeFunction(f)}
</div>
`;
}







// ======================
// UI FUNCTIONS
// ======================
// *** CLEAR ALL


function clearCanvas1(){
points = [];
vectors = [];
functions = [];
draw();
}


function clearCanvas(){
points = [];
vectors = [];
functions = [];
freehandLines = [];
labels = [];
draw();
}

function clearText(){
    document.getElementById("funcInput").value="";
}

function snap(value){
    return Math.round(value / snapStep) * snapStep;
}

function clearFunctions(){
    document.getElementById("fx").value = "";
    document.getElementById("xt").value = "";
    document.getElementById("yt").value = "";
    document.getElementById("rf").value = "";
}



function deleteLast(){
	if(!activeInput) return;
	let text = activeInput.value;
	activeInput.value = text.slice(0,-1);
	activeInput.focus();
}


// ======================
// EXTRA DRAW LAYERS (Freehand + Text)
// ======================


// ---------- DRAW FREEHAND ----------
function drawFreehand(){
ctx.lineWidth = 2;
for(let line of freehandLines){
ctx.beginPath();
for(let i=0;i<line.length;i++){
let px = centerX + line[i].x*scale;
let py = centerY - line[i].y*scale;
if(i===0){
ctx.moveTo(px,py);
}else{
ctx.lineTo(px,py);
}
}
ctx.stroke();
}
}


// ---------- DRAW TEXT ----------
function drawTextLabels(){
ctx.font="16px Cambria Math";
for(let l of labels){
let px = centerX + l.x*scale;
let py = centerY - l.y*scale;
ctx.fillStyle = l.color;
ctx.fillText(l.text,px,py);
}
}
