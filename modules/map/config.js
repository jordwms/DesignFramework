/*
* Config file for ApplusRTD Map Viewer
*/
var baseUrl = "https://dc2-dev-gis/ArcGIS/rest/services/";
var nonsecureBaseUrl = "http://dc2-dev-gis/ArcGIS/rest/services/";
//var token = "K_exsXC1P3eHGXCswNnZKZnvUpmnzGIG9E81QdHXeSaqJQDNLqQNRvr7uSClNLM8";
var token = "oi9cERdPBR2RCXGw50_BfepH0zPYANuVZuHxmJulpJ7U83wInmnABW4h-eWOD2_Y";

//Inspection Data URL
var inspDataUrl = nonsecureBaseUrl+"PipeLineMapping/MapServer";

// Control Point Feature Layer
var ctrlPtLayerUrl = nonsecureBaseUrl+"PipelineMapping/MapServer/0";

// Line Segment Feature Layer
//var lineSgmtLayerUrl = baseUrl+"SecureServices/PipeLineSecure/FeatureServer/14?token="+token;
var lineSgmtLayerUrl = nonsecureBaseUrl+"PipelineMapping/MapServer/14";

//leak feature layer
var leakLayerUrl = baseUrl+"SecureServices/PipeLineSecure/FeatureServer/1?token="+token;

//non-secure leak layer
var leakLayerDataUrl = nonsecureBaseUrl+"PipeLineMapping/MapServer/1";

//secureServices
var sercureServices = baseUrl+"SecureServices/?token="+token;

//Imagery Service
var imageryService = "http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer";
//var imageryService = "http://server.arcgisonline.com/ArcGIS/rest/services/ESRI_StreetMap_World_2D/MapServer"; //wkid: 4326

//VXRayMaps Geometry services
var geomtryServiceUrl = nonsecureBaseUrl+"Geometry/GeometryServer";

//proxy page on server
//var proxyUrl = "./proxy/proxy.ashx"; //"https://dc2-dev-gis/proxy/proxy.ashx";   //"./proxy/proxy.ashx"; //


 /**
  * point zoom factor, used to convert a point into an extent.
  * in map spatial reference units.
  */
 var pointZoomFactor = 10;

