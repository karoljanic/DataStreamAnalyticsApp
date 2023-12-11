#!/bin/sh

rm backend/db.sqlite3
rm -rf backend/migrations
rm -rf api/migrations
rm -rf user/migrations

python3 manage.py makemigrations api
python3 manage.py makemigrations users
python3 manage.py makemigrations
python3 manage.py migrate api
python3 manage.py migrate users
python3 manage.py migrate

python manage.py runserver