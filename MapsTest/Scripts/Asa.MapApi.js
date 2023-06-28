// https://developers.arcgis.com/javascript/3/jsapi/
var mapApp = {
    map: undefined
}

mapApp.getPOIs = function (callback) {
    $.get("../api/pois", function (data) {
        console.log(data)
        if (callback) callback(data.pois);
    })
}


mapApp.initMap = function (callback) {
    mapApp.map;

    require(["esri/map", "esri/symbols/SimpleMarkerSymbol", "esri/layers/GraphicsLayer", "dojo/domReady!"],
        function (Map, SimpleMarkerSymbol, GraphicsLayer) {
            mapApp.map = new Map("map", {
                basemap: "topo",  //For full list of pre-defined basemaps, navigate to http://arcg.is/1JVo6Wd
                center: [-58.3724715, -34.595986], // longitude, latitude
                zoom: 13
            });

            mapApp.POIsLayer = new GraphicsLayer({id: "crosses"});
            mapApp.map.addLayer(mapApp.POIsLayer);
            mapApp.POIsSymbol = new SimpleMarkerSymbol({
                "color": [230, 76, 0, 150],
                "size": 20,
                "angle": -30,
                "xoffset": 0,
                "yoffset": 0,
                "type": "esriSMS",
                "style": "esriSMSCross",
                "outline": {
                    "color": [168, 0, 0, 255],
                    "width": 1,
                    "type": "esriSLS",
                    "style": "esriSLSSolid"
                }
            });

            if (callback) callback();
        });
}

mapApp.initMap(function () {
    mapApp.getPOIs(function (pois) {
        require(["esri/graphic", "esri/geometry/Point", "esri/geometry/webMercatorUtils", "dojo/domReady!"],
            function (Graphic, Point, webMercatorUtils) {
                pois.forEach(function (poiData) {
                    var coors = webMercatorUtils.lngLatToXY(poiData.XLon, poiData.YLat,)
                    var poi = new Point(coors[0], coors[1], mapApp.map.spatialReference)
                    mapApp.POIsLayer.add(new Graphic(poi, mapApp.POIsSymbol, poiData));
                })

            });
    });
});

function formValidation() {
    event.preventDefault();
    saveInputsData();
}

function getCategories() {
    fetch('../api/Categories')
        .then(response => response.json())
        .then(data => completeCategoriesDataOnForm(data))
        .catch(err => console.log(err))
}

function completeCategoriesDataOnForm(data) {
    var categoryField = document.getElementById("categories");

    for (let category of data.categories) {
        let option = document.createElement("option")
        option.text = category.Value
        categoryField.add(option)
    }
}

function saveInputsData() {
    var inputName = document.getElementById("inputName");
    var address = document.getElementById("address");
    var phone = document.getElementById("phone");
    var coords = document.getElementById("coords");

    validateInputsData(inputName, address, phone, coords);
}

function validateInputsData(inputName, address, phone, coords) {
    if (inputName.value.trimStart() < 1 || address.value.trimStart() < 1 || phone.value.trimStart() < 1) {
        document.getElementById("errorLabel").innerHTML = "Todos los campos son requeridos";
    } else if (coordsHaveError(coords.value)) {
        document.getElementById("errorLabel").innerHTML = "Los valores posibles para las coordenadas son: <br> Longitud -180 < x < 180 y Latitud -90 < y < 90 separados por coma";
    } else {
        clearAllInputsAndErrors();
        $('#formModal').modal('hide');
    }
}

function clearAllInputsAndErrors() {
    document.getElementById("errorLabel").innerHTML = "";
    inputName.value = "";
    address.value = "";
    phone.value = "";
    coords.value = "";
}

function coordsHaveError(cords) {
    var splittedCords = cords.split(',');
    return !(splittedCords[0] < 180 && splittedCords[0] > -180
        && splittedCords[1] < 90 && splittedCords[1] > -90);
}
