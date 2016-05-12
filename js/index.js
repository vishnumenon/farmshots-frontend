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

function photo_url(asset_id) { return "http://image.farmshots.com/imagery/tile?asset_id=" + asset_id + "&min_map=20&max_map=100&ul_lat=35.56239491058853&ul_lon=-90.2471923828125&lr_lat=35.42486791930558&lr_lon=-90.087890625&x_dim=1024&y_dim=1024&exprs=[%22%20b4%20%22,%20%22b3%20%22,%20%22b2%20%22]&lossless=true&access_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1dWlkIjoiM2UxZmJhYTgtNzc0Mi00Njg1LTgzNGUtZTYxM2NiYjBlOGI4IiwiaWF0IjoxNDQ4MTQ1MzU2fQ.lmlXIRtIXeshZIb6ZuLrq7a6hnGgEgnbcELA21zIg5StzXj9dmg802Uls67hpT9FTPPpM1GJfpwczGDhZN2L0EXu9Tc-UiN0MYgMhV0wry_lSZgZdZZbWH68mWQAYL1FtajDaGDdk-CQHzRiAzXZIESvfazqLu92qqFL5URINr8"; }

var assets_url = "http://api.farmshots.com/imagery/catalogs?bounds=" + JSON.stringify(region) + "&cloud_cover=10&source=landsat8&page=0";

function imagery_url(asset_id) { return 'http://image.farmshots.com/imagery/tile/{x}/{y}/{z}?min_map=20&max_map=80&exprs=["b4", "b3", "b2"]&lossless=false&access_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1dWlkIjoiM2UxZmJhYTgtNzc0Mi00Njg1LTgzNGUtZTYxM2NiYjBlOGI4IiwiaWF0IjoxNDQ4MTQ1MzU2fQ.lmlXIRtIXeshZIb6ZuLrq7a6hnGgEgnbcELA21zIg5StzXj9dmg802Uls67hpT9FTPPpM1GJfpwczGDhZN2L0EXu9Tc-UiN0MYgMhV0wry_lSZgZdZZbWH68mWQAYL1FtajDaGDdk-CQHzRiAzXZIESvfazqLu92qqFL5URINr8&asset_id=' + asset_id; }

$(document).ready(load_data);

function load_data() {
	$.ajax({
		url: assets_url,
		type:"GET",
		dataType:"json",
		success: function(data){
			load_pics(data)
			load_maps(data[1]["asset_id"]);
		},
		error: function(err){
			console.log(err);
		}
	});
}

var id = 0;
function load_pics(data) {
	$("#toggle_pics").on('click', function() {
		$("#toggle_pics > span").toggle();
		$("#map, #images").toggle(); 
	});

	$("#images img").each(function(i, elem) {
		elem.src = photo_url(data[i]["asset_id"]);
	})

	window.setInterval(function() {
		console.log("called @" + id);
		$("#images img").hide();
		$("#images img:nth-child(" + (id+1) + ")").show();
		id = (id + 1) % 5;
	}, 2000);
}

function load_maps(asset_id) {
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
			url: imagery_url(asset_id)
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
	});
}
