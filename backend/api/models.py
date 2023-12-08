from django.db import models
from datasketches import DataSketch as DS
import api.querytrees

class DataStream(models.Model):
	name = models.CharField(max_length=255, unique=True)

class Tag(models.Model):
	stream = models.ForeignKey(DataStream, on_delete=models.CASCADE)
	name = models.CharField(max_length=255)
	class Meta:
		constraints = [
			models.UniqueConstraint(fields=['stream', 'name'], name="unique_names_tags")
		]

class Type(models.Model):
	stream = models.ForeignKey(DataStream, on_delete=models.CASCADE)
	name = models.CharField(max_length=255)
	class Meta:
		constraints = [
			models.UniqueConstraint(fields=['stream', 'name'], name="unique_names_types")
		]

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

class Query(models.Model):
	tree_form = models.JSONField()
	dnf = models.JSONField(editable=False)

	def save(self, *args, **kwargs):
		self.dnf = api.querytrees.tree_to_table(self.tree_form)
		super(Query, self).save(*args, **kwargs)