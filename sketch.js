/// <reference path="../TSDef/p5.global-mode.d.ts" />
"use strict";
let canvasDivEl,dumpEl,statsEl,nextButtonEl,runButtonEl,tableEl;
let sliderEl,refreshEl,numSliderEl;
let waitVarX = 0,runBool=0, algorithmRunning = 0, globalSTOP = false;
let points = [];
let H=480,W=720;
let N = 30;
let cir;
let rpoints = [];
let dimVC = 3,ProbDeltaNet=0.1;
let weights = Array(N).fill(1);

function refresh(e=null){
  if(algorithmRunning) {
    window.location.reload();
  }
  N = numSliderEl.value;
  waitVarX = runBool = 0;
  points= weights = [];
  for(let i=0;i<N;i++){
    let v = createVector(random((W*0.25),0.75*W),random(H*0.25,H*0.75));
    points.push(v);
  }
  updateDumpEl(N);
  computeShellSet(points,0.1,1);
  redraw();
  drawPoints();
}

function setup() {
  canvasDivEl = document.querySelector("div#canvasDiv");
  dumpEl = document.querySelector("div#dump");
  statsEl = document.querySelector("div#statistics");
  nextButtonEl = document.querySelector("#next");
  runButtonEl = document.querySelector("#run");
  sliderEl = document.querySelector("#runSpeed");
  tableEl = document.querySelector("table");
  refreshEl = document.querySelector("button#refresh");
  numSliderEl = document.querySelector("input#numSlider");
  let temp = localStorage.getItem("N");
  if(temp) numSliderEl.value = temp;
  nextButtonEl.addEventListener("mousedown",(e)=>{waitVarX=1;});
  runButtonEl.addEventListener("mousedown",(e)=>{
    runBool = 1-runBool;
    if(runBool){
      runButtonEl.innerText = "Stop";
    }else{
      runButtonEl.innerText = "Run Continously";
    }
    function runAgain(){
      if(runBool){
        waitVarX = 1;
        setTimeout(runAgain,sliderEl.max-sliderEl.value);
      }
    }
    runAgain();
  });
  refreshEl.addEventListener("mousedown",refresh);
  createCanvas(W,H).parent("canvasDiv");
  
  fill(0,0,0,0);
  // weights[5] = 10;
  // rpoints = weightedRandom(5,weights,points);
  // for(let i=rpoints.length-1;i>=0;i--) rpoints[i] = points[rpoints[i]];
  // console.log("mm",rpoints);
  // algSlow(rpoints,100);
  // ellipse(c.x,c.y,r*2,r*2);
  // ellipse(10,10,10);
  // cir = algSlow(points,100);
  noLoop();
  setTimeout(refresh,10);
  // computeShellSet(points,0.1,1);
}
function draw(){
  background("white");
  rect(0,0,W,H);
}

function drawPoints() {
  
  // background("white");
  // ellipse(50,50,50,50);
  // translate(W/2,H/2);
  push();
  rect(0,0,W,H);
  // ellipse(c.x,c.y,r*2,r*2);
  // cir.draw();
  strokeWeight(1);
  for(let i=0;i<N;i++){
    strokeWeight(Math.min(20,5+5*Math.log2(weights[i])));
    stroke(0,0,0,150);
    point(points[i]);
    // ellipse(points[i].x,points[i].y,weights[i]*2+5);
  }
  stroke("#FF0000")
  // for(let p of rpoints){point(p);}
  pop();
}