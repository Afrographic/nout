class Field {
    constructor(type, label) {
        this.type = type;
        this.label = label;
    }
}

function validDartClassSchema(dartClassSchema) {
    dartClassSchema = dartClassSchema.trim();
    return /^(class|Class)\s+[a-zA-Z_]+\s*{\s+((int|double|bool|String)\??\s+[a-zA-Z_0-9]+;\s*)+\s*}\s*/.test(dartClassSchema);
}


function extractClassName_dart(dartClassSchema) {
    let re = /(class|Class)\s+([a-zA-Z_]+).*/;
    let m = re.exec(dartClassSchema);
    return capitalizeFirstLetter(m[2]);
}

function extractFields_dart(dartClassSchema) {
    dartClassSchema = addCloseAccoladeifWasNotGiven(dartClassSchema);
    dartClassSchema = dartClassSchema.replaceAll(/\s+/g, " ");
    let re = /^(class|Class)\s+[a-zA-Z_]+\s*{(.*)}\s*/;
    let m = re.exec(dartClassSchema.trim());
    return m[2];
}


function addCloseAccoladeifWasNotGiven(schema) {
    if (schema.includes("}")) {
        return schema;
    }
    schema += '}';
    return schema;
}


function parseFieldsStringToFieldObject(fieldString) {
    let fieldsObjectsArray = [];
    fieldString = fieldString.replaceAll(/\s+/g, " ");
    fieldString = fieldString.split(";");
    fieldString.pop();

    fieldString.forEach(element => {
        fieldsObjectsArray.push(convertToFieldObject(element))
    });

    return fieldsObjectsArray;
}

function convertToFieldObject(fieldStringItem) {
    fieldStringItem = fieldStringItem.trim().split(" ");
    return new Field(fieldStringItem[0], fieldStringItem[1]);
}


// Code generator functions

function generate_from_json_dart(fields, className) {
    let lowerClassName = className.toLowerCase();
    let parsingFields = generateParsingFields_dart(fields, lowerClassName);
    let res = `
    static ${className} from_json(${lowerClassName}JSON) {
        return ${className}(
            ${parsingFields}
        );
    }`;

    return res;
}

function generateParsingFields_dart(fields, lowerClassName) {
    let res = "";
    for (const fieldItem of fields) {
        res += `${fieldItem.label} : ${lowerClassName}JSON["${fieldItem.label}"],\n`;
    }
    return res;
}

function generate_from_json_array_dart(className) {
    let lower = className.toLowerCase();
    let res = `
        static List<${className}> from_json_array(${lower}_json_array) {
            List<${className}> ${lower}_array = [];
            for (var ${lower}Item in ${lower}_json_array) {
                ${lower}_array.add(from_json(${lower}Item));
            }
            return ${lower}_array;
        }
    `
    return res;
}

function generate_to_json_dart(fields, className) {
    let lowerClassName = className.toLowerCase();
    let parsingFields = generateParsingFieldsto_json_dart(fields, lowerClassName);
    let res = `
    static dynamic to_json(${className} ${lowerClassName}) {
        Map<String,dynamic> data = {};
        data.addAll({
            ${parsingFields}
        });
        return data;
    }`;

    return res;
}

function generateParsingFieldsto_json_dart(fields, lowerClassName) {
    let res = "";
    for (const fieldItem of fields) {
        res += `"${fieldItem.label}" : ${lowerClassName}.${fieldItem.label},\n`;
    }
    return res;
}


function generate_to_json_array_dart(className) {
    let lower = className.toLowerCase();
    let res = `
    static dynamic to_json_array(List<${className}> ${lower}_array) {
        List<Map<String, dynamic>> ${lower}_json_array = [];
        for (${className} ${lower} in ${lower}_array) {
            ${lower}_json_array.add(to_json(${lower}));
        }
        return ${lower}_json_array;
    }`

    return res;
}


function get_field_init_val(field_item_type) {
    if (field_item_type == "int" || field_item_type == "double") {
        return 0;
    }

    if (field_item_type == "bool") {
        return false;
    }
    return `""`;
}

function init_state_fields(fields) {
    let res = "";
    for (const fieldItem of fields) {
        let init_val = get_field_init_val(fieldItem.type);
        res += `${fieldItem.label} : ${init_val},\n`;
    }
    return res;
}



function init_state_var(fields, className) {

    var init_state_fields = "";

    for (const fieldItem of fields) {
        let init_val = get_field_init_val(fieldItem.type);
        init_state_fields += `${fieldItem.label} : ${init_val},\n`;
    }

    let res = `
    static ${className} init = new ${className} (
        ${init_state_fields}
    );`;
    return res;
}


function generate_constructor(fields, class_name) {
    var c_item = "";

    for (const fieldItem of fields) {
        c_item += `required this.${fieldItem.label},\n`;
    }
    let res = `
     ${class_name}({
        ${c_item}
     });`;
    return res;
}


function get_payload_dart(fields) {
    var c_item = "";

    for (const fieldItem of fields) {
        c_item += `"${fieldItem.label}":"$${fieldItem.label}",\n`;
    }
    let res = `
    get_payload(){
        return {
            ${c_item}
        };
     }
     `;
    return res;
}

function generate_clone_dart(class_name, fields) {
    let lower = class_name.toLowerCase();
    var c_item = "";

    for (const fieldItem of fields) {
        c_item += `${fieldItem.label}:this.${fieldItem.label},\n`;
    }

    let res = `
     ${class_name} clone(){
        ${class_name}  ${lower} = ${class_name}(
        ${c_item}
        );
        return ${lower};
    }`;

    return res;
}

function generate_ankh_init(fields) {
    var c_item = "";

    for (const fieldItem of fields) {
        c_item += `${fieldItem.type} ${fieldItem.label};\n`;
    }
    let res = `
    static String ankh_init = """
    ${c_item}
    """;
    `
    return res;
}