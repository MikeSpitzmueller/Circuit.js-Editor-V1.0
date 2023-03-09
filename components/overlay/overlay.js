class Overlay{
    parentSelector;
    overlay;
    confirmBtn;
    form;
    inputField = [];
    simParam = [];
    iFrame;

    render(parentselector){
        this.parentSelector = parentselector;
        $('head').append(`<link rel="stylesheet" href=".\\components\\overlay\\overlay.css" />`);
    }
    
    show(values){
        this.overlay = $('.overlay');
        if(this.overlay.length === 0){
            $(this.parentSelector).load('.\\components\\overlay\\overlay.html',()=>{
                this.overlay = $('.overlay')[0];
                this.form = $('.form-content')[0];

                // console.log(this.overlay);
                this.overlay.classList.add("transition");
                this.form.classList.add("transition");
                
                values.forEach(value => {
                    this.createInput(value,$(this.form));
                });

                this.createButton(values, $(this.form));

                setTimeout(() => $('.transition').addClass('visible'), 1);

            });
        }
        else{
            setTimeout(() => $('.transition').addClass('visible'), 1);
        }
    }
    
    hide(){
        setTimeout(() => $('.transition').removeClass('visible'), 1);
        
        // this.overlay.on('transitionend', () => {
            this.overlay.remove();
        // });
    }

    createButton(values, parentSelector){
        this.confirmBtn = document.createElement('button');
        this.confirmBtn.id = "confirmBtn";
        this.confirmBtn.innerText = "Submit";
        this.confirmBtn.classList.add("transition");

        $(parentSelector).append(this.confirmBtn);
        this.confirmBtn.addEventListener('click',(e)=>{

            // console.log(values);
            // console.log(values[0][0]);


            if(values[0][0] == "number") {
                e.preventDefault();

                this.simParam = [];

                this.inputField.forEach((input)=>{
                    this.simParam.push(input.value);
                })
                // console.log(this.simParam);
                new ModuleManager().updateModuleList(this.simParam[0], this.simParam[1]);
                // console.log(this.input);
            }

            else if(values[0][0] == "select") {
                e.preventDefault();
                // console.log(document.getElementById("circuitFrame").src);
                
                // console.log(this.inputField[0].value);

                var moduleList = new ModuleManager().getModuleList();
                // console.log(moduleList);
                // console.log(this.simParam);


                if(this.inputField[0].value == "Lowpass") {
                    document.getElementById("circuitFrame").src = "../war/circuitjs.html?startCircuit=_lowpass_ext.txt";
                    moduleList[1].image = "./Circuits/LR_Tiefpass.png";
                }
                else if(this.inputField[0].value == "Highpass") {
                    document.getElementById("circuitFrame").src = "../war/circuitjs.html?startCircuit=_highpass_ext.txt";
                    moduleList[1].image = "./Circuits/CR_Hochpass.png";
                }
                else if(this.inputField[0].value == "Resistor") {
                    document.getElementById("circuitFrame").src = "../war/circuitjs.html?startCircuit=_resistor_ext.txt";
                    }

                this.iFrame = document.getElementById("circuitFrame");
                console.log(this.iFrame.contentWindow);
                this.iFrame.contentWindow.oncircuitjsloaded = simLoaded;

                // console.log(moduleList[1]);
                // replace(new circuit(moduleList[1].x, moduleList[1].y, moduleList[1].image), moduleList[1].id);
            }
            

            this.hide();
        })
    }

    createInput(values,parentSelector){
        // Create Div Block
        const input = document.createElement('div');
        input.classList.add("inputBlock");
        input.classList.add("transition");
        $(parentSelector).append(input);

        // Create Label of the Input 
        const label = document.createElement('label');
        label.innerText = values[1] + ":";
        input.append(label);

        // Create Input
        if(values[0] == "number") {
            const form = document.createElement('input');
            form.type = values[0];
            form.step = values[2];
            form.min = values[3];
            form.max = values[4];
            form.classList.add("input");
            input.append(form);
            this.inputField.push(form);
        }

        else if(values[0] == "select") {

            var options = '<option>--- choose circuit ---</option>';
            for(var i = 0; i < values[2].length; i++) {
                options += '<option>' + values[2][i] + '</option>'
            }

            // console.log(options);

            const form = document.createElement('select');

            form.innerHTML += options;


            form.classList.add("select");
            // console.log(form);
            input.append(form);
            this.inputField.push(form);

        }
        
    }
}