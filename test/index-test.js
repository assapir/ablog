'use strict';

process.env.NODE_ENV = `test`;

const sinon = require(`sinon`),
    index = require(`../lib/public/js/index`);

describe(`HTML tests`, function() {
    describe(`setTextToElement`, function() {
        it(`Will set the text to the element`, function() {
            const mock = sinon.mock(document, `getElementById`);
            const elmentMock = sinon.mock(HTMLDivElement, `innerHTML`);
            mock.expects(`getElementById`).once().withExactArgs(`div1`).returns(elmentMock);
            index.setTextToElement(`div1`, `a`);
            mock.verify();
        });
    });
});