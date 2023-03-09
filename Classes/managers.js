/** W.A.
 * keeps list of the currently generated connections
 */
class ConnectionManager {
    /**
     * This class is written as a singleton. Only one Instance can be made. If there is already an instance the constructor will return it.
     */
    constructor() {
        if (!ConnectionManager.instance) {
            this.connectionList = new Array();
            ConnectionManager.instance = this;
        }
        return ConnectionManager.instance;
    }

    /**
     * adds the line to the connection list
     * @param {CONNECTION} line the module to be add
     */
    addConnection(line) {
        this.connectionList.push(line);
    }

    /**
     * removes the given CONNECTION from the connection list
     * @param {CONNECTION} line the module to be removed
     */
    removeConnection(line) {
        this.connectionList.splice(this.connectionList.indexOf(line), 1);
    }

    /**
     * returns a list of all currently generated CONNECTIONS
     */
    getConnectionList() {
        return this.connectionList;
    }
}

/** K.F.
 * keeps list of the currently generated modules
 */
class ModuleManager {
    /**
     * This class is written as a singleton. Only one Instance can be made. If there is already an instance the constructor will return it.
     */
    constructor() {
        if (!ModuleManager.instance) {
            this.moduleList = new Array();
            ModuleManager.instance = this;
        }
        return ModuleManager.instance;
    }

    /**
     * adds the given module to the module list
     * @param {Module} module the module to be add
     */
    addModule(module) {
        this.moduleList.push(module);
        console.log(this.moduleList);
    }

    /**
     * removes the given Module from the module list
     * @param {Module} module the module to be removed
     */
    removeModule(module) {
        this.moduleList.splice(this.moduleList.indexOf(module), 1);
    }

    /**
     * returns a list of all currently generated Modules
     */
    getModuleList() {
        return this.moduleList;
    }


    /**M.S.
     * updates the ModuleList with new frequency and amplitude of the generator
     */
    updateModuleList(freq, amplitude) {
        if(this.moduleList[0].classname == "generator_sin") {
            this.moduleList[0].frequency = freq;
            this.moduleList[0].amplitude = amplitude;
        }
    }


}

/**
 * The EventManager is to be notified when the user hovers over a connection Point with the mouse.
 * This event can be queried in order to find the object to be connected with a CONNECTION
 */
class EventManager {
    /**
     * This class is written as a singleton. Only one Instance can be made. If there is already an instance the constructor will return it.
     */
    constructor() {
        if (!EventManager.instance) {
            this.lastEventElement = null;
            this.elementInput = 0;
            EventManager.instance = this;
        }
        return EventManager.instance;
    }

    /**
     * directs the EventManager to the given element
     * @param {Module} eventElement The module which triggered the event
     * @param {number} inputIndex The Index of the input which triggered the Event
     */
    setEventElement(eventElement, inputIndex) {
        this.lastEventElement = eventElement;
        this.elementInputIndex = inputIndex; // 1 oben, 2 unten
    }

    /**
     * returns the object that last reported an event
     */
    getLastEventElement() {
        return this.lastEventElement;
    }

    /**
     * returns the index of the input of the object that last reported an event
     */
    getElementInputIndex() {
        return this.elementInputIndex;
    }
}
