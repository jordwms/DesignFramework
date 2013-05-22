
// web map interface
var findParams, findTask;
var mapClickEventHandle; // Id for the current map click event handler.
var navToolbar;
var activeToolId = 'pan'; // Id of the active map tool.
var toolbar, geometryService; //for drawing toolbar for distance measurement



      function execute(searchText) {
        //set the search text to find parameters
        findParams.layerIds = inspMapLayer.visibleLayers;
        findParams.searchText = searchText;
        findTask.execute(findParams, showResults);
      }

      function showResults(results) {

        //find results return an array of findResult.
   /**     map.graphics.clear();
        var dataForGrid = [];
        //Build an array of attribute information and add each found graphic to the map
        dojo.forEach(results, function(result) {
          var graphic = result.feature;
         // <a href='#' onmouseover='hilightFeature(" + idResults[i].feature.attributes['OBJECTID'] + ")' onmouseout='dehilightFeature(" + idResults[i].feature.attributes['OBJECTID'] + ")' //onClick='zoomToFeature(" + idResults[i].feature.attributes['OBJECTID'] + ")'; return false;'>(show)</a>
          dataForGrid.push([result.layerName, result.foundFieldName, result.value, graphic.attributes['OBJECTID']]);
          switch (graphic.geometry.type) {
          case "point":
            graphic.setSymbol(identifyPointSymbol);
            break;
          case "polyline":
            graphic.setSymbol(identifyLineSymbol);
            break;
          case "polygon":
            graphic.setSymbol(identifyPolygonSymbol);
            break;
          }
          map.graphics.add(graphic);
        });
        var data = {
          items: dataForGrid
        };
        var store = new dojo.data.ItemFileReadStore({
          data: data
        });
        grid.setStore(store);
*/
      }

      //highlight the selected feature
      function hilightFeature(id) {
        dojo.some(map.graphics.graphics,function(graphic){
          if (graphic.attributes.OBJECTID.toString() === id.toString()) {
            if (graphic.geometry.type == 'point') {
              graphic.setSymbol(identifyPointOutline);
            } else if (graphic.geometry.type == 'polyline') {
              graphic.setSymbol(identifyLineOutline);
            } else if (graphic.geometry.type == 'polygon') {
              graphic.setSymbol(hilightPolygonSymbol);
            }
          }
        });
      }
      function dehilightFeature(id) {
        dojo.some(map.graphics.graphics,function(graphic){
          if (graphic.attributes.OBJECTID.toString() === id.toString()) {
            if (graphic.geometry.type == 'point') {
              graphic.setSymbol(identifyPointSymbol);
            } else if (graphic.geometry.type == 'polyline') {
              graphic.setSymbol(identifyLineSymbol);
            } else if (graphic.geometry.type == 'polygon') {
              graphic.setSymbol(identifyPolygonSymbol);
            }
          }
        });
      }

      //zooms to graphics on the map, maybe rewrite to use actuall feature geometries?
      function zoomToFeature(id) {
        //need to get extent of queried graphic
        dojo.some(map.graphics.graphics,function(graphic){
          if (graphic.attributes.OBJECTID.toString() === id.toString()) {
            var extent = map.extent;

            if (graphic.geometry.type == 'point') {
              //convert a point into an extent.
                var pointExtent = new esri.geometry.Extent((graphic.geometry.x - pointZoomFactor),(graphic.geometry.y - pointZoomFactor),(graphic.geometry.x + pointZoomFactor),(graphic.geometry.y + pointZoomFactor),extent.spatialReference);
              map.setExtent(pointExtent);
              return true;
            } else {
              var featureExtent = graphic.geometry.getExtent().expand(1.75);
              map.setExtent(featureExtent);
              return true;
            }

          }
        });
      }

      // Disconnects any map click event handler set when the current tool was
      // set to one of the select or identify tools.
      function deactivateSelectTool(){
        if (mapClickEventHandle != ''){
          dojo.disconnect(mapClickEventHandle);
          mapClickEventHandle = '';
        }
      }

      // Activate the map tool based on the buttonID
      function activateTool(buttonID){
        
        // Highlight the button so the user knows what is active
        // First, turn off all elements that have 'activeToolbutton' as a class
        var nodeList = dojo.query(".activeToolButton");
        nodeList.toggleClass("activeToolButton");

        //deactivate drawing tool for measurement
        //toolbar.deactivate();
        map.infoWindow.hide();

        var setBtnClass = false;
        leakAdd = false; //to keep track if we are adding a new leak point or editing

        //activate tools based on which button was selected
        switch(buttonID){
          case 'identify':
              //navToolbar.deactivate();
              map.setMapCursor('crosshair');
              if (activeToolId != buttonID) {
                //Listen for click event on the map, when the user clicks on the map call doIdentify function.
                deactivateSelectTool();
                
                //clear graphics and identify table
                map.graphics.clear();
                document.getElementById("display_toc").style.display = "none";
                document.getElementById("display_list").innerHTML="";
  

                //select identify window
                //dijit.byId("identifyBtn").selected = true;
                //dijit.byId("legendBtn").selected = false;
                
                mapClickEventHandle = dojo.connect(map, "onClick", doIdentify);
              }
              break;
          case 'measure':
              //navToolbar.deactivate();
              map.setMapCursor('crosshair');
              if (activeToolId != buttonID) {
                //Listen for click event on the map, when the user clicks on the map call doIdentify function.
                deactivateSelectTool();
                
                //clear graphics and identify table
                map.graphics.clear();
                document.getElementById("display_toc").style.display = "none";
                document.getElementById("display_list").innerHTML="";

                 //make sure accordion container has the measure pane open
                //dijit.byId("accordion-container").selectChild(dijit.byId("identify-pane"));

                //active drawing tool
                toolbar.activate(esri.toolbars.Draw.POLYLINE);
              }
              break;
          case 'pan':
              // Activating a map navigation tool.
              setBtnClass = true
              if (setBtnClass == true){
                map.setMapCursor('pointer');
                deactivateSelectTool();
              }
              break;
          case 'leakAdd':

              //navToolbar.deactivate();
              map.setMapCursor('crosshair');

              leakAdd = true;
              
              deactivateSelectTool();
              map.graphics.clear();
              document.getElementById("display_toc").style.display = "none";
              document.getElementById("display_list").innerHTML="";
              //dijit.byId("leakEditFields").setContent("");

              mapClickEventHandle = dojo.connect(map, "onClick", addLeak);
              break;
          case 'clear':
              //clear graphics and results
              map.graphics.clear();
              document.getElementById("display_toc").style.display = "inline";
              document.getElementById("display_list").innerHTML="";

              //clear feature selection
              leakLayer.clearSelection();

              //clear datagrid results
              //var newStore = new dojo.data.ItemFileReadStore({data: {  identifier: "",  items: []}});
              //grid.setStore(newStore);
              //dijit.byId("searchText").set("value", "");
              break;
      }

        //set the active tool
        activeToolId = buttonID;

        if (setBtnClass){
          // Change the button to be active
          var activeBtn = dojo.byId(buttonID);
          if (activeBtn != null) {
            dojo.toggleClass(buttonID, "activeToolButton");
            resizeMap();
          }
        }

      }


      //Create the identify data for layers 
      function doIdentify(evt) {
        map.graphics.clear();
        
        //add push-pin graphic to where user clicks
        var pushpin = new esri.Graphic(evt.mapPoint, pushpinSymbol);
        map.graphics.add(pushpin);

        //set up identify parameters and then add graphics to the identified features to the map
        identifyParams.geometry = evt.mapPoint;
        identifyParams.mapExtent = map.extent;
        identifyParams.layerIds = inspMapLayer.visibleLayers;
        identifyParams.tolerance = 5;
        identifyTask.execute(identifyParams, dojo.hitch(this, function(inspResults){
          addToMap(inspResults);
        })); 
      }


    // Handles the identify map click query results and adds identify list of features in the left pane
    function addToMap(idResults) {

        map.graphics.clear();

        //determine which layers are visible
        var visLayers = inspMapLayer.visibleLayers;
        var visLyrCount = 0;

        var content = "";
        content = "<i>Total features returned: " + idResults.length + "</i>";
        content += "<table border='1'><tr></tr>";

        for (var i=0, il=idResults.length; i<il; i++) {
          //only show visible layer info
          var lyrId = idResults[i].layerId;
          if(visLayers.indexOf(lyrId) != -1){

            var graphic = idResults[i].feature;

            //set graphics
            if (idResults[i].feature.geometry.type == 'point') {
              graphic.setSymbol(identifyPointSymbol);
              map.graphics.add(graphic);
            } else if (idResults[i].feature.geometry.type == 'polyline') {
              graphic.setSymbol(identifyLineSymbol);
              map.graphics.add(graphic);
              // should request the length of each polyline in projected units.....
            } else if (idResults[i].feature.geometry.type == 'polygon') {
              graphic.setSymbol(identifyPolygonSymbol);
              map.graphics.add(graphic);
              // should request the length of each polyline in projected units.....
            }

            content+="<tr><td><b>" + idResults[i].layerName + ": </b><a href='#' onmouseover='hilightFeature(" + idResults[i].feature.attributes['OBJECTID'] + ")' onmouseout='dehilightFeature(" + idResults[i].feature.attributes['OBJECTID'] + ")' onClick='zoomToFeature(" + idResults[i].feature.attributes['OBJECTID'] + ")'; return false;'>(show)</a></td></tr>";

            //if leak layer add leak edit option
            if (idResults[i].layerName == "Leak"){
              content+="<tr><td><a href='#' onClick='editLeak(" + idResults[i].feature.attributes['OBJECTID'] + ")'; return false;'>Edit Leak</a></td></tr>";
            }

              var key;
              //grab the key/value pair for each attribute and add to the table
              for(key in idResults[i].feature.attributes){
                    content+="<tr><td><b>" + key + ": </b>"+ idResults[i].feature.attributes[key] +"</td></tr>";
              }
              content+="<tr><td>&nbsp</td></tr>";
              visLyrCount++;
          }
        }
  
        content+="</table>";

        //set the content in the identify table to the above
        document.getElementById("display_list").innerHTML=content;
    }

      //Add Leak Layer Features
      function addLeak(evt){
       var markerSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 8, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color("red"), 4));
        var graphic;
          // Add a graphic at the clicked location
          if (graphic) {
            graphic.setGeometry(evt.mapPoint);
          }
          else {
            graphic = new esri.Graphic(evt.mapPoint, markerSymbol);
            map.graphics.add(graphic);
          }


          //add new graphic to the leak layer
          leakLayer.applyEdits([graphic],null,null);
          inspMapLayer.refresh();

         /*---------*/ 
        //for selection leaks from the leak layer
         var selectQuery = new esri.tasks.Query();
         selectQuery.geometry = evt.mapPoint;
         //leakLayer.clearSelection();
            leakLayer.selectFeatures(selectQuery, esri.layers.FeatureLayer.SELECTION_NEW, function(features) {


              if (features.length > 0) {
                 //store the current feature
                  updateFeature = features[0];
                  //showLeakUpdate();
                } 
            });   

      }

      //edit leak Feature
      function editLeak(leakObjID){

          var selectQuery = new esri.tasks.Query();
          selectQuery.where = "OBJECTID = " + leakObjID;
         //leakLayer.clearSelection();
          leakLayer.selectFeatures(selectQuery, esri.layers.FeatureLayer.SELECTION_NEW);

      }


      //show leak add/edit information for selected Leak
      function showLeakUpdate() {

        var content = "";
        var content = document.createElement('b');
        content.appendChild(document.createTextNode('Leak Features'));

        // collected by
        content.appendChild(document.createElement('br'));
        content.appendChild(document.createTextNode('Collected By: '));
        var colBy = document.createElement("input");
        colBy.type = "text";
        colBy.id = "collectedBy";
        //colBy.className = ;
        colBy.value = updateFeature.attributes['CollectedBy'];
        content.appendChild(colBy);

        // collection date
        //content.appendChild(document.createElement('br'));
        //content.appendChild(document.createTextNode('Collection Date: '));
        //var colDate = document.createElement("input");
        //colDate.type = "date";
        //colDate.id = "collectionDate";
        //colDate.value = updateFeature.attributes['CollectionDate'];
        //content.appendChild(colDate);

        //length of bad pipe
        content.appendChild(document.createElement('br'));
        content.appendChild(document.createTextNode('Length of Bad Pipe: '));
        var badPipe = document.createElement("input");
        badPipe.type = "number";
        badPipe.id = "lengthofBadPipe";
        badPipe.value = updateFeature.attributes['LengthofBadPipe'];
        content.appendChild(badPipe);

        //notes
        content.appendChild(document.createElement('br'));
        content.appendChild(document.createTextNode('Notes: '));
        var notes = document.createElement("input");
        notes.type = "text";
        notes.id = "notes";
        notes.value = updateFeature.attributes['Notes'];
        content.appendChild(notes);

        //line segment guid
        content.appendChild(document.createElement('br'));
        content.appendChild(document.createTextNode('Line Segment GUID: '));
        var lineSgmtGuid = document.createElement("select"),option,i=0,il=closestLines.length;
        lineSgmtGuid.type = "text";
        lineSgmtGuid.id = "closestLineSgmt";

        var option;
        for(var i=0; i<il; i+=1){
          option = document.createElement('option');
          option.value = closestLines[i]["value"];
          option.appendChild(document.createTextNode(closestLines[i]["label"]));
          if (closestLines[i]["value"] == updateFeature.attributes['SegmentGUID']){
            //if editing existing leaks, select the one from the database
            option.selected = true;
          }
          lineSgmtGuid.appendChild(option);
        }
        content.appendChild(lineSgmtGuid);

        //save leak edits
        content.appendChild(document.createElement('br'));
        var saveBtn = document.createElement("input");
        saveBtn.type = "submit";
        saveBtn.value = "Save";
        saveBtn.onclick = function(){saveLeakEdits();}
        content.appendChild(saveBtn);

        //delete leak points
        var deleteBtn = document.createElement("input");
        deleteBtn.type = "submit";
        deleteBtn.value = "Delete";
        deleteBtn.onclick = function(){deleteLeak();}
        content.appendChild(deleteBtn);


        //set the content in the identify table to the above
        document.getElementById("display_list").innerHTML = "";
        document.getElementById("display_list").appendChild(content);
        //dijit.byId("leakEditFields").setContent(content);


      }

      //save leak edits and new leak points
      function saveLeakEdits(){

        //set up attribute json to push to server
        var attrUpdates =   {
            "geometry" : updateFeature.geometry,  
            "attributes" : {
              "OBJECTID" : updateFeature.attributes['OBJECTID'],
              "CollectedBy" : document.getElementById('collectedBy').value,
              "CollectionDate" : new Date().getTime(),  //current date epoch
              "EditDate" : new Date().getTime(),
              "LengthofBadPipe" : document.getElementById('lengthofBadPipe').value,
              "Notes" : document.getElementById('notes').value,
              "SegmentGUID" : document.getElementById('closestLineSgmt').value
            }
        }

        //apply attribute edits to leak layer
        leakLayer.applyEdits(null,[attrUpdates],null);

        //clear selected features and refresh inspection map layer
        leakLayer.clearSelection();
        map.graphics.clear();
        
        leakLayer.refresh();
        inspMapLayer.refresh();

        document.getElementById("display_list").innerHTML="Leak Point Saved!";
        //dijit.byId("leakEditFields").setContent("Leak Point Saved!");

      }

      //delete leak point
      function deleteLeak(){

          //delete selected leak point
          leakLayer.applyEdits(null,null,[updateFeature]);
          document.getElementById("display_list").innerHTML="";
          //dijit.byId("leakEditFields").setContent("");

          //clear selected features and refresh inspection map layer
          leakLayer.clearSelection();
          map.graphics.clear();

          leakLayer.refresh();
          inspMapLayer.refresh();

      }

      var resizeTimer;
      function resizeMap() {
            //resize the map when the browser resizes - view the 'Resizing and repositioning the map' section in 
            //the following help topic for more details http://help.esri.com/EN/webapi/javascript/arcgis/help/jshelp_start.htm#jshelp/inside_faq.htm
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
              map.resize();
              map.reposition();
            }, 500);
      }

  