// helper function to create form inputs for parameters
function createParamInput(param, toolId) {
    const paramItem = document.createElement('div');
    paramItem.className = 'param-item';

    const label = document.createElement('label');
    const inputId = `param-${toolId}-${param.name}`;
    label.setAttribute('for', inputId);

    const nameText = document.createTextNode(param.name);
    label.appendChild(nameText);
    if (!param.required) {
        const optionalSpan = document.createElement('span');
        optionalSpan.textContent = ' (optional)';
        optionalSpan.classList.add('optional-label'); 
        label.appendChild(optionalSpan);
    }
    paramItem.appendChild(label);

    let placeholderText = param.label;
    let inputElement;
    if (param.type === 'textarea') { 
        inputElement = document.createElement('textarea');
        inputElement.rows = 3;
    } else if(param.type === 'checkbox') {
        inputElement = document.createElement('input');
        inputElement.type = 'checkbox';
        inputElement.title = placeholderText;
    } else {
        inputElement = document.createElement('input');
        inputElement.type = param.type;
    }
    
    inputElement.id = inputId;
    inputElement.name = param.name;
    if (param.type !== 'checkbox') {
        inputElement.placeholder = placeholderText.trim();
    }
    paramItem.appendChild(inputElement);
    return paramItem;
}

// renders the tool display area
export function renderToolInterface(tool, containerElement) {
    containerElement.innerHTML = '';
    const toolId = tool.id;

    const gridContainer = document.createElement('div');
    gridContainer.className = 'tool-details-grid';

    const toolInfoContainer = document.createElement('div');
    toolInfoContainer.className = 'tool-info';

    const nameBox = document.createElement('div');
    nameBox.className = 'tool-box tool-name';
    nameBox.innerHTML = `<h5>Name:</h5><p>${tool.name}</p>`;
    toolInfoContainer.appendChild(nameBox);

    const descBox = document.createElement('div');
    descBox.className = 'tool-box tool-description';
    descBox.innerHTML = `<h5>Description:</h5><p>${tool.description}</p>`;
    toolInfoContainer.appendChild(descBox);

    gridContainer.appendChild(toolInfoContainer);

    const paramsContainer = document.createElement('div');
    paramsContainer.className = 'tool-params';
    paramsContainer.innerHTML = '<h5>Parameters:</h5>';
    const form = document.createElement('form');
    form.id = `tool-params-form-${toolId}`;

    tool.parameters.forEach(param => {
        form.appendChild(createParamInput(param, toolId));
    });
    paramsContainer.appendChild(form);

    gridContainer.appendChild(paramsContainer);
    containerElement.appendChild(gridContainer);

    const responseContainer = document.createElement('div');
    responseContainer.className = 'tool-response tool-box';

    const responseHeader = document.createElement('h5');
    responseHeader.textContent = 'Response:';
    responseContainer.appendChild(responseHeader);

    const responseAreaId = `tool-response-area-${toolId}`;
    const responseArea = document.createElement('textarea');
    responseArea.id = responseAreaId;
    responseArea.readOnly = true;
    responseArea.placeholder = 'Results will appear here...';
    responseArea.rows = 10;
    responseContainer.appendChild(responseArea);

    containerElement.appendChild(responseContainer);
}
