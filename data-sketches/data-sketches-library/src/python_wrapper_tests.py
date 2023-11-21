from numpy import byte
from python_wrapper import *

SAMPLES_NUMBER = 8192

# data streams generating
numbers = [id for id in range(1, SAMPLES_NUMBER + 1)]
numbers2k = [num for num in numbers if num % 2 == 0]
numbers3k = [num for num in numbers if num % 3 == 0]
numbers6k = [num for num in numbers if num % 6 == 0]

samples = SamplesArray()

samples.samples = [(id, 1) for id in numbers6k]

sketch = DataSketch()

sketch.update_from_samples(samples)

print(sketch.read_value())

bytes = sketch.to_bytes()

new_sketch = DataSketch()
new_sketch.from_bytes(bytes)

print(new_sketch.read_value())