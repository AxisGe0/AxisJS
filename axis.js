var c_values = {}
class AX{
    constructor(data) {
        this.parent = document.querySelector(data.parent);
        this.elements = [];
    }

    parse(input) {
        const result = {};
        let currentContext = result;
        const contextStack = [];
        let isCollectingFunction = false;
        let functionBody = '';
        let functionKey = '';
        const lines = input.split('\n').filter(line => line.trim().length > 0);
        lines.forEach(line => {
            const indent = line.match(/^\s*/)[0].length;
            const cleanLine = line.trim();
            const isNestedStart = cleanLine.endsWith('[');
            const keyValuePattern = /^(.+?):\s*(.*)$/;
            const keyOnlyPattern = /^(.+?):\s*\[$/;
            const functionPattern = /function\s*\(/;
            let match;
            if (isCollectingFunction) {
                functionBody += line + '\n';
                if (cleanLine === '};') {
                    currentContext[functionKey] = functionBody.trim().replace('};','} ');
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
                    if (functionPattern.test(cleanLine)) {
                        isCollectingFunction = true;
                        functionKey = key;
                        functionBody += value + '\n';
                    } else {
                        currentContext[key] = this.processVal(value);
                    }
                }
            }
        });
        return this.convertStrToFxn(result); //result;
    }

    convertStrToFxn(obj) {
        const result = structuredClone(obj);
        var recursiveCheck  = function(obj) {
            for (const key in obj) {
                if (typeof obj[key] === 'string' && obj[key].includes('function')) {
                    obj[key] = new Function(`return (${obj[key]})`)();
                } else if (obj[key] && typeof obj[key] === 'object') {
                    recursiveCheck(obj[key]);
                }
            }
        }
        recursiveCheck(result);
        return result;
    }

    processVal = function(value) {
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
    
    async load(file){
        try{
            const response = await fetch(file);
            var data = this.parse(await response.text());
            var imports = data.imports
            delete data.imports;
            if(imports){
                for(let k in imports){
                    const response = await fetch(imports[k]);
                    const data = await response.text();
                    const object = this.parse(data,false);
                    c_values[`--${k}`] = object.export
                }
            }
            this.searchVars(data)
            this.sortVars(c_values)// Tests needed
            this.sortVars(data)
            this.assignIdentifiers(data)
            Object.values(data).forEach((item) => {
                this.add(item);
            });
        } catch(err){
            console.warn(err)
            return null;
        }
    }

    searchVars(obj){
        if (!obj || typeof obj !== 'object') {
            return;
        }
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                if(key.includes('--')){
                    c_values[key] = obj[key]
                    delete obj[key];
                }
                this.searchVars(obj[key]);
            }
        }
    }

    sortVars(obj) {
        if (!obj || typeof obj !== 'object') {
            return;
        }
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] === 'string' && obj[key].includes("--")) {
                    var toAssign = c_values[obj[key]]
                    if (typeof toAssign == "object"){
                        obj[key] = {...toAssign}
                    } else{
                        obj[key] = toAssign || "__notdef";
                    }
                } else if (typeof obj[key] === 'object') {
                    this.sortVars(obj[key]);
                }
            }
        }
    }

    assignIdentifiers(obj) {
        if (!obj || typeof obj !== 'object') {
            return;
        }
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                if(typeof obj[key] == "object"){
                    obj[key].identifier = key
                }
            }
            if (typeof obj[key] === 'object' && obj[key].nested) {
                this.assignIdentifiers(obj[key].nested);
            }
        }
    }

    get(identifier) {
        var search = function(data,identifier){
            if(data){
                for(let key in data){
                    var v = data[key]
                    if(v.identifier == identifier){
                        return v
                    }
                    var found =  search(v.elements,identifier)
                    if(found){
                        return found;
                    }
                }
            }
        }
        return search(this.elements,identifier)
    }

    getVar(val) {
        return (c_values[`--${val}`]);
    }

    add(data){
        if(data.quantity){
            var quan = data.quantity
            data.quantity = undefined
            for(var i =0;i<quan;i++){
                this.add({...data,index:i})
            }
            return 
        }
        if (!data.cls) {
            data.cls = this.randomstr(10);
        }
        if (!data.content) {
            data.content = '';
        }
        var element = document.createElement(data.cls);
        element.innerHTML = data.content.replace('%replace%',`<dynamic>${data.replace || ''}</dynamic>`);
        try {
            Object.assign(element.style, data.style);
        } catch(err) {
            console.warn(err)
        }
        if (data.attr) {
            Object.entries(data.attr).forEach(([attributeName, attributeValue]) => {
                element.setAttribute(attributeName, attributeValue);
            });
        }
        if (data.properties) {
            Object.entries(data.properties).forEach(([selector, properties]) => {
                const rule = `${data.cls}${selector} { ${Object.entries(properties)
                    .map(([prop, value]) => `${prop}: ${value};`).join(' ')}
                }`;
                if (document.styleSheets.length == 0) {
                    document.head.appendChild(document.createElement("style"));
                }
                try{
                    document.styleSheets[0].insertRule(rule, 0);
                }catch(err){
                    console.warn(err)
                }
            });
        }
        this.parent.appendChild(element);
        var retval = {
            parent:element,
            current:element,//Fix Later
            elements:[],
            add:this.add,
            identifier:data.identifier,
            index:data.index,
            randomstr:this.randomstr
        }
        retval = {...retval,...UI}
        if(data.onclick){
            element.onclick = function() {
                data.onclick(retval)
            };
        }
        if(data.onload){
            data.onload(retval)
        }
        this.elements.push(retval);
        if (data.nested) {
            Object.values(data.nested).forEach(nestedData => {
                retval.add({...nestedData,index:data.index});
            });
        }
        return retval;
    }
    
    randomstr(length){
        let result = '';
        for (let i = 0; i < length; i++) {
            const randomCharCode = Math.floor(Math.random() * (122 - 97 + 1)) + 97;
            result += String.fromCharCode(randomCharCode);
        }
        return result;
    }

    httpreq(url, method, data, callback) {// Make better
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                callback(xhr.responseText);
            }
        };
        if (method.toUpperCase() === "POST" && data) {
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(data);
        } else {
            xhr.send();
        }
    }
}

