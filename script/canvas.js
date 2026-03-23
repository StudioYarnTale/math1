const canvas = document.getElementById("grid");
const ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;

let xmin = -10;
let xmax = 10;
let ymin = -10;
let ymax = 10;
let mode = "point";
let mouseX = null;
let mouseY = null;
let points = [];
let vectors = [];
let currentColor = "#ff3366";
let functions = [];

const minorPx = 40;
const majorPx = 20;
const padding = 40;
const snapStep = 0.5;

let centerX;
let centerY;
let scale;
let vectorStart = null;

draw();


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

function draw(){
	ctx.clearRect(0,0,width,height);
scale = (width - 2*padding) / (xmax - xmin);
centerX = padding - xmin*scale;
centerY = padding + ymax*scale;
	drawGrid();
	drawAxes();
	drawLabels();
	drawTitle();
	drawFunctions();
	drawPoints();
	drawVectors();
	drawCursorCoords();
	
}

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
	ctx.font="12px Cambria Math";
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
	ctx.font="italic 16px Cambria Math";
	ctx.fillStyle="#5f8f8b";
	ctx.textAlign="left";
	ctx.fillText(
	"Mathematical playground — Cartesian plane",
	480,
	820
	);
}


canvas.addEventListener("click",function(e){
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
});


canvas.addEventListener("mousemove", function(e){
	let rect = canvas.getBoundingClientRect();
	let x = e.clientX - rect.left;
	let y = e.clientY - rect.top;
	let mx = (x - centerX) / scale;
	let my = (centerY - y) / scale;
	document.getElementById("coords").innerText =
	"x = " + mx.toFixed(2) + "   y = " + my.toFixed(2);
});


canvas.addEventListener("mousemove", function(e){
	let rect = canvas.getBoundingClientRect();
	let x = e.clientX - rect.left;
	let y = e.clientY - rect.top;
	mouseX = (x - centerX) / scale;
	mouseY = (centerY - y) / scale;
	draw();
});


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
function drawVectors(){
for(let v of vectors){
    drawVector(v.x1,v.y1,v.x2,v.y2,v.color);
}
}


function drawArrow(x1,y1,x2,y2){
	let headLength = 10;
	let dx = x2 - x1;
	let dy = y2 - y1;
	let angle = Math.atan2(dy,dx);
	ctx.beginPath();
	ctx.moveTo(x2,y2);
	ctx.lineTo(
	x2 - headLength*Math.cos(angle - Math.PI/6),
	y2 - headLength*Math.sin(angle - Math.PI/6)
	);
	ctx.moveTo(x2,y2);
	ctx.lineTo(
	x2 - headLength*Math.cos(angle + Math.PI/6),
	y2 - headLength*Math.sin(angle + Math.PI/6)
	);
	ctx.stroke();
}




function drawFunction(){
ctx.strokeStyle = currentColor;
ctx.lineWidth = 2;
ctx.beginPath();
let first = true;
	for(let x = xmin; x <= xmax; x += 0.02){
		let y = f(x);
		let px = centerX + x*scale;
		let py = centerY - y*scale;
		if(first){
			ctx.moveTo(px,py);
			first = false;
		}else{
			ctx.lineTo(px,py);
		}
	}
ctx.stroke();
}

function transformExpr(expr){
return expr
	.replace(/\bsin\b/g,"Math.sin")
	.replace(/\bcos\b/g,"Math.cos")
	.replace(/\btan\b/g,"Math.tan")
	.replace(/\bexp\b/g,"Math.exp")
	.replace(/\blog\b/g,"Math.log")
	.replace(/\bsqrt\b/g,"Math.sqrt")
	.replace(/\babs\b/g,"Math.abs")
	.replace(/\^/g,"**");
}

function mathEval(expr,x){
	expr = transformExpr(expr);
	return Function("x","return "+expr)(x);
}

function drawFunctionInput(){
	let expr = document.getElementById("funcInput").value;
		if(!expr) return;
		functions.push({
		expr:expr,
		color:currentColor
		});
	draw();
}

function drawFunctions(){
	for(let f of functions){
		ctx.strokeStyle = f.color;
		ctx.lineWidth = 2;
		ctx.beginPath();
let first=true;
	for(let x=xmin; x<=xmax; x+=0.02){
let y;
try{
	y = mathEval(f.expr,x);
	}catch{
	first=true;
continue;
}
let px = centerX + x*scale;
let py = centerY - y*scale;
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




//function f(x){    return Math.sin(x);}


function clearCanvas(){
points = [];
vectors = [];
functions = [];
draw();
}

function clearFunctions(){
    document.getElementById("funcInput").value="";
}

function snap(value){
    return Math.round(value / snapStep) * snapStep;
}