/** K.F./W.A.
 * This class is the basis of every logic module. It contains the most important methods
 */
class Module {
    /**
     * Creates a new module and initializes most class variables with a default value
     * @param {number} x the x position in which the module is to be set 
     * @param {number} y the y position in which the module is to be set 
     */
    constructor(x, y) {
        this.classname = this.constructor.name;    
        this.x = x;
        this.y = y;
        this.id = modulID;
        modulID++;
        this.width = 20;
        this.height = 20;
        this.maxInputCount = 2;
        this.maxOutputCount = 1;
        this.outputOffset = [];
        this.inputOffset = [];
        this.connectionPointRadius = 3;
        this.sizeStrokeWidth = 3;
        this.formRadius = 1;
        this.group = null;
        this.input = new Array();
        this.output = new Array();
        this.text = '';
        this.negation = false;
        this.value = false;
        new ModuleManager().addModule(this);
    }

    /** W.A.
    * Calculates position of input-circles + adding to inputOffset
    */
    calcInputOffset() {
        var distCircles = this.height / (this.maxInputCount + 1);   // Distance of circles to each other based on module height

        for (var i = 0; i < this.maxInputCount; i++) {
            this.inputOffset[i] = [0, distCircles * (i + 1)];        // Combining positions to array
        }
    }

    /** W.A.
    * Calculates position of input-circles + adding to inputOffset
    * @param {boolean} negation indicates whether a negation should be appended
    */
    calcOutputOffset(negation) {
        if (negation) {
            this.outputOffset = [this.width + 5, this.height / 2];
        }

        else {
            this.outputOffset = [this.width, this.height / 2];
        }
    }

    /** K.F.
     * builds the module in the SVG element based on the set class variables
     * @param {String} text the text to be written in the module
     * @param {boolean} negation indicates whether a negation should be appended
     * @param {boolean} activatable indicates whether the module should be activated when clicked
     */
    build(text, negation, activatable) 
    {
        var thisElement = this;
        this.text = text;
        this.negation = negation;
        this.activatable = activatable;

        this.value = false;
        this.group = d3.select("svg").append("g");      // Creates SVG-element
        this.group.append("rect")                       // Shape-attributes of module (rectangle)
            .attr("x", 0)
            .attr("y", 0)
            .attr("rx", this.formRadius)
            .attr("ry", this.formRadius)
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("fill", "transparent")
            .attr("stroke", colorStandard);

        this.group.append("image")                       // Text-attributes of module
            .attr("href", this.image)
            .attr("height", this.height)
            .attr("width", this.width)

        if (negation)                                    // If module with negation -> create circle for negation 
        {
            this.value = true;

            this.group.select("text").attr("fill", colorSelected);
            this.group.select("rect").attr("stroke", colorSelected);

            this.group.append("circle")
                .attr("cx", this.width + 5)
                .attr("cy", this.height / 2)
                .attr("r", 5)
                .attr("fill", "transparent")
                .attr("stroke", colorStandard);
        }

        for (var i = 0; i < this.maxOutputCount; i++)   // Creates output-circles
        {
            this.group.append("circle")
                .attr("cx", this.outputOffset[0])
                .attr("cy", this.outputOffset[1])
                .attr("r", this.connectionPointRadius)
                .attr("fill", colorConnectionPoints)
                .attr("stroke", "transparent")
                .attr("stroke-width", this.sizeStrokeWidth)
                .on("mouseover", function () { d3.select(this).attr("fill", colorSelected).attr("stroke", colorSelected) })
                .on("mouseout", function () { d3.select(this).attr("fill", colorConnectionPoints).attr("stroke", "transparent") })
                .call(d3.drag()
                    .on("start", function () {
                        var connection = new CONNECTION(thisElement.getX() + thisElement.outputOffset[0], thisElement.getY() + thisElement.outputOffset[1], thisElement.getX() + thisElement.outputOffset[0], thisElement.getY() + thisElement.outputOffset[1])
                        connection.setInput(thisElement);
                        if (thisElement.value) {
                            thisElement.output.push(connection.setValue(true));
                        }
                        else {
                            thisElement.output.push(connection.setValue(false));
                        }
                    })
                    .on('drag', function () { dragConnection(thisElement.output[thisElement.output.length - 1]); })
                    .on("end", function () {
                        if (!connect(null, thisElement.output[thisElement.output.length - 1], new EventManager().getLastEventElement(), new EventManager().getElementInputIndex())) {
                            thisElement.output.pop().delete();
                        }
                    })
                );
        }

        var inputIndexList = new Array(this.maxInputCount);
        for (var i = 0; i < this.maxInputCount; i++)         // Creates input-circles
        {
            inputIndexList[i] = i;
            this.group.append("circle")
                .attr("cx", this.inputOffset[i][0])
                .attr("cy", this.inputOffset[i][1])
                .attr("r", this.connectionPointRadius)
                .attr("fill", colorConnectionPoints)
                .attr("stroke", "transparent")
                .attr("stroke-width", this.sizeStrokeWidth)
                .attr("class", "input");
        }
        this.group.selectAll(".input")
            .data(inputIndexList)
            .on("mouseover", function (d) { new EventManager().setEventElement(thisElement, d); d3.select(this).attr("fill", colorSelected).attr("stroke", colorSelected) })
            .on("mouseout", function (d) { new EventManager().setEventElement(null, d); d3.select(this).attr("fill", colorConnectionPoints).attr("stroke", "transparent") });//input[0]

        this.group.attr('transform', 'translate(' + this.x + ',' + this.y + ')');
        this.group.on("contextmenu", function () { d3.event.preventDefault(); menuLogic(thisElement) });
        this.group.call(d3.drag().on('drag', function () { dragMove(thisElement) }));
        if (activatable) 
        {
            this.group.on("click", function () 
            { 
                if (globalDeleteActive) { thisElement.delete() } 
                else { thisElement.checkActivated(); } 
            });
        }
        else 
        {
            this.group.on("click", function () 
            { 
                if (globalDeleteActive) { thisElement.delete() } 
            });
        }
    }

