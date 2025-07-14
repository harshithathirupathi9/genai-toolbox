// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// helper function to create form inputs for parameters
function createParamInput(param, toolId) {
    const paramItem = document.createElement('div');
    paramItem.className = 'param-item';

    const label = document.createElement('label');
    const inputId = `param-${toolId}-${param.name}`;
    label.setAttribute('for', inputId);

    const nameText = document.createTextNode(param.name);
    label.appendChild(nameText);

    const isAuthParam = param.authServices && param.authServices.length > 0;
    let additionalLabelText = '';
    if (isAuthParam) {
        additionalLabelText += ' (auth)';
    }
    if (!param.required) {
        additionalLabelText += ' (optional)';
    }

    if (additionalLabelText) {
        const additionalSpan = document.createElement('span');
        additionalSpan.textContent = additionalLabelText;
        additionalSpan.classList.add('param-label-extras'); 
        label.appendChild(additionalSpan);
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
    if (isAuthParam) {
        inputElement.disabled = true;
        inputElement.classList.add('auth-param-input'); 
        if (param.type !== 'checkbox') {
            inputElement.placeholder = param.authServices;
        }
    } else if (param.type !== 'checkbox') {
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
    paramsContainer.className = 'tool-params tool-box';
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
