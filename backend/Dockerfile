FROM debian:bookworm-slim as build

RUN set -ex; \
    apt-get update; \
    apt-get install -y cmake clang ninja-build;                                               

RUN mkdir /src

COPY data-sketches/data-sketches-library /src

WORKDIR /src/scripts

RUN bash configure.sh release
RUN bash build.sh release

FROM python:3.12-slim-bookworm

COPY --from=build /src /data-sketches

ENV PYTHONPATH $PYTHONPATH:/data-sketches/

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN mkdir -p /code

WORKDIR /code

COPY backend/requirements.txt /tmp/requirements.txt
RUN set -ex && \
    pip install --upgrade pip && \
    pip install -r /tmp/requirements.txt && \
    rm -rf /root/.cache/
COPY backend /code

EXPOSE 8000

ENV DJANGO_SETTINGS_MODULE backend.settings.prod

CMD ["gunicorn", "--bind", ":8000", "backend.wsgi"]
