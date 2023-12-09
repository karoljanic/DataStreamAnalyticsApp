from django.db import models
from datasketches import compute_dnf, DataSketch as DS
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

from datetime import date

class Query(models.Model):
	tree_form = models.JSONField()
	dnf = models.JSONField(editable=False)

	def value(self):
		TEST_DATE = date.fromisoformat('2017-04-30')
		TEST_TYPE = 1
		sketches_symbols = self.dnf['symbols']
		sketches_bytes = [DataSketch.objects.filter(day=TEST_DATE).filter(typ=TEST_TYPE).filter(tag=s).get().sketch for s in sketches_symbols]
		sketches = []
		for b in sketches_bytes:
			d = DS()
			d.from_bytes(b)
			sketches.append(d)
		dnf = self.dnf['table']

		print(sketches_bytes)
		print(sketches)

		computed = compute_dnf(sketches, dnf)

		return computed

	def save(self, *args, **kwargs):
		self.dnf = api.querytrees.tree_to_table(self.tree_form)
		super(Query, self).save(*args, **kwargs)