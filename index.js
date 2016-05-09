


var region = {
	"type": "Polygon",
	"coordinates": [
	[
	[
	-90.2471923828125,
	35.42486791930558
	],
	[
	-90.2471923828125,
	35.56239491058853
	],
	[
	-90.087890625,
	35.56239491058853
	],
	[
	-90.087890625,
	35.42486791930558
	],
	[
	-90.2471923828125,
	35.42486791930558
	]
	]
	]
}; 

var start_date = new Date();
start_date.setMonth(start_date.getMonth() - 4);
var end_date = new Date();

var assets_data = JSON.stringify({
	"source": "landsat8",
	"geojson": region,
	"start": start_date.toJSON().slice(0,10),
	"end": end_date.toJSON().slice(0,10)
});

var assets_url = "http://image.farmshots.com/assets/imagery"
function imagery_url(asset_id) { return 'http://image.farmshots.com/imagery/tile/${x}/${y}/${z}?min_map=20&max_map=80&exprs=["b4", "b3", "b2"]&lossless=false&access_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1dWlkIjoiM2UxZmJhYTgtNzc0Mi00Njg1LTgzNGUtZTYxM2NiYjBlOGI4IiwiaWF0IjoxNDQ4MTQ1MzU2fQ.lmlXIRtIXeshZIb6ZuLrq7a6hnGgEgnbcELA21zIg5StzXj9dmg802Uls67hpT9FTPPpM1GJfpwczGDhZN2L0EXu9Tc-UiN0MYgMhV0wry_lSZgZdZZbWH68mWQAYL1FtajDaGDdk-CQHzRiAzXZIESvfazqLu92qqFL5URINr8&asset_id=' + asset_id; }

Zepto(load_data);

function load_data() {
	$.ajax({
		url: assets_url,
		type:"POST",
		data: assets_data,
		contentType:"application/json; charset=utf-8",
		dataType:"json",
		success: function(data){
			load_maps(data);
		},
		error: function(err){
			console.log(err);
		}
	});
}

function load_maps(data) {
	var map = new OpenLayers.Map({
		div: 'map',
		projection: new OpenLayers.Projection("EPSG:900913")
	});
	
	// Marker for provided point
	var vectorLayer = new OpenLayers.Layer.Vector("Overlay");
	var feature = new OpenLayers.Feature.Vector(
 		new OpenLayers.Geometry.Point(-90.15552520751953, 35.496176539385026)	
 	);
	vectorLayer.addFeatures(feature);
	
	// Farmshots sat layer
	var farmshots_satellite = new OpenLayers.Layer.XYZ(
		"Farmshots Satellite",
        imagery_url(data[0]["asset_id"]),
        {}
  	);

//	map.addLayer(vectorLayer);
	map.addLayer(farmshots_satellite);
	map.setCenter(new OpenLayers.LonLat(35.496176539385026, -90.15552520751953), 12);
}
