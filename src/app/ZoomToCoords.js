define([
    'agrc/widgets/locate/ZoomToCoords',

    'dojo/text!app/templates/ZoomToCoords.html',
    'dojo/_base/declare'
], function (
    ZoomToCoords,

    template,
    declare
) {
    return declare([ZoomToCoords], {
        templateString: template
    });
});
