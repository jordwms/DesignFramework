
      var map, inspMapLayer;
      var geometryService;
      var visible = [];
      var identifyTask, identifyParams, pushpinSymbol;  //identify features on the map
      var identifyLineSymbol, hilightLineSymbol, identifyLineOutline; //identify symbols
      var identifyPolygonSymbol, hilightPolygonSymbol;
      var identifyPointOutline, identifyPointSymbol, hilightPointSymbol;

      var leakLayer, updateFeature, leakAdd;  //Feature layer for editing pipe leaks
      var querySgmt, queryTask, sgmtDijit;
      var closestLines = new Array();  //closest line segments to leak point
      var querySgmtTask, querySgmtParams, lineSgmtGraphic;  //find task for closest line segments when editing leaks & current selected graphic

      var lineSgmtLayer, ctrlPtParams;  //feature layer for editing line segments

      function init() {
         
          $(window).resize(function(){
              if( $(window).width() > 1024 ){
                  $('[class*="container"]').show();
              }
          });

          //hide the loading box once we're loaded
          $('.loading_box').addClass('hidden');

          //just an example of "flipping" between containers
          $('.actions .btn#show_action_container').click(function(){
              $('.map_container').hide();
              $('.action_container').show();
          });
          $('.actions .btn#show_map_container').click(function(){
              $('.map_container').show();
              $('.action_container').hide();
          });

          initMap();
      }

      function initMap() {

       //for measuring distances and buffer for line segments when adding new leak points
        geometryService = new esri.tasks.GeometryService(geomtryServiceUrl);

        var mapExtent = new esri.geometry.Extent({"xmin":-11718570.361025885, "ymin":4827093.882492928, "xmax":-11709971.195343815, "ymax":4832826.659614308, "spatialReference":{wkid:102100}});
        
        //map = new esri.Map("map",{
        //  extent:mapExtent});
        map = new esri.Map("map",{
            //basemap:"topo",
            extent: mapExtent,
            isScrollZoom: true,
            //center:[-105.27,40.015], //long, lat
            //zoom:13,
            sliderStyle:"small"
          });

        var backgroundLayer = new esri.layers.ArcGISDynamicMapServiceLayer(imageryService);
        map.addLayer(backgroundLayer);

        inspMapLayer = new esri.layers.ArcGISDynamicMapServiceLayer(inspDataUrl, {
          id: "inspData"
        });

        // inorder to refresh leak layer after updates
        inspMapLayer.setDisableClientCaching(true);

        //leak Feature Layer
        leakLayer = new esri.layers.FeatureLayer(leakLayerUrl, {
          mode: esri.layers.FeatureLayer.MODE_SELECTION, //MODE_ONDEMAND,
          outFields: ["*"] //["CollectedBy","CollectionDate","LengthofBadPipe","Notes","SegmentGUID", "LineGroupName"],
          //infoTemplate: attInspector
        });

        //line segment Feature Layer
        lineSgmtLayer = new esri.layers.FeatureLayer(lineSgmtFeatLyrUrl, {
          mode: esri.layers.FeatureLayer.MODE_SELECTION,
          outFields: ["*"]
        });

        // When Layers are Added to the map
        dojo.connect(map, 'onLayersAddResult', function(results) {

              //Legend
                var toc = new agsjs.dijit.TOC({
                  map: map,
                  style: "inline",
                  layerInfos: [{
                    layer: inspMapLayer,
                    title: "Inspection Data"
                  }]
                }, 'display_toc');
                toc.startup();

                //setup identify parameters after layers have been loaded
                identifyParams.tolerance = 3;
                identifyParams.returnGeometry = true;
                identifyParams.layerIds = inspMapLayer.visibleLayers;
                identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;
                identifyParams.width  = map.width;
                identifyParams.height = map.height;

              });

        map.addLayers([inspMapLayer, leakLayer, lineSgmtLayer]);

        //query task to determine closest line segments
        queryTask = new esri.tasks.QueryTask(lineSgmtLayerUrl);

        // Query
        querySgmt = new esri.tasks.Query();
        querySgmt.returnGeometry = true;
        querySgmt.outFields = ["SegmentGUID","LineGroupGUID","SegmentName","OBJECTID"];

        //query to highlight line sgmt when editing leak properties
        querySgmtTask = new esri.tasks.QueryTask(lineSgmtLayerUrl);
        // query
        querySgmtParams = new esri.tasks.Query();
        querySgmtParams.returnGeometry = true;
        querySgmtParams.outFields = ["SegmentGUID","OBJECTID"];

        // before edits are applied to the leak feature layer
        dojo.connect(leakLayer, 'onBeforeApplyEdits', function(adds, updates, deletes){
          var addsDone = adds;
          if (adds != null){
            //grab feature to update
            if (adds.length > 0){
              updateFeature = adds[0];
              createSgmtBuffer();
            }
            
          }

          //var updateDone = updates;
          //if (updates != null){
          //  if (updates.length > 0){
          //    updateFeature = updates[0];
          //  }
          //}
        });


        // Listen for GeometryService onBufferComplete event
        dojo.connect(geometryService, "onBufferComplete", function(geometries) {
  
          //set up query statement to query for the nearest line segments
          querySgmt.geometry = esri.geometry.webMercatorToGeographic(geometries[0]); 
          querySgmt.outSpatialReference = {"wkid":4326}; //map.spatialReference;
          queryTask.execute(querySgmt);
    
        });

        // Listen for QueryTask executecomplete event
        dojo.connect(queryTask, "onComplete", function(fset) {

          //put the nearest line segments into an array to reference 
          //when the edit leak line sgmt drop-down needs to be populated
          closestLines = [];
          var resultFeatures = fset.features;
          for (var i=0, il=resultFeatures.length; i<il; i++) {
              //add line sgmts to drop-down of leak layer edit
              closestLines[i] = new Array();
              closestLines[i]["label"] = resultFeatures[i].attributes.SegmentName.toString();
              closestLines[i]["value"] = resultFeatures[i].attributes.SegmentGUID.toString();
              closestLines[i]["OBJECTID"] = resultFeatures[i].attributes.OBJECTID.toString();
              if (i == 0){
                closestLines[i]["selected"] = true;
              }else{
                closestLines[i]["selected"] = false;
              }
            }
            
          //show leak updates after we pre-populate the line segment drop-down
          showLeakUpdate();

        });

        //after leak selection is made for Editing
        dojo.connect(leakLayer,"onSelectionComplete", function(features){

          var selLeaks = leakLayer.getSelectedFeatures();

          if (!leakAdd){
            //set the feature to update and show results
            updateFeature = selLeaks[0];

            //create buffer around selected point to determine the closest line segments
            createSgmtBuffer();
       
          }

        });

        //after line segment selection is made for Editing
        dojo.connect(lineSgmtLayer,"onSelectionComplete", function(features){

          var selLineSgmts = lineSgmtLayer.getSelectedFeatures();

            //set the feature to update and show results
            updateFeature = selLineSgmts[0];

            //display line sgmt properties for editing
            showLineSgmtUpdate();
       

        });

        //set up identify task
        identifyTask = new esri.tasks.IdentifyTask(inspDataUrl);
        identifyParams = new esri.tasks.IdentifyParameters();
        ctrlPtParams = new esri.tasks.IdentifyParameters();

        pushpinSymbol = new esri.symbol.PictureMarkerSymbol(pushPin,30,30).setOffset(10,0);

        //symbology for graphics
        markerSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1), new dojo.Color([0, 255, 0, 0.25]));
        lineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASH, new dojo.Color([255, 0, 0]), 1);
        polygonSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NONE, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]));

        //symbology for identify
        identifyLineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([135, 206, 250, 0.65]), 3);
        hilightLineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([125,125,125,0.35]), 3);
        identifyLineOutline = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NULL,
           new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
           new dojo.Color([255,0,0]), 10),new dojo.Color([255,255,0,0.25]));

        identifyPolygonSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NULL, identifyLineSymbol, new dojo.Color([0, 0, 0]), 0);
        hilightPolygonSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NULL, hilightLineSymbol, new dojo.Color([125,125,125,0.35]), 0);

        identifyPointOutline = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 12,
           new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, 
           new dojo.Color([255,0,0]), 1), new dojo.Color([0,255,0,0.25])); 
        identifyPointSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 6, identifyPointOutline, new dojo.Color([135, 206, 250, 0.65]));
        hilightPointSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 6, identifyPointOutline, new dojo.Color([125,125,125,0.35]));

        //set leak feature layer selection symbol
        leakLayer.setSelectionSymbol(hilightPointSymbol);
        //line segment feature layer selection symbol
        lineSgmtLayer.setSelectionSymbol(identifyLineOutline);

        dojo.connect(map, "onLoad", mapLoadHandler);
      }

      function createSgmtBuffer(){
              // create buffer around selected point to determine the closest line segments the leak can be attached to
              var bufparams = new esri.tasks.BufferParameters();
              bufparams.geometries = [updateFeature.geometry];

              // Buffer in linear units such as meters, km, miles etc.
              bufparams.distances = [20];
              bufparams.unit = esri.tasks.GeometryService.UNIT_METER;
              bufparams.bufferSpatialReference = new esri.SpatialReference({wkid:102100}); //({wkid:32662}) - world WGS_1984_Plate_Carree
              bufparams.outSpatialReference = map.spatialReference;
              geometryService.buffer(bufparams); //, showBuffer);
      }

      function mapLoadHandler(map) {
        
        //enable ability to use scroll wheel to zoom in/out
        map.enableScrollWheelZoom();
      }

