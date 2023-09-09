let res = "";
let typeScriptActive = true;

/*
Test Case
class Process{
    title: string;
    type: ProcessTypes;
    path: string;
    created_date: string;
}
*/

function generate() {
    let input = document.querySelector("#input").value;
    input = input.replaceAll(/\s+/g, " ");
    if (typeScriptActive) {
        generateTypeScriptCode(input)
    } else {
        generateDartCode(input);
    }


}

function generateTypeScriptCode(input) {
    let rawFields = extractRawFields(input);
    let fields = extractFields(rawFields);
    let className = extractClassName(input);
    // Launch generator
    let toJSON = generateFromJSON(fields, className);
    let toJSONarray = generateFromJSONarray(className);
    let fromJSON = generateToJSON(fields, className);
    let fromJSONarray = generateToJSONarray(className);
    let clone = generate_clone(fields, className);
    let ankh_init = generate_ankh_init_ts();

    res = `
    ${ankh_init}
    ${clone}
    ${toJSON}
    ${toJSONarray}
    ${fromJSON}
    ${fromJSONarray}
    `
    document.querySelector("#result").value = res;

    
}

function generateDartCode(input) {
    if (!validDartClassSchema(input)) {
        alert("Invalid dart class definition");
        return;
    }

    let className = extractClassName_dart(input);
    let fieldString = extractFields_dart(input);
    let fields = parseFieldsStringToFieldObject(fieldString);

    // Launch generator
    let toJSON = generate_from_json_dart(fields, className);
    let toJSONarray = generate_from_json_array_dart(className);
    let fromJSON = generate_to_json_dart(fields, className);
    let fromJSONarray = generate_to_json_array_dart(className);


    let init_state = init_state_var(fields, className);
    let constructor = generate_constructor(fields, className);
    let get_payload = get_payload_dart(fields);
    let clone = generate_clone_dart(className, fields);
    let ankh = generate_ankh_init(fields);

    res = `
    ${constructor}
    ${init_state}
    ${ankh}
    ${get_payload}
    ${clone}
    ${toJSON}
    ${toJSONarray}
    ${fromJSON}
    ${fromJSONarray}
    `
    document.querySelector("#result").value = res;

}



function changeLanguage(language) {
    if (language.innerText == "TypeScript") {
        language.classList.add('active');
        language.nextElementSibling.classList.remove('active');

        changeLanguageToTypeScript();
    } else {

        language.classList.add('active');
        language.previousElementSibling.classList.remove('active');
        changeLanguageToTypeDart();
    }
}

function changeLanguageToTypeScript() {
    typeScriptActive = true;
    document.querySelector("#currentLanguage").innerHTML = "TypeScript";
}
function changeLanguageToTypeDart() {
    typeScriptActive = false;
    document.querySelector("#currentLanguage").innerHTML = "Dart";
}

async function copy() {
    await navigator.clipboard.writeText(res);
    alert("Note copier avec succes");
}


