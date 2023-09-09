function extractClassName(input) {
    let re = /class\s+([a-zA-Z_]+)\s*.*/;
    let m = re.exec(input);
    return m[1];
}

function extractRawFields(input) {
    let re = /.*\s*{(.*)}\s*.*/;
    let m = re.exec(input);
    return m[1];
}


function extractFields(rawFields) {
    let fields = [];
    rawFields = rawFields.split(";");
    if (rawFields[rawFields.length - 1].trim().length == 0) {
        rawFields.pop();
    }
    for (const fieldItem of rawFields) {
        fields.push(extractSingleField(fieldItem));
    }
    format_ankh_type();
    set_ankh_correct_type();
    return fields;
}


// fields with types for ankh mocker
let ankh_fields = [];

function extractSingleField(rawField) {
    rawField = rawField.split(":");
    let ankh_field_item = {};
    ankh_field_item.label = rawField[0];
    ankh_field_item.type = rawField[1];
    ankh_fields.push(ankh_field_item);
    return rawField[0]
}

function format_ankh_type() {
    for (const item of ankh_fields) {
        let index = ankh_fields.indexOf(item);
        item.type = item.type.split('=')[0];
        ankh_fields[index] = item;
    }
}

function set_ankh_correct_type() {
    for (const item of ankh_fields) {
        let index = ankh_fields.indexOf(item);
        if (item.type.toLowerCase() == "string") {
            item.type = "String";
        }
        else if (item.type.toLowerCase() == "number") {
            item.type = "int";
        } else {
            item.type = "String";
        }
        ankh_fields[index] = item;
    }
}

function generate_ankh_init_ts() {
    var c_item = "";

    for (const fieldItem of ankh_fields) {
        c_item += `${fieldItem.type.trim()} ${fieldItem.label.trim()};\n`;
    }
    let res = `
    static ankh_init = \`
    ${c_item}
    \`;
    `
    return res;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

//   project.name = projectJSON.name;
function generateParsingFields(fields, className) {
    let res = "";
    className = className.toLowerCase();
    for (const fieldItem of fields) {
        res += `${className}.${fieldItem} = ${className}_json.${fieldItem};\n`;
    }
    return res;
}

function generateParsingFieldsToJSON(fields, className) {
    let res = "";
    className = className.toLowerCase();
    for (const fieldItem of fields) {
        res += `${fieldItem} : ${className}.${fieldItem},\n`;
    }
    res = res.trim().substring(0, res.length - 2);
    return res;
}

function generateFromJSON(fields, className) {
    let lowerClassName = className.toLowerCase();
    let parsingFields = generateParsingFields(fields, className);
    let res =
        `static from_json(${lowerClassName}_json:any) {
        let ${lowerClassName}:${className} = new ${className}();
        ${parsingFields}
        return ${lowerClassName};
    }`;

    return res;
}

function generateFromJSONarray(className) {
    let lower = className.toLowerCase();
    let res = `
        static from_json_array(${lower}_json_array: any) {
            let ${lower}_array: ${className}[] = [];
            for (const ${lower}Item of ${lower}_json_array) {
                ${lower}_array.push(this.from_json(${lower}Item));
            }
            return ${lower}_array;
        }
    `
    return res;
}

function generateToJSON(fields, className) {
    let lowerClassName = className.toLowerCase();
    let parsingFields = generateParsingFieldsToJSON(fields, className);
    let res = `
    static to_json(${lowerClassName}:${className}) {
        return {
             ${parsingFields}
        };
    }`;

    return res;
}

function generate_clone(fields, className) {
    let lowerClassName = className.toLowerCase();
    let clone_fields = generate_fields_to_clone(fields, className);
    let res = `
    clone():${className} {
        let ${lowerClassName}:${className} = new ${className}();
        ${clone_fields}
        return  ${lowerClassName};
    }`;

    return res;
}

function generate_fields_to_clone(fields, className) {
    let res = "";
    className = className.toLowerCase();
    for (const fieldItem of fields) {
        res += `${className}.${fieldItem} = this.${fieldItem};\n`;
    }
    res = res.trim().substring(0, res.length - 2);
    return res;
}


function generateToJSONarray(className) {
    let lower = className.toLowerCase();
    let res = `
    static to_json_array(${lower}s: ${className}[]) {
        let ${lower}_json_array:any = [];
        for (const ${lower}Item of ${lower}s) {
            ${lower}_json_array.push(this.to_json(${lower}Item));
        }
        return ${lower}_json_array;
    }`

    return res;
}
