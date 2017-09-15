import datetime
import random


def roundTime(dt=None, dateDelta=datetime.timedelta(minutes=1)):

    """Round a datetime object to a multiple of a timedelta
    dt : datetime.datetime object, default now.
    dateDelta : timedelta object, we round to a multiple of this, default 1 minute.
    Author: Thierry Husson 2012 - Use it as you want but don't blame me.
            Stijn Nevens 2014 - Changed to use only datetime objects as variables
    """
    roundTo = dateDelta.total_seconds()

    if dt == None : dt = datetime.datetime.now()
    seconds = (dt - dt.min).seconds
    # // is a floor division, not a comment on following line:
    rounding = (seconds+roundTo/2) // roundTo * roundTo

    return dt + datetime.timedelta(0,rounding-seconds,-dt.microsecond)

def get_trend(trend):
    if random.randint(0,10) > 2:
        return trend*-1
    return trend



def generate_random_data(start_date,end_date,timedelta,var):

    ranges = {

        'Temperature':[15,25],
        'Humidity': [0, 100],
        'NO':[0,50],
        'NO2': [0, 50],
    }

    start_val = random.randint(*ranges[var])+ random.random()
    start_date = roundTime(start_date,timedelta)

    data = [[start_date,start_val]]
    start_date+=timedelta
    trend = random.choice([-1,1])
    while start_date < end_date:
        utc_time = start_date

        val = data[-1][1] + (get_trend(trend)*random.random())/5
        while val <  ranges[var][0] or val > ranges[var][1]:
            val = data[-1][1] + (get_trend(trend) * random.random())/5

        data.append([utc_time,val])
        start_date+=timedelta
    return data



sensors = [
    {
        'latlon':(53.380343, -1.474153),
        'name':'dummy1',
        'type':'Weather',
        'variables':['Temperature','Humidity']
    },
    {
        'latlon': (53.383005, -1.466879),
        'name': 'dummy2',
        'type':'Air Quality',
        'variables':['NO','NO2']
    },
    {
        'latlon': (53.381930, -1.480483),
        'name': 'dummy3',
        'type':'Air Quality',
        'variables':['NO','NO2']
    }
]
end_date = datetime.datetime.now()
start_date = end_date - datetime.timedelta(days=1)
timedelta = datetime.timedelta(minutes=15)
with open('/home/nnh33/sheffield_portal/dummy_data/dummy_data.csv','w') as dummy_csv:
    for sensor in sensors:

        for var in sensor['variables']:
            for line in generate_random_data(start_date,end_date,timedelta,var):
                dummy_csv.write('|'.join([sensor['name'],var,str(line[0]),str(line[1])])+'\n')

with open('/home/nnh33/sheffield_portal/dummy_data/dummy_sensors.csv', 'w') as dummy_csv:
    for sensor in sensors:
        dummy_csv.write('|'.join([sensor['name'], sensor['type'], str(sensor['latlon'][0]), str(sensor['latlon'][1])]) + '\n')