    /** K.F.
    * Adds inputs as new array
    */
    addsInputToArray() {
        for (var i = 0; i < this.maxInputCount; i++) {
            this.input.push(new Array);
        }
    }

    /** K.F.
     * moves the module to the given coordinates
     * @param {number} x target x coordinate
     * @param {number} y target y coordinate
     */
    move(x, y) {
        this.group.attr('transform', 'translate(' + x + ',' + y + ')');
        this.x = x;
        this.y = y;
    }

    /** K.F.
     * shifts the module by the specified values
     * @param {number} dx shift in x direction
     * @param {number} dy shift in y direction
     */
    dMove(dx, dy) {
        this.group.attr('transform', 'translate(' + (this.x + dx) + ',' + (this.y + dy) + ')');
        this.x += dx;
        this.y += dy;
    }

    /** K.F.
     * returns the current position in x direction
     */
    getX() {
        return this.x;
    }

    /** K.F.
     * returns the current position in y direction
     */
    getY() {
        return this.y;
    }

    /** K.F.
     * deletes the module and its connections
     */
    delete() {
        for (var i = this.input.length - 1; i >= 0; i--) {
            for (var j = this.input[i].length - 1; j >= 0; j--) {
                this.input[i][j].delete();
                //this.input[i].pop().delete();
            }
        }
        while (this.output.length > 0) {
            var temp = this.output[0].output;
            this.output[0].delete();
            temp.checkActivated();
            temp = null;
        }
        new ModuleManager().removeModule(this);
        this.group.remove();
    }

    /** K.F.
     * checks whether the module needs to be activated
     * @param {boolean} activate
     */
    activateInactivate(activate) {
        if (activate) {
            this.value = true;
            if (this.output.length > 0) {
                for (var i = 0; i < this.output.length; i++) {
                    this.output[i].setValue(true);
                }
            }
            this.group.select("text").attr("fill", colorSelected);
            this.group.select("rect").attr("stroke", colorSelected);
        }
        else {
            this.value = false;
            if (this.output.length > 0) {
                for (var i = 0; i < this.output.length; i++) {
                    this.output[i].setValue(false);
                }
            }
            this.group.select("text").attr("fill", colorStandard);
            this.group.select("rect").attr("stroke", colorStandard);
        }
    }

    /** K.F.
     * toggles the value and the color of the module
     *
    toggleActivate() {
        return;
    }*/

    /** K.F.
     * returns the offset of the output connectionpoint
     */
    getOutputOffset() {
        return this.outputOffset;
    }

