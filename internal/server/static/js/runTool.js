// function to run the tool (calls API version of endpoint)
export async function handleRunTool(toolId, form, responseArea, parameters, prettifyCheckbox, updateLastResults) {
    responseArea.value = 'Running tool...';
    updateLastResults(null); 
    const formData = new FormData(form);
    const typedParams = {};

    for (const param of parameters) {
        const rawValue = formData.get(param.name);

        if (rawValue === null || rawValue === undefined || rawValue === '') {
            if (param.required) {
                 console.warn(`Required parameter ${param.name} is missing.`);
            }
            continue;
        }

        const valueType = param.valueType;

        try {
            if (valueType && valueType.startsWith('array<')) {
                const elementType = valueType.substring(6, valueType.length - 1);
                let parsedArray;
                try {
                    parsedArray = JSON.parse(rawValue);
                } catch (e) {
                    throw new Error(`Invalid JSON format for ${param.name}. ${e.message}`);
                }

                if (!Array.isArray(parsedArray)) {
                    throw new Error(`Input for ${param.name} must be a JSON array (e.g., ["a", "b"]).`);
                }

                if (elementType === 'number') {
                    typedParams[param.name] = parsedArray.map((item, index) => {
                        const num = Number(item);
                        if (isNaN(num)) {
                            throw new Error(`Invalid number "${item}" found in array for ${param.name} at index ${index}.`);
                        }
                        return num;
                    });
                } else if (elementType === 'boolean') {
                    typedParams[param.name] = parsedArray.map(item => item === true || String(item).toLowerCase() === 'true');
                } else { 
                    typedParams[param.name] = parsedArray;
                }
            } else {
                switch (valueType) {
                    case 'number':
                        const num = Number(rawValue);
                        if (isNaN(num)) {
                            throw new Error(`Invalid number input for ${param.name}: ${rawValue}`);
                        }
                        typedParams[param.name] = num;
                        break;
                    case 'boolean':
                        typedParams[param.name] = rawValue === 'true';
                        break;
                    case 'string':
                    default:
                        typedParams[param.name] = rawValue;
                        break;
                }
            }
        } catch (error) {
            console.error('Error processing parameter:', param.name, error);
            responseArea.value = `Error for ${param.name}: ${error.message}`;
            return; // Stop processing
        }
    }

    console.log('Running tool:', toolId, 'with typed params:', typedParams);
    try {
        const response = await fetch(`/api/tool/${toolId}/invoke`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(typedParams)
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HTTP error ${response.status}: ${errorBody}`);
        }
        const results = await response.json();
        updateLastResults(results); 
        displayResults(results, responseArea, prettifyCheckbox.checked); 
    } catch (error) {
        console.error('Error running tool:', error);
        responseArea.value = `Error: ${error.message}`;
        updateLastResults(null); 
    }
}

export function displayResults(results, responseArea, prettify) {
    if (results === null || results === undefined) {
        return;
    }
    try {
        const resultJson = JSON.parse(results.result);
        if (prettify) {
            responseArea.value = JSON.stringify(resultJson, null, 2);
        } else {
            responseArea.value = JSON.stringify(resultJson);
        }
    } catch (error) {
        console.error("Error parsing or stringifying results:", error);
        if (typeof results.result === 'string') {
            responseArea.value = results.result;
        } else {
            responseArea.value = "Error displaying results. Invalid format.";
        }
    }
}
