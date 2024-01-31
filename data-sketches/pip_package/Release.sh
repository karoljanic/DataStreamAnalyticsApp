#Release Script for data sketches python package

#Build pack
python3 set_version.py

#check pack
python3 setu.py check
python3 setup.py sdist bdist_wheel

#Upload pack to pypi
#Credentials can be obtained from jakub Dryka
twine upload dist/*

#Update VERSION.txt
