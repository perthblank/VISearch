## VISearch
Visualization system based on [VIS Pub Data](http://www.vispubdata.org/site/vispubdata/)

Demo at: http://35.164.45.239:8000/

### Easy deployment
#### Prepare Data
1. Install mongodb and django on the server
1. Enter `data` folder
    1. Config database in `vconfig.py`
    1. Run `python dataLoader.py`

1. Enter main folder, run `python manage.py runserver 0.0.0.0:8000`

#### Test
To test the application, open the page in browser, select the search input and press *Enter*, this will give you a default testing visualization