UI = {
    attr(type,val){
        if (type){
            if (val){
                this.current.setAttribute(type,val)
            }else{
                return this.current.getAttribute(type)
            }
        }
        return this
    },
    replace(text){
        var replace = this.current.querySelector('dynamic');
        if (replace) replace.innerHTML = text;
        return this
    },
    update(html){
        if(html){
            this.current.innerHTML = html
            return this
        }else{
            return this.current.innerHTML
        }
    },
    style(type,val){
        var element = this.current
        if (typeof type === 'object') {
            for(let k in type){
                this.style(k,type[k])
            }
        }else{
            if(val){
                element.style[type] = val
            }else{
                return window.getComputedStyle(element).getPropertyValue(type)
            }
        }
        return this
    },
    fade(type,duration = 500,cb){
        var element = this.current
        if(type == "in"){
            element.style.opacity = 0;
            element.style.display = 'block';
            let last = +new Date();
            let tick = function() {
                element.style.opacity = +element.style.opacity + (new Date() - last) / duration;
                last = +new Date();
                if (+element.style.opacity < 1) {
                    (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
                }
            }
            tick()
        }else{
            element.style.opacity = 1;
            let last = +new Date();
            let tick = function() {
                element.style.opacity = +element.style.opacity - (new Date() - last) / duration;
                last = +new Date();
                if (+element.style.opacity > 0) {
                    (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
                } else {
                    element.style.display = 'none';
                }
            }
            tick()
        }
        setTimeout(function() {
            //element.style.opacity = (type === 'in') ? 1 : 0;
            element.style.opacity = 'unset';
            if (cb && typeof cb === "function") {
                cb();
            }
        }, duration + 50);
    }
}

window.onload = async () => {
    const ax = document.querySelector('ax');
    if (ax) {
        const file = ax.getAttribute('src');
        const parent = ax.getAttribute('parent') || "body";
        const instance = new AX({ parent });
        try {
            console.log(`${file}: Loaded`);
            if (window.axload && typeof window.axload === 'function') {
                window.axload(instance);
            }
            await instance.load(file);
        } catch (error) {
            console.error(`Error loading ${file}:`, error);
        }
    }
};
