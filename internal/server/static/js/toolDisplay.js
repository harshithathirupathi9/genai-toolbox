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

import { handleRunTool, displayResults } from './runTool.js';

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

// Function to create the header editor modal
function createHeaderEditorModal(toolId, currentHeaders, saveCallback) {
    const modalId = `header-modal-${toolId}`;
    let modal = document.getElementById(modalId);

    if (modal) {
        modal.remove(); // Remove existing modal to rebuild
    }

    modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'header-modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'header-modal-content';

    const modalHeader = document.createElement('h5');
    modalHeader.textContent = 'Edit Request Headers';
    modalContent.appendChild(modalHeader);

    const headersTextarea = document.createElement('textarea');
    headersTextarea.id = `headers-textarea-${toolId}`;
    headersTextarea.className = 'headers-textarea';
    headersTextarea.rows = 10;
    headersTextarea.value = JSON.stringify(currentHeaders, null, 2);
    modalContent.appendChild(headersTextarea);

    const modalActions = document.createElement('div');
    modalActions.className = 'header-modal-actions';

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.className = 'close-headers-btn';
    closeButton.addEventListener('click', () => closeHeaderEditor(toolId));
    modalActions.appendChild(closeButton);

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.className = 'save-headers-btn';
    saveButton.addEventListener('click', () => {
        try {
            const updatedHeaders = JSON.parse(headersTextarea.value);
            saveCallback(updatedHeaders);
            closeHeaderEditor(toolId);
        } catch (e) {
            alert('Invalid JSON format for headers.');
            console.error("Header JSON parse error:", e);
        }
    });
    modalActions.appendChild(saveButton);

    modalContent.appendChild(modalActions);
    modal.appendChild(modalContent);

    // Close modal if clicked outside
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeHeaderEditor(toolId);
        }
    });

    return modal;
}

function openHeaderEditor(toolId) {
    const modal = document.getElementById(`header-modal-${toolId}`);
    if (modal) {
        const textarea = modal.querySelector('.headers-textarea');
        // Optional: refresh content if needed, though usually set on creation
        modal.style.display = 'block';
    }
}

function closeHeaderEditor(toolId) {
    const modal = document.getElementById(`header-modal-${toolId}`);
    if (modal) {
        modal.style.display = 'none';
    }
}

// renders the tool display area
export function renderToolInterface(tool, containerElement) {
    containerElement.innerHTML = '';
    const toolId = tool.id;

    let lastResults = null;
    let currentHeaders = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    };

    // function to update lastResults so we can toggle json
    const updateLastResults = (newResults) => {
        lastResults = newResults;
    };

    const updateCurrentHeaders = (newHeaders) => {
        currentHeaders = newHeaders;
        // Recreate modal with updated headers to reflect change if reopened
        const newModal = createHeaderEditorModal(toolId, currentHeaders, updateCurrentHeaders);
        containerElement.appendChild(newModal);
    };

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

    // Container for the run button
    const runButtonContainer = document.createElement('div');
    runButtonContainer.className = 'run-button-container';

    const editHeadersButton = document.createElement('button');
    editHeadersButton.className = 'edit-headers-btn';
    editHeadersButton.textContent = 'Edit Headers';
    editHeadersButton.addEventListener('click', () => openHeaderEditor(toolId));
    runButtonContainer.appendChild(editHeadersButton);

    const runButton = document.createElement('button');
    runButton.className = 'run-tool-btn';
    runButton.textContent = 'Run Tool';
    runButtonContainer.appendChild(runButton);
    containerElement.appendChild(runButtonContainer);

    // Response Area (bottom)
    const responseContainer = document.createElement('div');
    responseContainer.className = 'tool-response tool-box';

    const responseHeaderControls = document.createElement('div');
    responseHeaderControls.className = 'response-header-controls';

    const responseHeader = document.createElement('h5');
    responseHeader.textContent = 'Response:';
    responseHeaderControls.appendChild(responseHeader);

    // prettify box
    const prettifyId = `prettify-${toolId}`;
    const prettifyDiv = document.createElement('div');
    prettifyDiv.className = 'prettify-container';

    const prettifyLabel = document.createElement('label');
    prettifyLabel.setAttribute('for', prettifyId);
    prettifyLabel.textContent = 'Prettify JSON';
    prettifyLabel.className = 'prettify-label';

    const prettifyCheckbox = document.createElement('input');
    prettifyCheckbox.type = 'checkbox';
    prettifyCheckbox.id = prettifyId;
    prettifyCheckbox.checked = true;
    prettifyCheckbox.className = 'prettify-checkbox';

    prettifyDiv.appendChild(prettifyLabel);
    prettifyDiv.appendChild(prettifyCheckbox);
    responseHeaderControls.appendChild(prettifyDiv);

    responseContainer.appendChild(responseHeaderControls);

    const responseAreaId = `tool-response-area-${toolId}`;
    const responseArea = document.createElement('textarea');
    responseArea.id = responseAreaId;
    responseArea.readOnly = true;
    responseArea.placeholder = 'Results will appear here...';
    responseArea.className = 'tool-response-area';
    responseArea.rows = 10;
    responseContainer.appendChild(responseArea);

    containerElement.appendChild(responseContainer);

    // Create and append the header editor modal
    const headerModal = createHeaderEditorModal(toolId, currentHeaders, updateCurrentHeaders);
    containerElement.appendChild(headerModal);

    prettifyCheckbox.addEventListener('change', () => {
        if (lastResults) {
            displayResults(lastResults, responseArea, prettifyCheckbox.checked);
        }
    });

    runButton.addEventListener('click', (event) => {
        event.preventDefault();
        // Pass currentHeaders to handleRunTool
        handleRunTool(toolId, form, responseArea, tool.parameters, prettifyCheckbox, updateLastResults, currentHeaders);
    });
}
