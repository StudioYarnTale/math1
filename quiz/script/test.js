let test1 = []
let test2 = []

async function loadTests(){

let r1 = await fetch("../jsonfiles/test1.json")
test1 = await r1.json()

let r2 = await fetch("../jsonfiles/test2.json")
test2 = await r2.json()

buildTest()
}

function buildTest(){

const container = document.getElementById("testContainer")

let html = ""

let q = 1

// первые 4 задания
test1.forEach((t,i)=>{

html += `<div class="question">
<p>${q}. ${t.question}</p>`

t.options.forEach(opt=>{

html += `
<label>
<input type="radio" name="q${i}" value="${opt}">
${opt}
</label><br>
`

})

html += "</div>"
q++

})

// последние задания
test2.forEach((t,i)=>{

html += `
<div class="question">
<p>${q}. ${t.question}</p>
<input type="text" id="num${i}">
</div>
`
q++

})

container.innerHTML = html

}

function checkTest(){

let score = 0

// проверка первых 4
test1.forEach((t,i)=>{

let checked = document.querySelector(`input[name="q${i}"]:checked`)

if(checked && checked.value == t.answer){

score += 1

}

})

// проверка числовых
test2.forEach((t,i)=>{

let val = document.getElementById(`num${i}`).value

val = parseFloat(val)

if(!isNaN(val)){

let user = Number(val.toFixed(2))
let correct = Number(parseFloat(t.answer).toFixed(2))

if(user == correct){

score += 3

}

}

})

document.getElementById("result").innerText =
"Result: " + score + " / 10"

}

loadTests()