"use strict";
class Circle{
  constructor(center,radius){
    this.center = center;
    this.radius = radius;
  }
  draw(){
    ellipse(this.center.x,this.center.y,this.radius*2,this.radius*2);
  }
  copy(){
    return new Circle(this.center.copy(),this.radius);
  }
}
function updateDumpEl(N,epsilon=0.1){
  localStorage.setItem("N", numSliderEl.value);
  dumpEl.innerText = `Number of points=${N}\nε=${epsilon}\n`;
}
async function waitX(){
  while(waitVarX==0){
    await new Promise(r=>setTimeout(r,200));
  }
  waitVarX = 0;
}
function singleWeightedRandom(weights) {
  let totSum = weights.reduce((a, b) => a + b, 0);
  let i,ret=0, sum=0, rsum=Math.random()*totSum;
  // don't iterate using for i in arr it uses i as strings 
  for (i=0;i<=weights.length;i++) {
    sum += weights[i];
    if (sum >= rsum){
      ret = i;
      break;
    }
  }
  return ret;
}

function algSlow(points,F=100){ // uses global variables c,r,W,H
  let c = createVector(0,0);
  let r = 1000;
  for(let w=0;w<=W;w+=W/F){
    for(let h=0;h<=H;h+=H/F){
      let nc = createVector(w,h);
      let nr = getMinRad(nc,points);
      if(nr<r){
        r=nr;
        c=nc;
      }
    }
  }
  console.log("center,radius",c,r);
  return new Circle(c,r);
  // return [c,r];
}
function weightedRandom(num,weights,points){
  let arr=[],indexArr=[];
  for(let i=0;i<num;i++){
    let p = singleWeightedRandom(weights);
    arr.push(points[p]);
    indexArr.push(p);
  }
  return [indexArr,arr];
}
function getMinRad(center,points){
  let r = 0;
  for(let i=points.length-1;i>=0;i--){
    r = Math.max(r,center.dist(points[i]));
  }
  return r;
}
function outsidePoints(circle,points,weights,delta){ // pass (1+e)circle here 
  let arrOut = [],wSumOut=0,wSum=0;
  for(let i=0;i<points.length;i++){
    wSum += weights[i];
    if(circle.center.dist(points[i])>circle.radius){
      arrOut.push(i);
      wSumOut += weights[i];
    }
  }
  let isBad = (wSumOut>delta*wSum);
  return [isBad,wSumOut,arrOut];
}
function insertData(iterNo,isBad,numOut,wSumOut){
  let row = tableEl.insertRow(-1);
  row.insertCell(-1).innerText = iterNo;
  row.insertCell(-1).innerText = isBad ? "No":"Yes" ;
  row.insertCell(-1).innerText = numOut;
  row.insertCell(-1).innerText = wSumOut;
}

async function computeShellSet(points,epsilon,kOpt){
  algorithmRunning += 1;
  let N = points.length;
  weights = Array(N).fill(1);
  let delta = 1/(4*kOpt), probDeltaNet=0.1;
  let rSize = Math.max(4/delta*Math.log2(2/probDeltaNet),8*dimVC/delta*Math.log2(8*dimVC/delta));
  let notFound = true,iterNum=1;
  rSize = Math.floor(Math.min(4+N/50,rSize+1));
  console.log(`rSize=${rSize}`);
  while(notFound){
    await waitX();
    if(globalSTOP) return;
    // await new Promise(r=>setTimeout(r,sliderEl.value()));
    let [rpointsIndex,rpoints] = weightedRandom(rSize,weights,points);
    console.log("rpoints shellset",rpoints);
    let cir = algSlow(rpoints,100);
    console.log("circle",cir);
    let eCir = cir.copy();
    eCir.radius *= (1+epsilon);
    let [isBad,wSumOut,arrOut] = outsidePoints(eCir,points,weights,delta);
    console.log("arrout",arrOut);
    // dumpEl.innerText += `iteration:${iterNum} isBadSample=${isBad},delta=${delta},weight of outside points=${wSumOut}\n`;
    insertData(iterNum,isBad,arrOut.length,wSumOut);
    if(!isBad){
      iterNum+=1;
      for(let i=0;i<arrOut.length;i++) weights[arrOut[i]] *= 2;
      console.log("weights",weights);
    }
    if(wSumOut==0){ // solution found 
      dumpEl.innerText += "\nFOUND!\n";
      tableEl.insertRow(-1).insertCell(-1).innerText = "FOUND !"
      notFound = false;
      // stroke("#00FF00");
      // break;
    }
    background("#ffffff"); 
    drawPoints();
    push();
    stroke("#00F");
    strokeWeight(2);
    cir.draw();
    drawingContext.setLineDash([10, 15]);
    eCir.draw();
    for(let pi of rpointsIndex) {strokeWeight(2+Math.min(20,5+5*Math.log2(weights[pi]))); point(points[pi])};
    // stroke("#FF0000");
    // for(let i=0;i<arrOut.length;i++) point(points[arrOut[i]]);
    pop();
    
  }
  algorithmRunning -= 1;
}