import datetime

import json
from pprint import pprint

def ts_to_utc(dt):
    return int((dt - datetime.datetime(1970, 1, 1)).total_seconds() * 1000)

with open('/home/nnh33/sheffield_portal/json/static/icons.json') as data_file:
    icons = json.load(data_file)




sensors = {

}


with open('/home/nnh33/sheffield_portal/dummy_data/dummy_sensors.csv', 'r') as dummy_csv:
    for line in dummy_csv:
        name, type ,lat,lon= line.strip().split('|')
        sensors[name] = {
            'latlon': (float(lat),float(lon)),
            'name': name,
            'type': type,
            'variables': [],
            'data': {},
            'icons':icons[type],
            'live_readings':{
                'vals': {}
            }
        }

sensor_data ={}
with open('/home/nnh33/sheffield_portal/dummy_data/dummy_data.csv', 'r') as dummy_csv:
    for line in dummy_csv:
        name,var,dt,val =line.strip().split('|')
        sensor_data[name] = sensor_data.get(name,{})
        sensor_data[name][var] = sensor_data[name].get(var,[])
        sensor_data[name][var].append([datetime.datetime.strptime(dt,'%Y-%m-%d %H:%M:%S'),float(val)])

for sensor_name,sensor_info in sensor_data.items():
    sensors[sensor_name]['variables'] = list(sensor_info.keys())
    for var_name,var_info in sensor_info.items():
        sensors[sensor_name]['live_readings']['time'] = str(var_info[-1][0])
        sensors[sensor_name]['live_readings']['vals'][var_name] = float(var_info[-1][1])
        sensors[sensor_name]['data'][var_name] = list(map(lambda x: [ts_to_utc(x[0]),x[1]], var_info))

with open('/home/nnh33/sheffield_portal/json/dynamic/sensors.json', 'w') as fp:
    json.dump({'sensors':list(sensors.values())}, fp, sort_keys=True, indent=4)