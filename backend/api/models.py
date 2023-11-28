from django.db import models
from datasketches import DataSketch as DS

class DataStream(models.Model):
	name = models.CharField(max_length=255)

class Tag(models.Model):
	stream = models.ForeignKey(DataStream, on_delete=models.CASCADE)
	name = models.CharField(max_length=255)

class Type(models.Model):
	stream = models.ForeignKey(DataStream, on_delete=models.CASCADE)
	name = models.CharField(max_length=255)

# Najważniejszy model - Szkic danych 
# Dzień | Tag | Zawartość
# (dzień, tag, typ) są unikalne i po nich będziemy tworzyć zapytania do bazy danych
class DataSketch(models.Model):
	day = models.DateField()
	tag = models.ForeignKey(Tag, on_delete=models.CASCADE)
	typ = models.ForeignKey(Type, on_delete=models.CASCADE)

	sketch = models.BinaryField(editable=True)

	def value(self):
		ds = DS()
		ds.from_bytes(self.sketch)
		return ds.read_value()

	class Meta:
		constraints = [
			models.UniqueConstraint(fields=['day','tag','typ'], name="unique_keys")
		]
