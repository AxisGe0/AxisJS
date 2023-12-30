class AX{
    constructor(data) {
        this.parent = document.querySelector(data.parent);
        this.elements = [];
    }

    async LoadConfig(axfile) {
        try {
            const response = await fetch(axfile);
            const AxData = await response.text();
            const JSObject = this.ParseAX(AxData,true);
            return JSObject;
        } catch (error) {
            console.error('Error loading AX file:', error);
            return null;
        }
    }
    
    async LoadFrom(axfile) {
        const scriptPath = new URL(axfile, document.currentScript.src).href;
        const jsonData = await this.LoadConfig(scriptPath);
        Object.values(jsonData).forEach((item) => {
            this.addelement(item);
        });
    }

    ParseAX(input, assign) {
        const result = {};
        let currentContext = result;
        const contextStack = [];
        let isCollectingFunction = false; // New state for detecting function collection
        let functionBody = ''; // Variable to hold the function body
        let functionKey = ''; // Variable to store the current function key
        const lines = input.split('\n').filter(line => line.trim().length > 0);
    
        lines.forEach(line => {
            const indent = line.match(/^\s*/)[0].length;
            const cleanLine = line.trim();
            const isNestedStart = cleanLine.endsWith('[');
            const keyValuePattern = /^(.+?):\s*(.*)$/;
            const keyOnlyPattern = /^(.+?):\s*\[$/;
            const functionPattern = /function\s*\(/; // Pattern to detect the start of a function
            //const functionPattern = /(\w+)\s*\(/; // Pattern to detect the start of a function
            //const functionPattern = /^(.+?)\(\)\s*{$/; // Pattern to detect the start of a function
            let match;
    
            if (isCollectingFunction) {
                // Append the current line to the function body
                functionBody += line + '\n';
                // Check if the current line is the closing brace of the function
                if (cleanLine === '};') {
                    // Assign the collected function body to the last function key
                    // and remove the trailing newline character
                    currentContext[functionKey] = functionBody.trim().replace('};','} ');
                    //currentContext[functionKey] = functionBody.trim();
                    // Reset the state
                    isCollectingFunction = false;
                    functionBody = '';
                    functionKey = '';
                }
            } else if (isNestedStart) {
                match = cleanLine.match(keyOnlyPattern);
                if (match) {
                    const key = match[1];
                    const newObj = {};
                    contextStack.push({
                        "obj": currentContext,
                        "indent": indent
                    });
                    currentContext[key] = newObj;
                    currentContext = newObj;
                }
            } else if (cleanLine === ']') {
                if (contextStack.length > 0) {
                    const previousContext = contextStack.pop();
                    currentContext = previousContext.obj;
                }
            } else {
                match = cleanLine.match(keyValuePattern);
                if (match) {
                    let [_, key, value] = match;
                    // Check for the start of a function
                    if (functionPattern.test(cleanLine)) {
                        isCollectingFunction = true;
                        functionKey = key;
                        functionBody += value + '\n'; // Include the opening brace
                    } else {
                        // Handle regular key-value pair
                        currentContext[key] = this.ProcessValue(value);
                    }
                }
            }
        });
    
        // Assign identifiers if needed
        if (assign){
            Object.entries(result).forEach(([k,v]) => {
                result[k].identifier = k
                assign = function(data){
                    if (data && data.nested){
                        var data = data.nested
                        Object.entries(data).forEach(([j,m]) =>{
                            data[j].identifier = j
                            if(data[j].identifier){
                                assign(data[j])
                            }
                        })
                    }
                }
                assign(result[k])
            });
        }
    
        return result;
    }
    
    // Helper function to process the value as number, boolean, or string
    ProcessValue(value) {
        if (value.startsWith('"') && value.endsWith('"')) {
            return value.slice(1, -1);
        } else if (!isNaN(value) && value !== '') {
            return Number(value);
        } else if (value === 'true') {
            return true;
        } else if (value === 'false') {
            return false;
        }
        return value;
    }

    element(identifier) {
        const searchElement = (element) => {
            if (element && element.elements) {
                const nestedElements = Object.values(element.elements);
                for (const nestedElement of nestedElements) {
                    if (nestedElement.identifier === identifier) {
                        return nestedElement;
                    }
                    const foundElement = searchElement(nestedElement);
                    if (foundElement) {
                        return foundElement;
                    }
                }
            }
            return null;
        };
        return searchElement(this);
    }

    addelement(data) {
        data.cls = data.cls || this.randomelement(10) 
        data.content = data.content || ''
        if (data.input){
            var element = document.createElement('input')
            element.setAttribute("class",data.cls)
        }else{
            var element = document.createElement(data.cls)
        }
        element.innerHTML = data.content.replace('%replace%',`<dynamic>${data.replace || ''}</dynamic>`);
        Object.assign(element.style, data.style);
        if (data.attr) {
            Object.entries(data.attr).forEach(([attributeName, attributeValue]) => {
                element.setAttribute(attributeName, attributeValue);
            });
        }
        this.parent.appendChild(element);
        var retval = {
            parent:element,
            current:element,//Fix Later
            elements:[],
            addelement:this.addelement,
            identifier:data.identifier,
            replace(text){
                var replace = element.querySelector('dynamic');
                if (replace) replace.innerHTML = text;
                return retval
            },
            update(html){
                if(html){
                    data.content = html
                    element.innerHTML = html
                    return retval
                }else{
                    return element.innerHTML
                }
            },
            fade(type,ms=500){
                if(type=='in'){
                    element.style.display = 'block'
                    function increment(value = 0) {
                        element.style.opacity = String(value);
                        if (element.style.opacity !== '1') {
                            setTimeout(() => {
                                increment(value + 0.1);
                            }, ms / 10);
                        }
                    };increment()
                }else if(type=='out'){
                    element.style.opacity= 1
                    function decrement() {
                        (element.style.opacity -= 0.1) < 0 ? element.style.display = 'none' : setTimeout(() => {
                            decrement();
                        }, ms / 10);
                    };decrement()
                    setTimeout(function() {
                        element.style.display = 'none'
                    },ms)
                }
                return retval
            },
            style(type,val) {
                if (typeof type === 'object') {
                    data.style = type
                }else{
                    if(val){
                        data.style[type] = val
                    }else{
                        return window.getComputedStyle(element).getPropertyValue(type)
                    }
                }
                Object.assign(element.style, data.style);
                return retval
            },
            attr(type,val){
                if (type){
                    if (val){
                        element.setAttribute(type,val)
                    }else{
                        return element.getAttribute(type)
                    }
                }
                return retval
            },
            randomelement:this.randomelement
        }
        if(data.onclick){
            if (typeof data.onclick == 'function'){
                element.onclick = function(){data.onclick(retval)}
            }else{
                element.onclick = function(){eval(`(${data.onclick})(retval)`)}
            }
        }
        if(data.onload){
            if (typeof data.onload == 'function'){
                data.onload(element)
            }else{
                eval(`(${data.onload})(retval)`)
            }
        }
        this.elements.push(retval);
        if (data.nested) {
            Object.values(data.nested).forEach(nestedData => {
                retval.addelement(nestedData);
            });
        }
        return retval;
    }
    
    randomelement(length){
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result;
    }
    
    httpreq(url, method, data, callback) {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                callback(xhr.responseText);
            }
        };
        if (method.toUpperCase() === "POST" && data) {
            xhr.send(data);
        } else {
            xhr.send();
        }
    }
}
