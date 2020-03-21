/*
* Get element Xpath and provide it.
* @author: Feng Han
* @version: 1.0.1
* @using: For web UI autotest element Xpath finding.
* @date: 2019-11-19
*/
var xPathFinder = xPathFinder || (() => {
  class Inspector {
    constructor() {
      this.win = window;
      this.doc = window.document;

      this.draw = this.draw.bind(this);
      this.getData = this.getData.bind(this);
      this.setOptions = this.setOptions.bind(this);

      this.cssNode = 'xpath-css';
      this.contentNode = 'xpath-content';
      this.overlayElement = 'xpath-overlay';
    }

    getData(e) {
      e.stopImmediatePropagation();
      e.preventDefault && e.preventDefault();
      e.stopPropagation && e.stopPropagation();
      if (e.target.id === 'xpath-submit'){
          submitXpath();
      }
      else if (e.target.id === 'xpath-show'){
          let gXpathMsg = show();
          this.options.clipboard && ( this.copyText(gXpathMsg) );
          alert(gXpathMsg);
      }
      else if (e.target.id !== this.contentNode && e.target.id !== "xpath-finder" && e.target.parentNode.id !== "xpath-finder") {
        const XPath = this.getXPath(e.target);
        // this.XPath = XPath;
        let textarea = document.getElementById("xpath");
        // console.log(XPath);
        if (textarea) {
          textarea.value = XPath;
        } else {
          const contentHtml = document.createElement('div');
          const inner = `<form id="xpath-finder">
                           <textarea id="xpath-name" style="width:500px;">value name</textarea>
                           <textarea id="xpath" style="width:500px; height:100px">${XPath}</textarea>
						 <div id="button-box">
                           <button id="xpath-submit">Submit</button>
                           <button id="xpath-show">Show and Copy</button>
						 </div>
                         </form>`;
          contentHtml.innerHTML = inner;
          contentHtml.id = this.contentNode;
          document.body.appendChild(contentHtml);
        }
      }
    }

    getOptions() {
      const storage = chrome.storage && (chrome.storage.local);
      const promise = storage.get({
        inspector: true,
        clipboard: true,
        tablecheck: false,
        followinglocation: true,
        precedinglocation: false,
        position: 'bl'
      }, this.setOptions);
      (promise && promise.then) && (promise.then(this.setOptions()));
    }

    setOptions(options) {
      this.options = options;
      let position = 'bottom:0;left:0';
      switch (options.position) {
        case 'tl': position = 'top:0;left:0'; break;
        case 'tr': position = 'top:0;right:0'; break;
        case 'br': position = 'bottom:0;right:0'; break;
        default: break;
      }
      this.styles = 
	  `*{cursor:crosshair!important;}	 
	   #xpath-content{
	   ${position};
       padding:10px;background:gray;
       color:white;
       position:fixed;
       font-size:14px;
       z-index:10000001;}
	   #xpath-name, #xpath, #button-box {
       display: flex;
       flex-direction: column;
       }`;

      this.activate();
    }

    createOverlayElements() {
      const overlayStyles = {
        background: 'rgba(120, 170, 210, 0.7)',
        padding: 'rgba(77, 200, 0, 0.3)',
        margin: 'rgba(255, 155, 0, 0.3)',
        border: 'rgba(255, 200, 50, 0.3)'
      };

      this.container = this.doc.createElement('div');
      this.node = this.doc.createElement('div');
      this.border = this.doc.createElement('div');
      this.padding = this.doc.createElement('div');
      this.content = this.doc.createElement('div');

      this.border.style.borderColor = overlayStyles.border;
      this.padding.style.borderColor = overlayStyles.padding;
      this.content.style.backgroundColor = overlayStyles.background;

      Object.assign(this.node.style, {
        borderColor: overlayStyles.margin,
        pointerEvents: 'none',
        position: 'fixed'
      });

      this.container.id = this.overlayElement;
      this.container.style.zIndex = 10000000;
      this.node.style.zIndex = 10000000;

      this.container.appendChild(this.node);
      this.node.appendChild(this.border);
      this.border.appendChild(this.padding);
      this.padding.appendChild(this.content);
    }

    removeOverlay() {
      const overlayHtml = document.getElementById(this.overlayElement);
      overlayHtml && overlayHtml.remove();
    }

    copyText(XPath) {
      const hdInp = document.createElement('textarea');
      hdInp.textContent = XPath;
      document.body.appendChild(hdInp);
      hdInp.select();
      document.execCommand('copy');
      hdInp.remove();
    }

    draw(e) {
      const node = e.target;
      if (node.id !== this.contentNode) {
        this.removeOverlay();

        const box = this.getNestedBoundingClientRect(node, this.win);
        const dimensions = this.getElementDimensions(node);

        this.boxWrap(dimensions, 'margin', this.node);
        this.boxWrap(dimensions, 'border', this.border);
        this.boxWrap(dimensions, 'padding', this.padding);

        Object.assign(this.content.style, {
          height: box.height - dimensions.borderTop - dimensions.borderBottom - dimensions.paddingTop - dimensions.paddingBottom + 'px',
          width: box.width - dimensions.borderLeft - dimensions.borderRight - dimensions.paddingLeft - dimensions.paddingRight + 'px',
        });

        Object.assign(this.node.style, {
          top: box.top - dimensions.marginTop + 'px',
          left: box.left - dimensions.marginLeft + 'px',
        });

        this.doc.body.appendChild(this.container);
      }
    }

    activate() {
      this.createOverlayElements();
      // add styles
      if (!document.getElementById(this.cssNode)) {
        const styles1 = document.createElement('style');
        styles1.innerText = this.styles;
        styles1.id = this.cssNode;
        document.getElementsByTagName('head')[0].appendChild(styles1);
      }
      // add listeners
      document.addEventListener('click', this.getData, true);
      this.options.inspector && ( document.addEventListener('mouseover', this.draw) );
    }

    deactivate() {
      // remove styles
      const cssNode = document.getElementById(this.cssNode);
      cssNode && cssNode.remove();
      // remove overlay
      this.removeOverlay();
      // remove xpath html
      const contentNode = document.getElementById(this.contentNode);
      contentNode && contentNode.remove();
      // remove listeners
      document.removeEventListener('click', this.getData, true);
      this.options && this.options.inspector && ( document.removeEventListener('mouseover', this.draw) );
    }
   
    judgeHasChild(domElement){
      if(domElement.hasChildNodes()){
        let childNodes = domElement.children;
        for(let i=0; i<childNodes.length; i++){
          if (childNodes[i].nodeType === Node.ELEMENT_NODE){
            return true;
          }
        }
        return false;
      }else{
        return false;
      }
    }

    siblingNodeDescription(domElement){
      let siblingDescription = '';
      let skipList = new Array('script', 'body', 'head', 'html', 'td', 'tr');

      if(this.options.followinglocation){
        let preSibling = domElement.previousSibling;
        while(preSibling){
          if (preSibling.nodeType === Node.ELEMENT_NODE) {
            break;
          }else{
            preSibling = preSibling.previousSibling;
          }
        }
        if (preSibling && preSibling.nodeType === Node.ELEMENT_NODE && skipList.indexOf(preSibling.localName) === -1 && preSibling.innerText && this.analyzeString(preSibling.innerText.trim()) === false){
          siblingDescription = preSibling.localName + '[contains(string(),"'+ preSibling.innerText.trim() +'")]/following-sibling::';
          // console.log(siblingDescription);
          return siblingDescription;
        }
      }

      if(this.options.precedinglocation){
        let nexSibling = domElement.nextSibling;
        while(nexSibling){
          if (nexSibling.nodeType === Node.ELEMENT_NODE) {
            break;
          }
          else{
            nexSibling = nexSibling.nextSibling;
          }
        }
        if (nexSibling && nexSibling.nodeType === Node.ELEMENT_NODE && skipList.indexOf(nexSibling.localName) === -1 && nexSibling.innerText && this.analyzeString(nexSibling.innerText.trim()) === false){
          siblingDescription = nexSibling.localName + '[contains(string(),"'+ nexSibling.innerText.trim() +'")]/preceding-sibling::';
          // console.log(siblingDescription);
          return siblingDescription;
        }
      }
      return siblingDescription;
    }

    tableNodeDescription(domElement){
      let tdDescription = '';
      let preSibling = domElement.previousSibling;
      while(preSibling){
        if (preSibling.localName === 'td' && preSibling.innerText && this.analyzeString(preSibling.innerText.trim()) === false) {
          tdDescription += preSibling.localName + '[contains(string(),"' + preSibling.innerText.trim() +'")]/parent::tr/';
          preSibling = preSibling.previousSibling;
        }else{
          break;
        }
      }
      let nexSibling = domElement.nextSibling;
      while(nexSibling){
        if (nexSibling.localName === 'td' && nexSibling.innerText && this.analyzeString(nexSibling.innerText.trim()) === false) {
          tdDescription += nexSibling.localName + '[contains(string(),"' + nexSibling.innerText.trim() +'")]/parent::tr/';
          nexSibling = nexSibling.nextSibling;
        }else{
          break;
        }
      }
      tdDescription += domElement.localName
      return tdDescription;
    }

    getNodeDescription(domElement){
      let nodeString = domElement.localName;
      let nodeDescription = '';
      let attribute = '';
      let nodeList = new Array("div", "table", "form", "span", "label", "li", "font", "input", "ul", "h2");
      let nodeAttributeList = new Array('aria-hidden', 'aria-label', 'placeholder', 'x-placement', 'aria-labelledby','role', 'class');
      let siblingDescription = '';

      if((this.options.precedinglocation || this.options.followinglocation) && this.siblingNodeDescription(domElement) !== ''){
        siblingDescription = this.siblingNodeDescription(domElement);
        let prefix = domElement.prefix ? domElement.prefix + ':' : '';
        nodeDescription = prefix + nodeString;
      }

      if (nodeList.indexOf(nodeString) !== -1){
        if (this.judgeHasChild(domElement) === false && domElement.innerText){
          let text = domElement.innerText.trim();
          if (text){
            nodeDescription = nodeString + '[contains(text(),"'+ text +'")]';
          }
        }else{
          for(let index in nodeAttributeList){
            if(domElement.hasAttribute(nodeAttributeList[index])){
              if(nodeAttributeList[index] === 'x-placement'){
                nodeDescription = nodeString + '[@x-placement]';
                break;
              }else{
                attribute = domElement.getAttribute(nodeAttributeList[index]);
                nodeDescription = nodeString + '[@' + nodeAttributeList[index] + '="' + attribute + '"]';
                break;
              }
            }
          }
        }

      }else if(this.options.tablecheck && nodeString === 'td'){
        nodeDescription = this.tableNodeDescription(domElement)
      }else{
        let nbOfPreviousSiblings = 0;
        let hasNextSiblings = false;
        let sibling = domElement.previousSibling;
        while (sibling) {
          if (sibling.nodeType !== Node.DOCUMENT_TYPE_NODE && sibling.nodeName === domElement.nodeName) {
            nbOfPreviousSiblings++;
          }
          sibling = sibling.previousSibling;
        }
        sibling = domElement.nextSibling;
        while (sibling) {
          if (sibling.nodeName === domElement.nodeName) {
            hasNextSiblings = true;
            break;
          }
          sibling = sibling.nextSibling;
        }
        const prefix = domElement.prefix ? domElement.prefix + ':' : '';
        const nth = nbOfPreviousSiblings || hasNextSiblings ? `[${nbOfPreviousSiblings + 1}]` : '';
        nodeDescription = prefix + nodeString + nth;
      }
      let finalDescription = siblingDescription + nodeDescription;
      return finalDescription;
    }

    uniqueParts(parts){
      let newParts = new Array();
      let currentNode = '';
      // let compileNode = /([a-z]*)[{0,1}.*]{0,1}/;
      let compileNode = /(?=.*\/following-sibling::)?(?=.*\/preceding-sibling::)?([a-z]*)[?.*]?/;
      let compileSibling = /.*(following-sibling::|preceding-sibling::|placeholder|aria-label|aria-hidden|x-placement|role).*/

      for (let i=0; i<parts.length; i++){
        if(compileSibling.exec(parts[i])){
          newParts.push(parts[i]);
          continue;
        }else{
          let currentPartsNode = compileNode.exec(parts[i])[0];
          let currentNewPartsNode = compileNode.exec(newParts[newParts.length-1])[0];
          if (currentPartsNode === currentNewPartsNode){
            continue;
          }
          else{
            newParts.push(parts[i]);
          }
        }
      }
      return newParts;
    }

    analyzeString(text){
      let newString = '';
      let splitString = /\n|\s/;
      if(splitString.test(text)) return true;
      else return false;
    }

    stripSpace(el){
      if (el !== ''){
        return el
      }
    }

    getXPath(el) {
      let nodeElem = el;
      let parts = [];
      while (nodeElem && nodeElem.nodeType === Node.ELEMENT_NODE) {
        const prefix = nodeElem.prefix ? nodeElem.prefix + ':' : '';
        parts.push(prefix + this.getNodeDescription(nodeElem));
        nodeElem = nodeElem.parentNode;
      }
      parts = this.uniqueParts(parts);
      parts = parts.filter(this.stripSpace)
      let text = '';
      for(let index in parts){
        text = text + parts[index] + ' ';
      }
      // return text;
      return parts.length ? '/' + parts.reverse().join('//') : '';
    }

    getElementDimensions(domElement) {
      const calculatedStyle = window.getComputedStyle(domElement);
      return {
        borderLeft: +calculatedStyle.borderLeftWidth.match(/[0-9]*/)[0],
        borderRight: +calculatedStyle.borderRightWidth.match(/[0-9]*/)[0],
        borderTop: +calculatedStyle.borderTopWidth.match(/[0-9]*/)[0],
        borderBottom: +calculatedStyle.borderBottomWidth.match(/[0-9]*/)[0],
        marginLeft: +calculatedStyle.marginLeft.match(/[0-9]*/)[0],
        marginRight: +calculatedStyle.marginRight.match(/[0-9]*/)[0],
        marginTop: +calculatedStyle.marginTop.match(/[0-9]*/)[0],
        marginBottom: +calculatedStyle.marginBottom.match(/[0-9]*/)[0],
        paddingLeft: +calculatedStyle.paddingLeft.match(/[0-9]*/)[0],
        paddingRight: +calculatedStyle.paddingRight.match(/[0-9]*/)[0],
        paddingTop: +calculatedStyle.paddingTop.match(/[0-9]*/)[0],
        paddingBottom: +calculatedStyle.paddingBottom.match(/[0-9]*/)[0]
      };
    }

    getOwnerWindow(node) {
      if (!node.ownerDocument) { return null; }
      return node.ownerDocument.defaultView;
    }

    getOwnerIframe(node) {
      const nodeWindow = this.getOwnerWindow(node);
      if (nodeWindow) {
        return nodeWindow.frameElement;
      }
      return null;
    }

    getBoundingClientRectWithBorderOffset(node) {
      const dimensions = this.getElementDimensions(node);
      return this.mergeRectOffsets([
        node.getBoundingClientRect(),
        {
          top: dimensions.borderTop,
          left: dimensions.borderLeft,
          bottom: dimensions.borderBottom,
          right: dimensions.borderRight,
          width: 0,
          height: 0
        }
      ]);
    }

    mergeRectOffsets(rects) {
      return rects.reduce((previousRect, rect) => {
        if (previousRect === null) { return rect; }
        return {
          top: previousRect.top + rect.top,
          left: previousRect.left + rect.left,
          width: previousRect.width,
          height: previousRect.height,
          bottom: previousRect.bottom + rect.bottom,
          right: previousRect.right + rect.right
        };
      });
    }

    getNestedBoundingClientRect(node, boundaryWindow) {
      const ownerIframe = this.getOwnerIframe(node);
      if (ownerIframe && ownerIframe !== boundaryWindow) {
        const rects = [node.getBoundingClientRect()];
        let currentIframe = ownerIframe;
        let onlyOneMore = false;
        while (currentIframe) {
          const rect = this.getBoundingClientRectWithBorderOffset(currentIframe);
          rects.push(rect);
          currentIframe = this.getOwnerIframe(currentIframe);
          if (onlyOneMore) { break; }
          if (currentIframe && this.getOwnerWindow(currentIframe) === boundaryWindow) {
            onlyOneMore = true;
          }
        }
        return this.mergeRectOffsets(rects);
      }
      return node.getBoundingClientRect();
    }

    boxWrap(dimensions, parameter, node) {
      Object.assign(node.style, {
        borderTopWidth: dimensions[parameter + 'Top'] + 'px',
        borderLeftWidth: dimensions[parameter + 'Left'] + 'px',
        borderRightWidth: dimensions[parameter + 'Right'] + 'px',
        borderBottomWidth: dimensions[parameter + 'Bottom'] + 'px',
        borderStyle: 'solid'
      });
    }
  }

  const inspect = new Inspector();

  chrome.runtime.onMessage.addListener(request => {
    if (request.action === 'activate') {
      return inspect.getOptions();
    }
    return inspect.deactivate();
  });

  return true;
})();
