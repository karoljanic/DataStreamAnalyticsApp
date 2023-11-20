from django.db import models

class DataStream(models.Model):
	name = models.CharField(max_length=255)

class Tag(models.Model):
	name = models.CharField(max_length=255)

# Najważniejszy model - Szkic danych 
# Strumień danych | Dzień | Tag | Typ | Zawartość
# (Strumień danych, dzień, tag, typ) są unikalne i po nich będziemy tworzyć zapytania do bazy danych
class DataSketch(models.Model):
	class Typ(models.IntegerChoices):
		COUNT = 1
		MAX_SALARY = 2
		MIN_SALARY = 3

	stream = models.ForeignKey(DataStream, on_delete=models.CASCADE)
	day = models.DateField()
	tag = models.ForeignKey(Tag, on_delete=models.CASCADE)
	typ = models.IntegerField(choices=Typ.choices)

	sketch = models.BinaryField()

	class Meta:
		constraints = [
			models.UniqueConstraint(fields=['stream','day','tag','typ'], name="unique_keys")
		]
