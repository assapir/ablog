'use strict';

function setTextToElement(id, text) {
    const element = document.getElementById(id);
    element.innerHTML = text;
}

module.exports = { setTextToElement };