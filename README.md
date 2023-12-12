# DataStreamAnalyzer

## Odpalanie lokalne całej aplikacji

### Instalacja narzędzi
```
pip install django djangorestframework

npm install -g @angular/cli
```

### Uruchamianie
Jeśli projekt nie był jeszcze uruchamiany lub nastąpiła zmiana w części bazodanowej, to należy uruchomić:
```
python3 backend/manage.py migrate
```

Uruchamiane backendu:
```
python3 backend/manage.py runserver
```

Potem w osobnym terminalu można uruchomić frontend:
```
cd frontend
ng serve
```
