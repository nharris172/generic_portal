/**
 * Created by nnh33 on 14/09/17.
 */

styleFunction = function(feature, resolution) {
       return get_style(feature, false)
   }
   styleFunction_selected = function(feature, resolution) {
       return get_style(feature, true)
   }

   function get_style(feature, selected) {
       outline_color = 'black'
       radius_added = 0

           if (selected) {

           image = new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
    anchor: [0.5, 0.5],
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
            scale: 0.1,
    //opacity: 0.75,
    src: feature.getProperties().sel_icon
  }))
       }else{

           image = new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
    anchor: [0.5, 0.5],
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
            scale: 0.1,
    //opacity: 0.75,
    src: feature.getProperties().icon
  }))


       }


           style_dict = {
               'Point': [
                   new ol.style.Style({
                       image: image
                   })
               ],

           }



       return style_dict[feature.getGeometry().getType()]
   }


   sensor_data = {}
var var_info;
$(function() {

    map = new ol.Map({
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          })
        ],
        target: 'map',
        view: new ol.View({
          center: [0, 0],
          zoom: 2
        })
      });


$.getJSON("/json/static/variables.json", function(json){
    var_info = json;
});

    $.getJSON('/json/dynamic/sensors.json',function( data ) {

        var geojsonObject = {
           'type': 'FeatureCollection',
           'crs': {
               'type': 'name',
               'properties': {
                   'name': 'EPSG:4326'
               }
           },
           'features': []
       }

        $.each(data.sensors,function(i,sensor){

            sensor_data[sensor.name] = {
                'graphs':sensor.data,
                'live':sensor.live_readings
            }



            geojsonObject.features.push({
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates":[].concat( sensor.latlon).reverse()
  },
  "properties": {
      layer_type:'sensors',
      display_name:sensor.name,
      sel_icon:sensor.icons.sel,
      icon:sensor.icons.normal,
        }
})

        })

        vectorSource = new ol.source.Vector({
           features: (new ol.format.GeoJSON()).readFeatures(
               geojsonObject, {
                   dataProjection: 'EPSG:4326',
                   featureProjection: 'EPSG:3857'
               }),
       });

        sensor_layer = new ol.layer.Vector({
            style:styleFunction,
           source: vectorSource,
       });
        map.addLayer(sensor_layer)

        selectClick = new ol.interaction.Select({
           condition: ol.events.condition.click,
           style: styleFunction_selected,
           layers: [sensor_layer],
       })
    map.addInteraction(selectClick);
    selectClick.getFeatures().on("add", function(e) {
        sensor_click(e.element.getProperties().display_name)

    })

        selectClick.getFeatures().on("remove", function(e) {

            $('.sensor_info').hide()
$('.sensor_info').removeClass('graphs').addClass('no_graphs')
$('.graph_button_panel').hide()
    $('.graph_panel').hide()

        })


var extent = vectorSource.getExtent();
map.getView().fit(extent, map.getSize());

    })

$('.map_cover').hide()
});


sensor_click = function (sensor_name) {
    $('.sensor_info_header_bar').text(sensor_name)
    console.log(sensor_data[sensor_name].live)
    $('#sensor_latest_time').text(sensor_data[sensor_name].live.time)
    $('#sensor_reading_table tbody').html('')
    $('.graph_button_panel').html('')
    $.each(sensor_data[sensor_name].live.vals,function (var_name,var_val) {
        $('.graph_button_panel').append(
            $('<div></div>').addClass("btn").click(function () {
                make_graph(sensor_name,var_name)
            }).text(var_name)

        )

        $('#sensor_reading_table tbody').append(
            $('<tr></tr>').append(
                $('<td></td>').text(var_name),
                $('<td></td>').text(var_val.toFixed(2)+' '+var_info[var_name].units)
            )
        )
    })

    $('#graph_exploder_button').attr('sensor_name',sensor_name)

    $('.sensor_info').show()
}

show_graphs =function(sensor_name){



    if($('.sensor_info').hasClass('graphs')){
        return
    }

$('.sensor_info').removeClass('no_graphs').addClass('graphs')
$('.graph_button_panel').show()
    $('.graph_panel').show()

    $('.graph_button_panel .btn:first').click()
}

make_graph = function (sensor_name,var_name) {

    sensor_data[sensor_name].graphs[var_name][0]
    make_graph_highcharts($('.sensor_highcharts_panel'),sensor_name,var_name,sensor_data[sensor_name].graphs[var_name],var_info[var_name].graph_type,var_info[var_name].units)
}

make_graph_highcharts = function(container, sensor_id, graph_var,graph_data,graph_type,units) {

       chart = container.highcharts({
           chart: {
               type: graph_type,
               zoomType: 'x'
           },
           title: {
               text: graph_var,
               x: -20 //center
           },
           xAxis: {
               type: 'datetime',
           },
           yAxis: {
               title: {
                   text: graph_var + ' (' + units + ')'
               },
               plotLines: [{
                   value: 0,
                   width: 1,
                   color: '#808080'
               }]
           },
           tooltip: {
               valueSuffix: units
           },
           plotOptions: {
               column: {
                   minPointLength: 5
               }
           },
            navigation: {
            buttonOptions: {
                enabled: false
            }
        },
           series: [{
               name: sensor_id,
               data: graph_data
           }]
       });




   }

   unselect_features = function(){

selectClick.getFeatures().clear()

   }