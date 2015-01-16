define([
    'dojo/_base/declare',
    'agrc/widgets/locate/MagicZoom',
    'dojo/_base/array',
    'dojo/dom-class',
    'dojo/string',
    'dojo/_base/lang',
    'dojo/on',
    'dojo/dom-construct',
    'dojo/has',

    'dojo/_base/sniff'
], 

function (
    declare,
    MagicZoom,
    array,
    domClass,
    string,
    lang,
    on,
    domConstruct,
    has
    ) {
    return declare("StreamSearch", [MagicZoom],
    {
        // description:
        //      summary

        // countyField: String
        countyField: null,
        
        _populateTable: function (features) {
            // summary:
            //      overridden to add a county cell to the table
            // features: Object[]
            //      The array of features to populate the table with.
            // tags:
            //      private
            console.log(this.declaredClass + "::" + arguments.callee.nom);
            
            // loop through all features
            array.forEach(features, function(feat){
                // insert new empty row
                var row = domConstruct.create('li', {'class': 'match'}, this.msg, 'before');

                // get match value string and bold the matching letters
                var fString = feat.attributes[this.searchField];
                var sliceIndex = this.textBox.value.length;
                var matchDiv = domConstruct.create('div', {'class': 'first-cell'}, row);
                matchDiv.innerHTML = fString.slice(0, sliceIndex) + fString.slice(sliceIndex).bold();
                var cntyDiv = domConstruct.create('div', {'class': 'cnty-cell'}, row);
                cntyDiv.innerHTML = feat.attributes[this.countyField] || '';
                var clearDiv;
                clearDiv = domConstruct.create('div', {style: 'clear: both;'}, row);

                // wire onclick event
                this.own(on(row, "click", lang.hitch(this, this._onRowClick)));
            }, this);
            
            // select first row
            domClass.add(this.matchesList.children[0], 'highlighted-row');

            // show table
            this._toggleTable(true);
        },
        _setMatch: function (row) {
            // summary:
            //      Sets the passed in row as a match in the text box and 
            //      zooms to the feature.
            // row: Object
            //      The row object that you want to set the textbox to.
            // tags:
            //      private
            console.log(this.declaredClass + "::" + arguments.callee.nom);

            // clear any old graphics
            this._graphicsLayer.clear();

            // set textbox to full value
            this.textBox.value = (has('ie') < 9) ? row.children[0].innerText : row.children[0].textContent;

            // clear table
            this._toggleTable(false);

            // clear prompt message
            this.hideMessage();
                        
            // switch to return geometry and build where clause
            this.query.returnGeometry = true;
            this.query.where = this.searchField + " = '" + this.textBox.value + "'";
            if (row.children[1].innerHTML.length > 0) {
                this.query.where = this.query.where + " AND " + this.countyField + " = '" + row.children[1].innerHTML + "'";
            } 
            this.queryTask.execute(this.query, lang.hitch(this, function(featureSet){   
                // set switch to prevent graphic from being cleared
                this._addingGraphic = true;
            
                if (featureSet.features.length === 1 || featureSet.features[0].geometry.type === 'polygon'){
                    this._zoom(featureSet.features[0]);
                } else {
                    this._zoomToMultipleFeatures(featureSet.features);
                }
                        
                // set return geometry back to false
                this.query.returnGeometry = false;
            }));
        },
        _removeDuplicateResults: function (features) {
            // summary:
            //      Overridden to return all features since the data is already unique
            // features: Object[]
            //      The array of features that need to be processed.
            // returns: Object[]
            //      The array after it has been processed.
            // tags:
            //      private
            
            return features;
        },
        _sortArray: function (array) {
            // summary:
            //      Overridden to sort by stream name and then county name
            console.log(this.declaredClass + "::" + arguments.callee.nom);

            // custom sort function
            var that = this;
            function sortFeatures(a, b) {
                var searchField = that.searchField;
                if (a.attributes[searchField] === b.attributes[searchField]) {
                    if (a.attributes[this.countyField] < b.attributes[this.countyField]) {
                        return -1;
                    } else {
                        return 1;
                    }
                } else if (a.attributes[searchField] < b.attributes[searchField]) {
                    return -1;
                } else {
                    return 1;
                }
            }
            
            // sort features
            return array.sort(sortFeatures);
        }
    });
    
});