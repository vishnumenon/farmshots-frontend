


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

var assets_url = "http://api.farmshots.com/imagery/catalogs?bounds=" + JSON.stringify(region) + "&page=0";
function imagery_url(asset_id) { return 'http://image.farmshots.com/imagery/tile/{x}/{y}/{z}?min_map=20&max_map=80&exprs=["b4", "b3", "b2"]&lossless=false&access_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1dWlkIjoiM2UxZmJhYTgtNzc0Mi00Njg1LTgzNGUtZTYxM2NiYjBlOGI4IiwiaWF0IjoxNDQ4MTQ1MzU2fQ.lmlXIRtIXeshZIb6ZuLrq7a6hnGgEgnbcELA21zIg5StzXj9dmg802Uls67hpT9FTPPpM1GJfpwczGDhZN2L0EXu9Tc-UiN0MYgMhV0wry_lSZgZdZZbWH68mWQAYL1FtajDaGDdk-CQHzRiAzXZIESvfazqLu92qqFL5URINr8&asset_id=' + asset_id; }

$(document).ready(load_data);

function load_data() {
	$.ajax({
		url: assets_url,
		type:"GET",
		dataType:"json",
		success: function(data){
		//	$("#toggle_pics")
			load_maps(data);
		},
		error: function(err){
			console.log(err);
		}
	});
}

function load_maps(data) {
	var map = new ol.Map({
		target: 'map',
		view: new ol.View({
			center: [-90.15552520751953, 35.496176539385026],
			zoom: 12,
			projection: 'EPSG:4326'
		})
	});
	
	// Farmshots sat layer
	var farmshots_satellite = new ol.layer.Tile({
		source: new ol.source.XYZ({
			url: imagery_url(data[1]["asset_id"])
		}),
		opacity: 1
	});

    //OWM temperature layer
    var temperature = new ol.layer.Tile({
    	source: new ol.source.XYZ({
    		url: 'http://maps.owm.io:8091/57312b2a4ccf430100c37025/{z}/{x}/{y}?hash=b64f691acf2b690e7a52263e20d698f4'
    	}),
    	opacity: .3
    });

    //OWM wind layer
    var wind = new ol.layer.Tile({
    	source: new ol.source.XYZ({
    		url: 'http://maps.owm.io:8091/57312e6f4ccf430100c37026/{z}/{x}/{y}?hash=b64f691acf2b690e7a52263e20d698f4'
    	}),
    	opacity: .3
    });    

    //OWM rainfall layer
    var rainfall = new ol.layer.Tile({
    	source: new ol.source.XYZ({
    		url: 'http://maps.owm.io:8091/573130e64ccf430100c37028/{z}/{x}/{y}?hash=b64f691acf2b690e7a52263e20d698f4',
    	}),
    	opacity: .3
    })

	//add all the layers
	map.addLayer(farmshots_satellite);
	map.addLayer(wind);
	map.addLayer(temperature);
	map.addLayer(rainfall);

	//create label map
	layerLabels = {
		"satellite": {layer: farmshots_satellite, index: 0},
		"wind": {layer: wind, index: 1},
		"temperature": {layer: temperature, index: 2},
		"rainfall": {layer: rainfall, index: 3}
	}

	//add the toggling 
	$("#toggles input").change(function() {
		var l = layerLabels[$(this).attr("value")];
		if($(this).is(':checked')) {
			map.getLayers().insertAt(Math.min(l.index, map.getLayers().getArray().length), l.layer);
		} else {
			map.removeLayer(l.layer);
		}
	})
}
