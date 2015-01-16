define([
    'dojo/_base/declare',
    'agrc/widgets/locate/ZoomToCoords',
    'dojo/text!waterquality/templates/ZoomToCoords.html'

], function (
    declare,
    ZoomToCoords,
    template
    ) {
    return declare('waterquality/ZoomToCoords', [ZoomToCoords], {
        templateString: template
    });
});