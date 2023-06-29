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

isLoaded = false;

function loadCategories() {
    fetch('../api/categories')
        .then(response => response.json())
        .then(data => {
            console.log(data)
            completeCategoriesDataOnForm(data)
        })
        .catch(err => console.error(err))
}

function formValidation() {
    event.preventDefault();
    saveInputsData();
}

function completeCategoriesDataOnForm(data) {
    var categoryField = document.getElementById("categories");

    if (!isLoaded) {
        for (let category of data.categories) {
            let option = document.createElement("option")
            option.value = category.Id
            option.text = category.Value
            categoryField.add(option)
        }
        isLoaded = true;
    }
}

function saveInputsData() {
    var inputName = document.getElementById("inputName");
    var address = document.getElementById("address");
    var phone = document.getElementById("phone");
    var coords = document.getElementById("coords");
    var category = document.getElementById("categories");

    validateInputsData(inputName, address, phone, coords, category);
}

function validateInputsData(inputName, address, phone, coords, category) {
    if (inputName.value.trimStart() < 1 || address.value.trimStart() < 1 || phone.value.trimStart() < 1) {
        document.getElementById("errorLabel").innerHTML = "Todos los campos son requeridos";
    } else if (coordsHaveError(coords.value)) {
        document.getElementById("errorLabel").innerHTML = "Los valores posibles para las coordenadas son: <br> Longitud -180 < x < 180 y Latitud -90 < y < 90 separados por coma";
    } else {
        let poi = createNewPoi(inputName.value, address.value, phone.value, category.value, coords.value)
        saveNewPoi(poi);
        clearAllInputsAndErrors();
        $('#formModal').modal('hide');
    }
}

function createNewPoi(inputName, address, phone, category, coords) {
    var splittedCoords = coords.split(',');
    var entity = JSON.stringify({
        "entity": {
            "Id": "",
            "Name": name.value,
            "Address": address.value,
            "Phone": phone.value,
            "XLon": splittedCoords[0].replace('.', ','),
            "YLat": splittedCoords[1].replace('.', ','),
            "Category": category.value
        }
    })
    return entity;
}

// Challenge failed
function saveNewPoi(poi) {
    fetch('../api/ValidateForm', {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(poi),
    }).then(response => response.json())
        .catch(err => console.error("Error trying to add a new POI" + err))
}

function clearAllInputsAndErrors() {
    document.getElementById("errorLabel").innerHTML = "";
    inputName.value = "";
    address.value = "";
    phone.value = "";
    coords.value = "";
}

function coordsHaveError(cords) {
    var splittedCoords = cords.split(',');
    return !(splittedCoords[0] < 180 && splittedCoords[0] > -180
        && splittedCoords[1] < 90 && splittedCoords[1] > -90);
}
