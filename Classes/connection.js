/** K.F.
 * acts as a connection element between modules
 */
class CONNECTION {
    /**
     * creates a connection based on the given parameters
     * @param {number} startX the x position in which the connection is to be start
     * @param {number} startY the y position in which the connection is to be start
     * @param {number} endX the x position in which the connection is to be end
     * @param {number} endY the y position in which the connection is to be end
     */
    constructor(startX, startY, endX, endY) {
        var thisElement = this;

        this.classname = this.constructor.name;
        this.outputInputIndex;
        this.input = null;
        this.output = null;
        this.inputID = null;
        this.outputID = null;
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.curve = 40;
        this.path = d3.select("svg").append("path")
            .attr("d", "M" + startX + " " + startY + " C" + (startX + this.curve) + " " + startY + ", " + (endX - this.curve) + " " + endY + ", " + endX + " " + endY + " ")
            .attr("stroke", colorStandard)
            .attr("fill", "transparent")
            .attr("stroke-width", "1px")
            .on("mouseover", function () { if (thisElement.output != null) { d3.select(this).attr("stroke-width", "3px"); if (thisElement.value) { d3.select(this).attr("stroke", colorSelected) } else { d3.select(this).attr("stroke", colorConnectionPoints) } } })
            .on("mouseout", function () { d3.select(this).attr("stroke-width", "1px"); if (thisElement.value) { d3.select(this).attr("stroke", colorSelected) } else { d3.select(this).attr("stroke", colorStandard) } })
            .on("contextmenu", function () { d3.event.preventDefault(); thisElement.delete(true) })
            .on("click", function () { if (globalDeleteActive) { thisElement.delete(true) } });
        this.path.moveToBack();
        new ConnectionManager().addConnection(this);
    }

    /**
     * moves the end of the connection to the given coordinates
     * @param {number} x target x coordinate
     * @param {number} y target y coordinate
     */
    moveEnd(x, y) {
        this.endX = x;
        this.endY = y;
        this.path.attr("d", "M" + this.startX + " " + this.startY + " C" + (this.startX + this.curve) + " " + this.startY + ", " + (this.endX - this.curve) + " " + this.endY + ", " + this.endX + " " + this.endY + " ");
        this.path.moveToBack();
    }

    /**
     * moves the start of the connection to the given coordinates
     * @param {number} x target x coordinate
     * @param {number} y target y coordinate
     */
    moveStart(x, y) {
        this.startX = x;
        this.startY = y;
        this.path.attr("d", "M" + this.startX + " " + this.startY + " C" + (this.startX + this.curve) + " " + this.startY + ", " + (this.endX - this.curve) + " " + this.endY + ", " + this.endX + " " + this.endY + " ");
        this.path.moveToBack();
    }

    /**
     * shifts the end of the connection by the specified values
     * @param {number} dx shift in x direction
     * @param {number} dy shift in y direction
     */
    dMoveEnd(dx, dy) {
        this.endX += dx;
        this.endY += dy;
        this.path.attr("d", "M" + this.startX + " " + this.startY + " C" + (this.startX + this.curve) + " " + this.startY + ", " + (this.endX - this.curve) + " " + this.endY + ", " + this.endX + " " + this.endY + " ");
        this.path.moveToBack();
    }

    /**
     * shifts the start of the connection by the specified values
     * @param {number} dx shift in x direction
     * @param {number} dy shift in y direction
     */
    dMoveStart(dx, dy) {
        this.startX += dx;
        this.startY += dy;
        this.path.attr("d", "M" + this.startX + " " + this.startY + " C" + (this.startX + this.curve) + " " + this.startY + ", " + (this.endX - this.curve) + " " + this.endY + ", " + this.endX + " " + this.endY + " ");
        this.path.moveToBack();
    }

    /**
     * deletes this connection
     * @param {boolean} [setValue] indicates weather the value should first set to false 
     */
    delete(resetValue) {
        if (this.output != null) {
            try {
                if (resetValue) {
                    this.setValue(false);
                }
            }
            catch
            {

            }
            var index = new Array();
            index.push(new Array());
            index.push(new Array()); // [[i][j]]

            for (var i = 0; i < this.output.input.length; i++) {
                var temp = this.output.input[i].indexOf(this);
                if (temp >= 0) {
                    index[0].push(i);
                    index[1].push(temp);
                }
            }
            for (var i = 0; i < index[0].length; i++) {
                this.output.input[index[0][i]].splice(index[1][i], 1)
            }
        }
        if (this.input != null) {
            var index = this.input.output.indexOf(this);
            if (index >= 0) {
                this.input.output.splice(index, 1);
            }
        }
        this.input = null;
        this.output = null;
        this.path.remove();
        new ConnectionManager().removeConnection(this);
    }

    /**
     * sets the input to the given object and returns this connection
     * @param {Module} module the object which should be the new input
     */
    setInput(module) {
        this.input = module;
        this.inputID = module.id;
        return this; // returns itself for inline useage
    }

    /**
     * sets the value of the connection to the given value and returns this connection
     * @param {boolean} value the new value
     */
    setValue(value) {
        try {
            if (value != this.value) {
                if (value) {
                    this.path.attr("stroke", colorSelected);
                }
                else {
                    this.path.attr("stroke", colorStandard);
                }
                this.value = value;
                if (this.output != null) {
                    this.output.checkActivated();
                }
            }
        }
        catch (e) {
            alert("An infinite loop was found, which may lead to incorrect results");
        }
        return this; // returns itself for inline useage
    }

    /**
     * sets the outputInputIndex to the given value
     * @param {number} index the index to which the variable should be set
     */
    setOutputInputIndex(index) {
        this.outputInputIndex = index;
    }
}
