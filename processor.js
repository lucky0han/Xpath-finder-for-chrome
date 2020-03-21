/*
* Get element Xpath and provide it.
* @author: Feng Han
* @version: 1.0.1
* @using: For web UI autotest element Xpath finding.
* @date: 2019-11-19
*/
var xpathNameList = new Array();
var xpathValList = new Array();

function submitXpath() {
  let xpathName = document.getElementById("xpath-name").value.trim();
  let xpathVal = document.getElementById("xpath").value.trim();
  if(xpathName === ''){
    alert("Xpath name not provided");
    return true;
  }
  document.getElementById("xpath-name").value = '';
  if(xpathVal === ''){
    alert("Xpath value not provided");
    return true;
  }
  document.getElementById("xpath").value = '';

  xpathNameList.push(xpathName);
  xpathValList.push(xpathVal);
  if (xpathNameList.length !== xpathValList.length){
    alert("Xpath values length is different from names lenth, please click 'check' to modify");
    return true;
  }
  return true;
}

function show() {
  if(xpathNameList.length === 0){
    alert("Not provided Xpath yet");
    return true;
  }else{
	var xpathMsg = '';
    for(let i=0, len=xpathNameList.length;i<len;i++){
      xpathMsg = xpathMsg + xpathNameList.pop() + " = " + xpathValList.pop() + "\n";
    }
    // console.log(xpathMsg);
    return xpathMsg;
  }
}

// document.getElementById("xpath-submit").bind('click',submitXpath())();
// document.getElementById("xpath-show").bind('click',show())();
// document.getElementById("xpath-submit").addEventListener('click', submitXpath);

