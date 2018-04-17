'use strict';

const sinon = require(`sinon`),
    index = require(`../lib/index`);

before(function() {
    this.jsdom = require(`jsdom-global`)();
});

after(function() {
    this.jsdom();
});

describe(`HTML tests`, function() {
    describe(`setTextToElement`, function() {
        it(`Will set the text to the element`, function() {
            const assaf = `Asasf`;
            const mock = sinon.mock(document, `getElementById`);
            const elmentMock = sinon.mock(assaf, `innerHTML` );
            mock.expects(`getElementById`).once().withExactArgs(`Assaf`).returns(elmentMock);
            index.setTextToElement(`Assaf`, `a`);
            mock.verify();
        });
    });
});