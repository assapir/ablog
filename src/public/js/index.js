'use strict';

function setTextToElement(id, text) {
    const element = document.getElementById(id);
    if (element)
        element.innerHTML = text;
}

window.onload = () => {
    setTextToElement(`head1`, `Assaf Sapir`);
};

if (typeof module !== `undefined` && module.exports)
    module.exports = { setTextToElement };