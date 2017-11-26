## VISearch
Visualization system based on [VIS Pub Data](http://www.vispubdata.org/site/vispubdata/)

### Features
1. Different Chart Types
1. Customizable Search Options
1. Paper List
1. Text Cloud

### Easy deployment
1. Install mongodb 3.4 on the server
1. Run `bash setup.sh`
1. Run `python manage.py runserver 0.0.0.0:8000`

### Install on Mac
1. Install `Homebrew` (https://brew.sh/) if not installed
```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```
1. Install `MongoDB` 3.4+
```
brew install mongodb
sudo mkdir -p /data/db
sudo chown -R `id -un` /data/db
```
1. Make sure default Python version is 2.7
1. Install `pip` if not installed
```
sudo easy_install pip
```
1. Enter the project folder (where the `setup.sh` exists), and run
```
sudo bash setup.sh
```
This will install some necessary packages. If *Operation not permitted* error occurs, try to **reinstall** python with brew
```
brew install python
```
1. Start `MongoDB` in a new terminal
```
mongod
```
1. Enter the `data` folder in the project folder (where the `dataLoader.py` exists), and rum
```
sudo python dataLoader.py
```
This will load dataset into mongodb, if succeed, the command will print *ok* at the end
1. Go back to project folder, start the `VISearch`
```
python manage.py runserver 0.0.0.0:8000
```
Hopefully everything is well. Now open `http://localhost:8000/` in browser (Chrome better), click search button to make the default search. You can get the chart now, click on the chart to get the paper list and clouds


###
Contact: corey.hdu@gmail.com
