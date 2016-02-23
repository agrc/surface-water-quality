require([
    'app/App',

    'dojo/dom-construct'
],

function (
    App,

    domConstruct
) {
    describe('app/App', function () {
        var testWidget;
        beforeEach(function () {
            testWidget = new App({}, domConstruct.create('div', {
                style: {
                    width: '100%',
                    height: '100%'
                }
            }, document.body));
            // testWidget.startup(); // commented out for now to help with IE10
        });
        afterEach(function () {
            testWidget.destroy();
            testWidget = null;
        });

        it('creates a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(App));
        });
    });
});
