# DataStreamAnalyzer

## Wersja alpha
https://datastream-analytics.fly.dev/

## Odpalanie lokalne całej aplikacji

### Niezbędne narzędzia
* pip
* npm

### Przygotowanie środowiska
W folderze backend tworzymy wirtualne środowisko oraz instalujemy niezbędne zależności:
```
python -m venv env
source env/bin/activate
```

W folderze frontend instalujemy Angular'a oraz niezbędnę biblioteki
```
npm install -g @angular/cli
npm ci
```

### Uruchamianie
Należy skompilować bibliotekę szkiców danych(robimy to z poziomu folderu glównego projektu):
```
cd data-sketches/data-sketches-library/scripts
sh configure.sh release
sh build.sh release
```

Jeśli projekt nie był jeszcze uruchamiany lub nastąpiła zmiana w części bazodanowej, to należy uruchomić(w folderze głównym projektu):
```
python3 backend/manage.py makemigrations api
python3 backend/manage.py makemigrations users
python3 backend/manage.py makemigrations
python3 backend/manage.py migrate api
python3 backend/manage.py migrate users
python3 backend/manage.py migrate
```

Uruchamiane backendu(robimy to z poziomu folderu glównego projektu):
```
export PYTHONPATH=$PYTHONPATH:$PWD/data-sketches/data-sketches-library
export PYTHONPATH=$PYTHONPATH:$PWD/data-sketches/data-sketches-library/datasketches
python3 backend/manage.py runserver
```

Potem w osobnym terminalu można uruchomić frontend(robimy to z poziomu folderu glównego projektu):
```
cd frontend
ng serve
```

Aplikacja powinna już działać ale nie będzie w niej danych historycznych,
aby to zrobić należy pobrać i rozpakować dane historyczne(znajdują się na Discordzie) i wywołać na nich skrypt(robimy to z poziomu folderu glównego projektu)
(równocześnie powinien być uruchomiany server):
```
python scraper/parse_to_datasketches.py [ścieżka do rozpakowanych danych]
```
Dane historyczne wrzucamy tylko jeden raz, chyba, że po drodze usuwaliśmy bazę danych, wówczas należy zrobić to raz jeszcze.
