from numpy import byte
from python_wrapper import *

SAMPLES_NUMBER = 8192

# data streams generating
numbers = [id for id in range(1, SAMPLES_NUMBER + 1)]
numbers2k = [num for num in numbers if num % 2 == 0]
numbers3k = [num for num in numbers if num % 3 == 0]
numbers6k = [num for num in numbers if num % 6 == 0]

samples = SamplesArray()

samples.samples = [(id, 1) for id in numbers3k]

sketch1 = DataSketch()

sketch1.update_from_samples(samples)

# print(sketch1.read_value())

bytes = sketch1.to_bytes()

new_sketch = DataSketch()
new_sketch.from_bytes(bytes)

# print(new_sketch.read_value())

print(sketch1.read_value())
samples2 = SamplesArray()
samples2.samples = [(id, 1) for id in numbers2k]
sketch2 = DataSketch()
sketch2.update_from_samples(samples2)
print(sketch2.read_value())

print("compute", compute_dnf([sketch1, sketch2], [[1,-1], [-1,1], [1,1]]))