/* v1.0.5 by Konstantin Fuchs
*  v2.0.6 by Wiebke Albers
*/

var globalDeleteActive = false;
var colorSelected = "orange";
var colorStandard = "black";
var colorConnectionPoints = "#38393d";
var viewZoom = 0;
var realZoom = 1000;
var inputCount = 0;
var outputCount = 0;
var modulID = 0;
var statusNavigationBar = true;
var widthNavBar = document.getElementById("navigationBar").clientHeight;
var width = 100;
var height = 90;


//#region prototype additional functions

/* W.A. 
 * hide dropdown menus when loading the web page
 */
document.getElementById("myDropdownLogic").style.display = "none";


/* W.A.
* rightclick in simulation area: show most important buttons of navigation bar as dropdown list 
*/
const logicBox = document.getElementById("simulationBox");
logicBox.addEventListener('contextmenu', function (event) {
    event.preventDefault(); 
    var top = event.clientY - logicBox.clientHeight - widthNavBar - 30;
    var left = event.clientX - 10;
    dropdownMenu(3, top, left);
});

/** K.F.
 * moves an svg element to the lowest z-level 
 */
d3.selection.prototype.moveToBack = function () {
    return this.each(function () {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};
 
/** K.F.
 * swaps the two elements in the array
 * 
 * @param {number} x the index of one of the elements to be exchanged
 * @param {number} y the index of the other of the elements to be exchanged 
 */
Array.prototype.swap = function (x, y) {
    var b = this[x];
    this[x] = this[y];
    this[y] = b;
    return this;
};

/** W.A.
 * Closes the dropdown menu if the user clicks outside of it  
 */
window.onclick = function(event) {  
    if (!event.target.matches('.dropdownButton') && !event.target.matches('.dropdown-content a')){  
        var clickLogic = document.getElementById("myDropdownLogic");   
        var clickSave = document.getElementById("myDropdownSave");   
        var clickMenu = document.getElementById("myDropdownMenu");   
        clickLogic.style.display ="none";
        clickMenu.style.display ="none";
    }
}

//#endregion

//#region functions

/** W.A.
 * Shows developer information
 */
function about(){
    alert("v1.0.5 by Konstantin Fuchs \nv2.0.6 by Wiebke Albers \nUnder the supervision of Prof. Dr. Rüdiger Heintz");
}

/** K.F./W.A.
 * adds an SVG element to the DOM and reads the equation that may have been added to the URL
 */
function onLoad(){
    try {
        setWinParam();
        var initVal = (decodeURI(window.location.hash.slice(1)));
        d3.select(".frame").append("svg").attr("id", "svg").attr("viewBox", "0 0 " + realZoom + " 100").attr("preserveAspectRatio", "xMinYMin meet");
    }
    catch { }
    if (typeof initVal != "undefined" || initVal != "") {
        firstCharacter = initVal.slice(0,1);
        if(firstCharacter == "[" || firstCharacter == "{"){
            deserializeLogic();
        } 
        else{
            if (initVal) {
                draw(initVal);
            }
        }
    }
    else term = "";
}

///////// Begin implementation of URL window-informtion
/** W.A.
 * Set parameters of window-size, view, appearance
 */
function setWinParam(){
    var urlParam = new URLSearchParams(document.location.search);
    width = JSON.parse(urlParam.get('width'));
    height = JSON.parse(urlParam.get('height'));
    viewZoom = JSON.parse(urlParam.get('viewZoom'));
    statusNavigationBar = JSON.parse(urlParam.get('statusNavigationBar'));

    if(width != null && height != null){
        document.getElementById("navigationBar").style.width = width + 'px';
        document.getElementById("simulationBox").style.width = width + 'px';
        document.getElementById("simulationBox").style.height = height + 'vh';
    }
    if(statusNavigationBar == false && height == null){
        height = 85;
    }

    calcZoom();
    toggleNavigationBar();
}

/** W.A.
 * calculates Zoom out of window size
 */
function calcZoom(){
    var absoluteWidth = document.body.offsetWidth;
    var zoomRatio = absoluteWidth / 1000;
    
    realZoom = (realZoom - viewZoom) *zoomRatio;
}

/** W.A.
 * hide/show dropdown menu depending on which dropdown menu has been activated
 */
function dropdownMenu(number, x, y){
    if(number == 1){
        var click = document.getElementById("myDropdownLogic");
    }
    else if(number == 2){
        var click = document.getElementById("myDropdownSave");
    }
    else if(number == 3){
        var click = document.getElementById("myDropdownMenu");
        click.style.top = x + "px";
        click.style.left = y + "px";
    }
    
    if(click.style.display ==="none") {  
        click.style.display ="block";  
    } 
    else {  
        click.style.display ="none";  
    } 
}

/** W.A.
* Show/hide of the navigation bar
*/
function toggleNavigationBar(toggle){
    if(toggle == true){
        statusNavigationBar = !statusNavigationBar;
    }
    
    if(statusNavigationBar == false){
        height = height + 8;
        document.getElementById("navigationBar").style.display = 'none';
    }
    else if(statusNavigationBar == true){
        if(toggle == true){height = height - 8;}
        document.getElementById("navigationBar").style.display = '';
    }
}
///////// End implementation of URL window-informtion

/** K.F.
 * lets the element light up in the highlight color
 * @param {Object} element the d3 selection of the element to be highlighted
 */
function showError(element) {
    element.transition().duration(500).style("background-color", colorSelected);
    element.transition().duration(500).delay(500).style("background-color", "white");
}

/** K.F.
 * toggles the state of the global variable globalDeleteActivate
 */
function toggleDelete() {
    if (globalDeleteActive) {
        globalDeleteActive = false;
    }
    else {
        globalDeleteActive = true;
    }
}

/** K.F.
 * reduces the view of the svg canvas
 */
function zoomIn() {
    viewZoom += 50;
    realZoom -= 50;
    d3.select("#svg").attr("viewBox", "0 0 " + realZoom + " 100");
}

/** K.F.
 * enlarges the view of the svg canvas
 */
function zoomOut() {
    viewZoom -= 50;
    realZoom += 50;
    d3.select("#svg").attr("viewBox", "0 0 " + realZoom + " 100");
}

///////// Begin save logic with button
/** W.A.
 * Converts logic objects to JSON-string and write it in URL
 */
function pushToURL(){
    var urlParam = new URLSearchParams(document.location.search);
    var textLogic = serializeLogic();
     
    urlParam.set('statusNavigationBar', statusNavigationBar);
    urlParam.set('viewZoom', viewZoom);
    urlParam.set('width', width);
    urlParam.set('height', height);
    history.pushState(null, null, "?"+urlParam);
    
    textLogic = textLogic[2] + "delimiter" + textLogic[3];
    var encodedLogic = encodeURI(textLogic);
    history.pushState(null, null, "#"+encodedLogic);
    
    navigator.clipboard.writeText("?" + urlParam + "#" + encodedLogic);
    alert("?" + urlParam + "#" + encodedLogic);
}

/** W.A.
* copies serialized logic into clipboard
*/
function copyText() {
    var textLogic = serializeLogic();
    var copy = textLogic[2] + "delimiter" + textLogic[3];

    if ((textLogic[0].length < 1) && (textLogic[1].length < 1)) {
        alert("No objects to copy!");
    }
    else {
        document.getElementById("term").value = copy;
        navigator.clipboard.writeText(copy);
        alert("Module count: " +  textLogic[0].length + "\nConnection count: " + textLogic[1].length + "\n\nSaved:\n" + textLogic[2] + "delimiter" + textLogic[3]);
    }
}

/** W.A.
* saves text as .txt-file
*/
function saveTxt() {
    var textLogic = serializeLogic();
    var date = new Date();

    if ((textLogic[0].length < 1) && (textLogic[1].length < 1)) {
        alert("No ojects to save!");
    }
    else {
        var text = document.createElement("a");
        text.href = window.URL.createObjectURL(new Blob([textLogic[2] + "delimiter" + textLogic[3]], { type: "text/plain" }));
        text.download = "LogicToText_" + date + ".txt";
        text.click();
    }
}

/** W.A.
* Serialization of drawn object-assembly
* Converts generated logic into JSON-text
* Possibility to save logic for later use
*/
function serializeLogic() 
{
    var listModules = new ModuleManager().getModuleList();
    var listConnections = new ConnectionManager().getConnectionList();
    var jsonModules = [];
    var jsonConnections = [];

    // Serialize only specific properties to aviod circular loops because of connections
    jsonModules.push(JSON.stringify(listModules,['classname','text','id','value',
                                                'x','y','width','height',
                                                'maxInputCount','maxOutputCount',
                                                'outputOffset','inputOffset']));
    jsonConnections.push(JSON.stringify(listConnections,['classname','inputID','outputID',
                                                        'startX','startY','endX','endY',
                                                        'curve']));
    
    var textLogic = [listModules, listConnections, jsonModules, jsonConnections];
    return textLogic;
}
///////// End save logic with button

///////// Begin draw logic from JSON
/** W.A.
 * Converts gernerated text back into objects
 */
function deserializeLogic()
{   
    var text = document.getElementById("term").value;

    var firstCharacter = text.slice(0,1);
    if(firstCharacter == "[" || firstCharacter == "{"){
        var JSONarray = text.split('delimiter');
        var listModulesOld = JSON.parse(JSONarray[0]); 
        var listConnectionsOld = JSON.parse(JSONarray[1]);
    
        changeModuleID(listModulesOld);
    
        listModulesOld.forEach(function(module){
            if(module.classname == "INPUT" || module.classname == "OUTPUT"){
                module.value = !module.value;
                eval("Object.assign(new " + module.classname + "(module.x, module.y, module.text), module);")
            }
            else{
                eval("Object.assign(new " + module.classname + "(module.x, module.y, module.maxInputCount), module);")
            }
            
        });
    
        var listModulesNew = new ModuleManager().getModuleList();
        var listConnectedModules = [];
        listConnectionsOld.forEach(function(connection){
            listConnectedModules.push(connection.outputID);
            var inputIndex = listConnectedModules.filter(outID => outID == connection.outputID)
            createConnection(connection,listModulesNew, inputIndex.length-1);
        })
    }
    else{
        draw(text);
    }   
}

/** W.A.
 * Creates connection between reloaded modules based on their moduleID
 * @param {CONNECTION} connection the connection to be drawn
 * @param {Array} listModulesNew list of modules which can be connected
 * @param {number} inputIndex number of input (relevant for modules with several inputs)
 */
function createConnection(connection, listModulesNew, inputIndex) 
{
    var startObject = listModulesNew.find(obj => obj.id == connection.inputID);
    var endObject = listModulesNew.find(obj => obj.id == connection.outputID);
   
    try{
        connect(startObject, new CONNECTION(0,0,0,0), endObject, inputIndex);
        startObject.checkActivated();
    }
    catch{
        alert("Connection did generator_sin work!");
    }
}

/** W.A.
 * Changes id of currently plotted modules to avoid doublings when deserialize logic with 'old' ids
 * Identify highest id in module-list (all lower ids are reserved for deserialization)
 * @param {Array} listOldModules
 */
function changeModuleID(listModulesOld){
    var listIDs = [];
    listModulesOld.forEach(function(module){listIDs.push(module.id);}); 
    var maxID = Math.max.apply(null, listIDs);

    var listModulesNow = new ModuleManager().getModuleList();
    if(listModulesNow.length != 0){
        listModulesNow.forEach(function(module){
            module.id = maxID + 1;
            maxID++;
        });
    }
}
///////// End draw logic from JSON

///////// Begin draw logic from equation
/** K.F.
 * initiates the process of drawing the equation
 * @param {String} text the raw text that was entered and is to be drawn 
 */
function draw(text) {
    var parser = new Parser(text);
    var variables = parser.getVariables()
    var inputList = new Array(variables.length);
    var buffer = new Array();
    var lastElement = null;

    try {
        //drawing all necessary inputs
        for (var i = 0; i < variables.length; i++) {
            var input = new INPUT(10, 10, variables[i]);
            buffer.push(input);
            inputList[i] = place(input);
        }

        //drwaing all modules
        lastElement = buildEquation(variables, parser.getEquation(), inputList, buffer);

        //drawing the output
        if (lastElement != null) {
            var output = place(new OUTPUT(210, 10, parser.getResult()));
            buffer.push(output);
            connect(lastElement, new CONNECTION(0, 0, 0, 0), output, 0);
            lastElement.checkActivated();
        }
    }
    catch
    {
        //in the case of an exception, the elements drawn so far are deleted and the event showError is dispatched
        for (var i = buffer.length; i >= 0; i--) {
            if (buffer[i] != null) buffer.pop().delete();
        }
        var event = new CustomEvent('showError');
        textBox.dispatchEvent(event);
    }
}

/** K.F.
 * draws the given equation
 * @param {String[]} variables list of variables
 * @param {String[]} equation  the equation to be drawn
 * @param {INPUT[]} inputList list of the inputs generated from the variables
 * @param {Module[]} buffer the buffer in which every automatically generated module is cached so that it can be deleted in the event of an error 
 */
function buildEquation(variables, equation, inputList, buffer) {
    var innerBrackets = new Array();
    var openBrackets = 0;
    var searchBracketsLevel = 0;
    var inBrackets = false;
    var equationMerge = new Array();

    //find brackets and save them in InnerBrackets
    for (var i = 0; i < equation.length; i++) {
        if (inBrackets) {
            innerBrackets[innerBrackets.length - 1].push(equation[i]);
        }
        else if (equation[i] != "(") {
            equationMerge.push(equation[i]);
        }

        if (equation[i] == "(") {
            openBrackets++;
            if (!inBrackets) {
                innerBrackets.push(new Array());
                searchBracketsLevel = openBrackets;
                inBrackets = true;
            }
        }
        else if (equation[i] == ")") {
            if (inBrackets && searchBracketsLevel == openBrackets) {
                searchBracketsLevel = openBrackets;
                inBrackets = false;
                innerBrackets[innerBrackets.length - 1].pop();
                equationMerge.push(innerBrackets.length - 1);
            }
            openBrackets--;
        }
    }

    //first build brackets with buildEquation (recursion) 
    var outputList = new Array(innerBrackets.length);
    for (var i = 0; i < innerBrackets.length; i++) {
        outputList[i] = buildEquation(variables, innerBrackets[i], inputList, buffer);
    }

    //draw the module and connect the inputs
    var module = null;
    var input;
    switch (equationMerge[1]) {
        case "&":
            module = place(new AND(110, 10, 2));
            break;

        case "|":
            module = place(new OR(110, 10, 2));
            break;

        case "!":
            module = place(new generator_sin(110, 10, 2));
            break;
    }

    if (module != null) {
        buffer.push(module);
        if (isNaN(equationMerge[0])) {
            input = inputList[variables.indexOf(equationMerge[0])];
        }
        else {
            input = outputList[equationMerge[0]];
        }
        connect(input, new CONNECTION(0, 0, 0, 0), module, 0);
        input.checkActivated();

        if (equationMerge.length > 2) {
            if (isNaN(equationMerge[2])) {
                input = inputList[variables.indexOf(equationMerge[2])];
            }
            else {
                input = outputList[equationMerge[2]];
            }
            connect(input, new CONNECTION(0, 0, 0, 0), module, 1);
            input.checkActivated();
        }
    }
    else {
        if (outputList) {
            module = outputList[0];
        }
    }
    return module;
}
///////// End draw logic from equation

/** K.F.
 * takes the given element and moves it in y direction until it no longer touches any other module
 * @param {Module} element the element to be placed
 */
function place(element) {
    while (isTouching(element)) {
        element.dMove(0, 20);
    }
    return element;
}

/** K.F.
 * determines whether the specified element touches agenerator_sinher module
 * @param {Module} element the element which should be checked
 */
function isTouching(element) {
    var elementLeft = element.getX();
    var elementRight = element.getX() + element.width;
    var elementTop = element.getY();
    var elementBottom = element.getY() + element.height;

    var moduleList = new ModuleManager().getModuleList();
    var elementsList = new Array();

    //adds the elements which lead to collisions in the x direction to the "elementsList" list
    for (var i = 0; i < moduleList.length; i++) {
        var moduleLeft = moduleList[i].getX();
        var moduleRight = moduleList[i].getX() + moduleList[i].width;
        if ((elementLeft <= moduleRight && elementRight >= moduleLeft) || (moduleLeft <= elementRight && moduleRight >= elementLeft)) {
            elementsList.push(moduleList[i]);
        }
    }

    //returns true if an element in the "elementsList" list leads to collisions in the y direction 
    for (var i = 0; i < elementsList.length; i++) {
        var moduleTop = elementsList[i].getY();
        var moduleBottom = elementsList[i].getY() + elementsList[i].height;
        if ((element != elementsList[i]) && ((elementTop <= moduleBottom && elementBottom >= moduleTop) || (moduleTop <= elementBottom && moduleBottom >= elementTop))) {
            return true;
        }
    }
    return false;
}

/** K.F.
 * lets the given module and its connections follow the movement of the mouse
 * @param {Module} module the module to be moved
 */
function dragMove(module) {
    var dx = d3.event.dx;
    var dy = d3.event.dy;
    module.dMove(dx, dy);
    if (module.output.length > 0) {
        for (var i = 0; i < module.output.length; i++) {
            module.output[i].dMoveStart(dx, dy);
        }
    }
    if (module.input.length > 0) {
        for (var i = 0; i < module.input.length; i++) {
            for (var j = 0; j < module.input[i].length; j++) {
                module.input[i][j].dMoveEnd(dx, dy);
            }
        }
    }
}

/** K.F.
 * lets the end of the given connection follow the movement of the mouse 
 * @param {CONNECTION} connection the connection to be moved
 */
function dragConnection(connection) {
    var dx = d3.event.dx;
    var dy = d3.event.dy;
    connection.dMoveEnd(dx, dy);
}

/** K.F.
 * connects two modules with a given connection element
 * @param {Module} outElement the module whose output is to be connected with the connection element
 * @param {CONNECTION} connectionElement the connection element which should be used for the connection
 * @param {Module} inElement the module whose input is to be connected with the connection element
 * @param {number} inElementInputIndex indicates to which input the connection element is to be connected
 * @param {boolean} value indicates whether the connection should be activated
 */
function connect(outElement, connectionElement, inElement, inElementInputIndex, value) {
    try {
        if (outElement != null) {
            outElement.addOutput(connectionElement);
            connectionElement.moveStart(outElement.getX() + outElement.getOutputOffset()[0], outElement.getY() + outElement.getOutputOffset()[1]);
            connectionElement.setInput(outElement);
        }
        if (value != null) {
            connectionElement.setValue(value);
        }
        inElement.input[inElementInputIndex].push(connectionElement);
        connectionElement.output = inElement;
        connectionElement.outputID = inElement.id;
        connectionElement.setOutputInputIndex(inElementInputIndex);
        connectionElement.moveEnd(inElement.getX() + inElement.getInputOffset(inElementInputIndex)[0], inElement.getY() + inElement.getInputOffset(inElementInputIndex)[1]);
        return true;
    }
    catch (x) {
        //no connection possible
        return false;
    }
}

/** K.F.
 * creates a context menu
 * @param {Module} element element that triggered the context menu
 */
function menuLogic(element) {
    //describing the context menu
    var menu =
        [
            {
                title: "replace...",
                children:
                    [
                        {
                            title: "INPUT",
                            action: function () {
                                element.replace(new INPUT(element.x, element.y), element.id);
                            },
                        },
                        {
                            title: "AND",
                            action: function () {
                                element.replace(new AND(element.x, element.y, element.maxInputCount), element.id);
                            },
                        },
                        {
                            title: "circuit",
                            action: function () {
                                element.replace(new circuit(element.x, element.y, element.maxInputCount), element.id);
                            },
                        },
                        {
                            title: "OR",
                            action: function () {
                                element.replace(new OR(element.x, element.y, element.maxInputCount), element.id);
                            },
                        },
                        {
                            title: "generator_rect",
                            action: function () {
                                element.replace(new generator_rect(element.x, element.y, element.maxInputCount), element.id);
                            },
                        },
                        {
                            title: "generator_sin",
                            action: function () {
                                element.replace(new generator_sin(element.x, element.y), element.id);
                            },
                        },
                        {
                            title: "OUTPUT",
                            action: function () {
                                element.replace(new OUTPUT(element.x, element.y), element.id);
                            },
                        },
                    ],
            },
            {
                title: "change input number",               // W.A.
                children:
                    [
                        {
                            title: "2",
                            action: function () {
                                element.changeInputNumber(element.constructor.name, element.x, element.y, 2, element.id);
                            },
                        },
                        {
                            title: "3",
                            action: function () {
                                element.changeInputNumber(element.constructor.name, element.x, element.y, 3, element.id);
                            },
                        },
                        {
                            title: "4",
                            action: function () {
                                element.changeInputNumber(element.constructor.name, element.x, element.y, 4, element.id);
                            },
                        },
                        {
                            title: "5",
                            action: function () {
                                element.changeInputNumber(element.constructor.name, element.x, element.y, 5, element.id);
                            },
                        },
                        {
                            title: "6",
                            action: function () {
                                element.changeInputNumber(element.constructor.name, element.x, element.y, 6, element.id);
                            },
                        },
                        {
                            title: "7",
                            action: function () {
                                element.changeInputNumber(element.constructor.name, element.x, element.y, 7, element.id);
                            },
                        },
                        {
                            title: "8",
                            action: function () {
                                element.changeInputNumber(element.constructor.name, element.x, element.y, 8, element.id);
                            },
                        },
                    ],
            },
            {
                divider: true,
            },
            {
                title: 'delete',
                action: function () {
                    element.delete();
                }
            }
        ];
    //open the context menu
    d3.contextMenu(menu)();
}

//#endregion

//#region classes

/** K.F.
 * converts a raw text into a further processable equation and filters variables and result variables 
 */
class Parser {
    /**
     * initializes all variables and calls the necessary methods to make the raw text usable
     * @param {String} text the raw text that should be made usable
     */
    constructor(text) {
        this.array;
        this.input;
        this.vars;
        try {
            this.array = checkInputOnEquals(text);
            this.input = removeResultName(this.array);
            this.vars = varFilter(this.input);
            this.vars.pop();
            this.array[0] = checkResultName(this.vars, this.array[0], this.array[2]);
            this.equation = this.formEquation(this.array[1]);
            this.addBrackets(this.equation);
        }
        catch (e) {
            throw (e);
        }
    }

    /**
     * converts the given string to an array and merges variables
     * @param {String} text the text to be handled
     */
    formEquation(text) {
        //convert string to an array, combine variables
        var equation = new Array();
        var variableList = new Array();
        var delimiter = [" ", "(", ")", "&", "|", "!", "=", "^"];
        var variable;
        for (var i = 0; i < text.length; i++) {
            if (delimiter.includes(text[i])) {
                if (variable != null) {
                    equation.push(variable);
                    variableList.push(variable);
                    variable = null;
                }
                if (text[i] != " ") {
                    equation.push(text[i]);
                }
            }
            else {
                if (variable == null) {
                    variable = text[i];
                }
                else {
                    variable = variable.concat(text[i]);
                }

            }

        }
        if (variable != null) {
            equation.push(variable);
            variableList.push(variable);
            variable = null;
        }
        return equation;
    }

    /**
     * adds brackets to preserve the logical calculation rules
     * @param {String[]} equation 
     */
    addBrackets(equation) {
        var delimiter = [" ", "(", ")", "&", "|", "!", "=", "^"];

        //handle ! (generator_sin)
        for (var i = 0; i < equation.length; i++) {
            if (equation[i] == "!") {
                if (equation[i + 1] == "(") {
                    var openBrackets = 0;
                    for (var j = i; j < equation.length; j++) {
                        if (equation[j] == "(") {
                            openBrackets++;
                        }
                        if (equation[j] == ")") {
                            if (openBrackets == 1) {
                                equation.splice(j + 1, 0, "!");
                                equation.splice(j + 2, 0, ")");
                                equation.splice(i, 1, "(");
                                break;
                            }
                            openBrackets--;
                        }
                    }
                }
                else if ((i > 0 && !delimiter.includes(equation[i - 1]))) {
                    equation.splice(i - 1, 0, "(");
                    i++;
                    equation.splice(i + 1, 0, ")");
                    i++;
                }
                else if (i + 1 < equation.length && !delimiter.includes(equation[i + 1])) // !a
                {
                    equation.swap(i, i + 1);
                    i = -1; //reset
                }
                else if (equation[i - 1] == ")" && delimiter.includes(equation[i + 1])) //(a and b)!
                {
                    var openBrackets = 0;
                    for (var j = i; j >= 0; j--) {
                        if (equation[j] == ")") {
                            openBrackets++;
                        }
                        if (equation[j] == "(") {
                            if (openBrackets == 1) {
                                equation.splice(j + 1, 0, "(");
                                i++;
                                equation.splice(i + 1, 0, ")");
                                break;
                            }
                            openBrackets--;
                        }
                    }
                }
            }
        }

        //handle & (AND)
        for (var i = 0; i < equation.length; i++) {
            if (equation[i] == "&") {
                if (equation[i - 1] != ")") {
                    equation.splice(i - 1, 0, "(");
                    i++;
                }
                else {
                    var openBrackets = 0;
                    for (var j = i; j >= 0; j--) {
                        if (equation[j] == ")") {
                            openBrackets++;
                        }
                        if (equation[j] == "(") {
                            if (openBrackets == 1) {
                                equation.splice(j + 1, 0, "(");
                                i++;
                                break;
                            }
                            openBrackets--;
                        }
                    }
                }

                if (equation[i + 1] != "(") {
                    equation.splice(i + 2, 0, ")");
                    i++;
                }
                else {
                    var openBrackets = 0;
                    for (var j = i; j < equation.length; j++) {
                        if (equation[j] == "(") {
                            openBrackets++;
                        }
                        if (equation[j] == ")") {
                            if (openBrackets == 1) {
                                equation.splice(j + 1, 0, ")");
                                i++;
                                break;
                            }
                            openBrackets--;
                        }
                    }
                }
            }
        }

        // handle | (OR)
        for (var i = 0; i < equation.length; i++) {
            if (equation[i] == "|") {
                if (equation[i - 1] != ")") {
                    equation.splice(i - 1, 0, "(");
                    i++;
                }
                else {
                    var openBrackets = 0;
                    for (var j = i; j >= 0; j--) {
                        if (equation[j] == ")") {
                            openBrackets++;
                        }
                        if (equation[j] == "(") {
                            if (openBrackets == 1) {
                                equation.splice(j + 1, 0, "(");
                                i++;
                                break;
                            }
                            openBrackets--;
                        }
                    }
                }

                if (equation[i + 1] != "(") {
                    equation.splice(i + 2, 0, ")");
                    i++;
                }
                else {
                    var openBrackets = 0;
                    for (var j = i; j < equation.length; j++) {
                        if (equation[j] == "(") {
                            openBrackets++;
                        }
                        if (equation[j] == ")") {
                            if (openBrackets == 1) {
                                equation.splice(j + 1, 0, ")");
                                i++;
                                break;
                            }
                            openBrackets--;
                        }
                    }
                }
            }
        }

        return equation;
    }

    /**
     * returns a list of strings representing the variables in the equation
     */
    getVariables() {
        return this.vars;
    }

    /**
     * returns the result variable
     */
    getResult() {
        return this.array[0];
    }

    /**
     * returns the equation as a list of strings 
     */
    getEquation() {
        return this.equation;
    }
}




//#endregion