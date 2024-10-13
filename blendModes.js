
var blendMode=0
var blendCode=""
const SRC=[1,0.3804,0,0.51]
const DST=[0,0,1,0.77]
const srcPreviewCtx=document.getElementById('sourceCanvas').getContext('2d')
const dstPreviewCtx=document.getElementById('dstCanvas').getContext('2d')
const list=document.getElementsByTagName('li')
for(let link of list){link.onclick=()=>{blendMode=parseInt(link.getAttribute('blendMode'))
refresh()}}
const label=document.getElementById('label')
const outColorLabel=document.getElementById('outColorLabel')
const blendCodeInput=document.getElementById('blendCodeInput')
blendCodeInput.value=blendCode
blendCodeInput.onchange=()=>{blendCode=blendCodeInput.value
refresh()}
const srcColorInputs=document.getElementsByClassName('srcColorInput')
for(let inp of srcColorInputs){let idx=parseInt(inp.getAttribute('colorIndex'))
inp.oninput=()=>{SRC[idx]=parseFloat(inp.value)
refresh()
refreshColorPreviewCanvas(srcPreviewCtx,SRC)}
inp.setAttribute('value',SRC[idx])
refreshColorPreviewCanvas(srcPreviewCtx,SRC)}
const dstColorInputs=document.getElementsByClassName('dstColorInput')
for(let inp of dstColorInputs){let idx=parseInt(inp.getAttribute('colorIndex'))
inp.oninput=()=>{DST[idx]=parseFloat(inp.value)
refresh()
refreshColorPreviewCanvas(dstPreviewCtx,DST)}
inp.setAttribute('value',DST[idx])
refreshColorPreviewCanvas(dstPreviewCtx,DST)}
function refreshColorPreviewCanvas(ctx,color){ctx.fillStyle=`rgba(${color[0] * 255}, ${color[1] * 255}, ${color[2] * 255}, ${color[3]})`
ctx.clearRect(0,0,100,100)
ctx.fillRect(0,0,100,100)}
function colorToString(col){return`( ${col[0]}, ${col[1]}, ${col[2]}, ${col[3]} )`}
function colorToPremulStringUI8(col){let a=col[3]
return`( ${Math.round(col[0] * a * 255)}, ${Math.round(col[1] * a * 255)}, ${Math.round(col[2] * a * 255)} )`}
function blendModeName(blendMode){switch(blendMode){case 0:return"Normal"
case 1:return"Erase"
case 2:return"Darken"
case 3:return"Multiply"
case 4:return"Color Burn"
case 5:return"Linear Burn"
case 6:return"Darken Color"
case 7:return"Lighten"
case 8:return"Screen"
case 9:return"Color Dodge"
case 10:return"Add"
case 11:return"Lighten Color"
case 12:return"Overlay"
case 13:return"Soft Light"
case 14:return"Hard Light"
case 15:return"Vivid Light"
case 16:return"Linear Light"
case 17:return"Pin Light"
case 18:return"Hard Mix"
case 19:return"Difference"
case 20:return"Exclusion"
case 21:return"Subtract"
case 22:return"Divide"
case 23:return"Hue"
case 24:return"Saturation"
case 25:return"Color"
case 26:return"Luminosity"}}
const canvas=document.getElementById('canvas')
const gl=canvas.getContext("webgl")
canvas.width=1000
canvas.height=1000
function blendNormal(src,dst){return src}
function blendErase(src,dst){return dst}
function blendDarken(src,dst){return Math.min(src,dst)}
function blendMultiply(src,dst){return src*dst}
function blendColorBurn(src,dst){let color=1-(1-dst)/src
return dst==1?1:(src==0?0:color)}
function blendLinearBurn(src,dst){return Math.max(src+dst-1,0)}
function blendLighten(src,dst){return Math.max(src,dst)}
function blendScreen(src,dst){return src+dst-src*dst}
function blendColorDodge(src,dst){const color=dst/(1-src)
return dst==0?0:(src==1?1:color)}
function blendAdd(src,dst){return Math.min(1,src+dst)}
function blendOverlay(src,dst){if(dst<=0.5){return Math.min(1,2*src*dst)}else{return Math.max(0,1-2*(1-src)*(1-dst))}}
function blendSoftLight(src,dst){if(src<=0.5){return(2*src-1)*(dst-Math.pow(dst,2))+dst}else{return(2*src-1)*(Math.pow(dst,2)-dst)+dst}}
function blendHardLight(src,dst){return blendOverlay(dst,src)}
function blendVividLight(src,dst){if(src<=0.5){const color=1.0-(1.0-dst)/(2.0*src);return src==0.0?0.0:(dst==1.0?1.0:color);}else{const color=dst/(2.0*(1.0-src));return src==1.0?1.0:(dst==0.0?0.0:color);}}
function blendLinearLight(src,dst){return Math.min(1,dst+2*src-1)}
function blendPinLight(src,dst){if(src<=0.5){const color=1.0-(1.0-dst)/(2.0*src);return src==0.0?0.0:(dst==1.0?1.0:color);}else{const color=dst/(2.0*(1.0-src));return src==1.0?1.0:(dst==0.0?0.0:color);}}
function blendHardMix(src,dst){if(src<1.0-dst){return 0.0;}else if(src>1.0-dst){return 1.0;}else return dst;}
function blendDifference(src,dst){return Math.abs(src-dst)}
function blendExclusion(src,dst){return Math.min(1,src+dst-2*src*dst)}
function blendSubtract(src,dst){return Math.max(0,dst-src)}
function blendDivide(src,dst){return dst==0.0?0.0:(src==0.0?1.0:dst/src);}
function blendFuncForBlendMode(blendMode){switch(blendModeName(blendMode)){case"Normal":return blendNormal
case"Erase":return blendErase
case"Darken":return blendDarken
case"Multiply":return blendMultiply
case"Color Burn":return blendColorBurn
case"Linear Burn":return blendLinearBurn
case"Darken Color":console.error("Not supported")
case"Lighten":return blendLighten
case"Screen":return blendScreen
case"Color Dodge":return blendColorDodge
case"Add":return blendAdd
case"Lighten Color":console.error("Not supported")
case"Overlay":return blendOverlay
case"Soft Light":return blendSoftLight
case"Hard Light":return blendHardLight
case"Vivid Light":console.error("Not supported")
case"Linear Light":return blendLinearLight
case"Pin Light":return blendPinLight
case"Hard Mix":return blendHardMix
case"Difference":return blendDifference
case"Exclusion":return blendExclusion
case"Subtract":return blendSubtract
case"Divide":return blendDivide}}
function blendChannel(src,srcA,dst,dstA){const resA=blendAlpha(srcA,dstA)
const blended=blendFuncForBlendMode(blendMode)(src,dst)
if(blendCode===""){return(1.0-(srcA/resA))*dst+(srcA/resA)*((1.0-dstA)*src+dstA*blended)
return(src*srcA+dst*dstA*(1-srcA))/(srcA+dstA*(1-srcA))
return srcA*blended+dstA*(1-srcA)*dst
return srcA*src+dstA*(1-srcA)*dst}else{return(eval(blendCode))}}
function blendAlpha(srcA,dstA){return srcA+dstA-(srcA*dstA)}
function premultiply(col){let a=col[3]
return[col[0]*a,col[1]*a,col[2]*a,a]}
function unpremultiply(col){let a=1/col[3]
return[Math.min(col[0]*a,1),Math.min(col[1]*a,1),Math.min(col[2]*a,1),col[3]]}
function blend(src,dst){let srcA=src[3]
let dstA=dst[3]
var out=[0,0,0,blendAlpha(srcA,dstA)]
for(let i=0;i<3;i++){out[i]=blendChannel(src[i],srcA,dst[i],dstA)}
return out
return unpremultiply(out)}
function refresh(){let realOut=blend(SRC,DST)
let out=premultiply(realOut)
outColorLabel.innerText=`${colorToString(SRC)} & ${colorToString(DST)} = ${colorToString(realOut)}     premultiplied rgb:   ${colorToPremulStringUI8(realOut)}`
gl.clearColor(out[0],out[1],out[2],out[3])
gl.clear(gl.COLOR_BUFFER_BIT)
label.innerText=blendModeName(blendMode)}
gl.disable(gl.BLEND)
refresh()