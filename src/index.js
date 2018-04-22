'use strict';

function setTextToElement(id, text) {
    const element = document.getElementById(id);
    element.innerHTML = text;
}

window.onload = () => {
    if (process.env.NODE_ENV !== `test`)
        setTextToElement(`head1`, `Assaf Sapir`);
};

module.exports = { setTextToElement };