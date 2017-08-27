## VISearch
Visualization system based on [VIS Pub Data](http://www.vispubdata.org/site/vispubdata/)

### Features
1. Different Chart Types
1. Customizable Search Options
1. Paper List
1. Text Cloud

### Easy deployment
#### Prepare Data
1. Install mongodb 3.4 and django on the server
1. Enter `data` folder
    1. Config database in `vconfig.py`
    1. Run `python dataLoader.py`

1. Enter main folder, run `python manage.py runserver 0.0.0.0:8000`

#### Test
Press *Enter* button on the search input. This will give you a default testing visualization on "lighting, texture, material, shadow"
