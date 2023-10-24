from django.db import models

class ExampleModel(models.Model):
	firstname    = models.CharField(max_length=200)
	lastname     = models.CharField(max_length=200)