    /** K.F.
     * returns the offset of the input connectionpoint at index
     * @param {number} index indicates the input
     */
    getInputOffset(index) {
        return this.inputOffset[index];
    }

    /** K.F.
     * replaces this module with agenerator_sinher module
     * @param {Module} newModule the module with which it is to be replaced
     */
    replace(newModule, oldID) {
        var thisElement = this;
        newModule.id = oldID;
        //inputs:
        for (var i = 0; i < thisElement.input.length && i < newModule.maxInputCount; i++) {
            for (var j = 0; j < thisElement.input[i].length; j++) {
                var oldConnection = thisElement.input[i][j];
                var newConnection = new CONNECTION(oldConnection.input.getX() + oldConnection.input.getOutputOffset()[0], oldConnection.input.getY() + oldConnection.input.getOutputOffset()[1], thisElement.getX() + thisElement.getInputOffset(i)[0], thisElement.getY() + thisElement.getInputOffset(i)[1]);
                newConnection.setInput(oldConnection.input)
                var value = false;
                if (oldConnection.value) {
                    value = true;
                }
                connect(oldConnection.input, newConnection, newModule, i, value);
            }
        }
        //outputs:
        for (var i = 0; i < thisElement.output.length && i < newModule.maxOutputCount; i++) {
            var oldConnection = thisElement.output[i];
            var newConnection = new CONNECTION(newModule.x + newModule.getOutputOffset()[0], newModule.y + newModule.getOutputOffset()[1], oldConnection.output.getX() + oldConnection.output.getInputOffset(oldConnection.outputInputIndex)[0], oldConnection.output.getY() + oldConnection.output.getInputOffset(oldConnection.outputInputIndex)[1]);
            connect(newModule, newConnection, oldConnection.output, oldConnection.outputInputIndex, 0);
        }
        thisElement.delete();
    }
    /** W.A.
     * changes the number of the module's inputs
     * @param {string} classname name of the modul's subclass
     * @param {number} x x position of module
     * @param {number} y y position of module
     * @param {number} inputCount new number of the module's inputs
     */

    /** K.F.
     * adds an element to the output list
     * @param {CONNECTION} element the element to be added
     */
    addOutput(element) {
        this.output.push(element);
    }
}

/** K.F./W.A.
 * implements a Module as an circuit module
 */
class circuit extends Module {
    /**
     * sets all variables for an circuit module 
     * @param {number} x the x position in which the module is to be set
     * @param {number} y the y position in which the module is to be set
     * @param {number} inputCount the number of inputs is to be set
     * @param {number} oldID id of old element in case of replacement
     */
    constructor(x, y)                        
    {
        super(x, y);

        this.maxInputCount = 2;                    
        this.maxOutputCount = 1;
        this.width = 250;
        this.height = 250;
        this.image = "./Circuits/RC_Tiefpass.png"

        this.calcOutputOffset();                        
        this.calcInputOffset();                             
        this.build("circuit");
        this.addsInputToArray();                            
    }

}


/** K.F./W.A.
 * implements a Module as an generator_rect module
 */
class generator_rect extends Module {
    /**
     * sets all variables for an generator_rect module 
     * @param {number} x the x position in which the module is to be set
     * @param {number} y the y position in which the module is to be set
     * @param {number} inputCount the number of inputs is to be set
     */
    constructor(x, y)                             
    {
        super(x, y);
        this.maxInputCount = 0;                    
        this.maxOutputCount = 1;
        this.width = 150;
        this.height = 150;
        this.image = "./Circuits/rect.png"

        this.calcOutputOffset();                        
        this.calcInputOffset();                             
        this.build("rect");
        this.addsInputToArray();                            
    }

}

/** K.F./W.A.
 * implements a Module as an generator_sin module
 */
class generator_sin extends Module {
    /**
     * sets all variables for an generator_sin module 
     * @param {number} x the x position in which the module is to be set
     * @param {number} y the y position in which the module is to be set
     */
    constructor(x, y) 
    {
        super(x, y);
        this.maxInputCount = 0;
        this.maxOutputCount = 1;
        this.width = 150;
        this.height = 150;
        this.image = "./Circuits/Sinus.png"

        this.calcOutputOffset();                        
        this.calcInputOffset();                             
        this.build("rect");
        this.addsInputToArray();                            
    }

}



