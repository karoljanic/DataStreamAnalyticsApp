from backend.settings.common import *
import os
import dj_database_url

DEBUG = False

DATABASES = {
    'default': dj_database_url.config()
}
