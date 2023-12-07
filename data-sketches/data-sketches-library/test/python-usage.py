import ctypes
import numpy

PATH_TO_LIBRARY = "../out/build/unixlike-clang-release/lib"
LIBRARY_NAME = "libdata-sketches-library.so"

SKETCH_SIZE = 51200
SEED = 79
SAMPLES_NUMBER = 8192

# Library config:
#   typedef uint32_t SampleIdentifierType;
#   typedef float SketchValueType;
#   typedef uint16_t SketchSizeType;
#   typedef uint16_t SeedType;


# include library
data_sketches_library = ctypes.CDLL(PATH_TO_LIBRARY + "/" + LIBRARY_NAME)

# define type of data stream elements for ctypes and numpy
class Sample(ctypes.Structure):
    _fields_ = [
        ("identifier", ctypes.c_uint32),
        ("value", ctypes.c_float)
    ]

    def __repr__(self):
        return f"[id: {self.identifier}  val: {self.value}]"


# define args and returns of library functions
data_sketches_library.initializeSketch.argtypes = ctypes.POINTER(ctypes.c_float), ctypes.c_uint16
data_sketches_library.initializeSketch.restype = None
initializeSketch = data_sketches_library.initializeSketch

data_sketches_library.updateSketchWithSingleSample.argtypes = ctypes.POINTER(ctypes.c_float), ctypes.c_uint16, Sample, ctypes.c_uint16
data_sketches_library.updateSketchWithSingleSample.restype = None
updateSketchWithSingleSample = data_sketches_library.updateSketchWithSingleSample

data_sketches_library.updateSketchWithMultipleSamples.argtypes = ctypes.POINTER(ctypes.c_float), ctypes.c_uint16, ctypes.POINTER(Sample), ctypes.c_size_t, ctypes.c_uint16
data_sketches_library.updateSketchWithMultipleSamples.restype = None
updateSketchWithMultipleSamples = data_sketches_library.updateSketchWithMultipleSamples

data_sketches_library.estimateSingleCardinality.argtypes = ctypes.POINTER(ctypes.c_float), ctypes.c_uint16
data_sketches_library.estimateSingleCardinality.restype = ctypes.c_float
estimateSingleCardinality = data_sketches_library.estimateSingleCardinality

data_sketches_library.estimateDnfCardinality.argtypes = ctypes.POINTER(ctypes.POINTER(ctypes.c_float)), ctypes.c_size_t, ctypes.c_uint16, ctypes.POINTER(ctypes.POINTER(ctypes.c_ssize_t)), ctypes.c_size_t
data_sketches_library.estimateDnfCardinality.restype = ctypes.c_float
estimateDnfCardinality = data_sketches_library.estimateDnfCardinality

# data streams generating
numbers = [id for id in range(1, SAMPLES_NUMBER + 1)]
numbers2k = [num for num in numbers if num % 2 == 0]
numbers3k = [num for num in numbers if num % 3 == 0]
numbers6k = [num for num in numbers if num % 6 == 0]
numbers2kOr3k = [num for num in numbers if (num % 2 == 0 or num % 3 == 0)]
numbers2kAnd3k = [num for num in numbers if (num % 2 == 0 and num % 3 == 0)]
numbers3kNot6k = [num for num in numbers if (num % 3 == 0 and num % 6 != 0)]
numbersNot2kNot3k = [num for num in numbers if (num % 2 != 0 and num % 3 != 0)]

numbersDataStream = (Sample * len(numbers))(*(Sample(id, 1.0) for id in numbers))
numbers2kDataStream = (Sample * len(numbers2k))(*(Sample(id, 1.0) for id in numbers2k))
numbers3kDataStream = (Sample * len(numbers3k))(*(Sample(id, 1.0) for id in numbers3k))
numbers6kDataStream = (Sample * len(numbers6k))(*(Sample(id, 1.0) for id in numbers6k))
numbers2kOr3kDataStream = (Sample * len(numbers2kOr3k))(*(Sample(id, 1.0) for id in numbers2kOr3k))
numbers2kAnd3kDataStream = (Sample * len(numbers2kAnd3k))(*(Sample(id, 1.0) for id in numbers2kAnd3k))
numbers3kNot6kDataStream = (Sample * len(numbers3kNot6k))(*(Sample(id, 1.0) for id in numbers3kNot6k))
numbersNot2kNot3kDataStream = (Sample * len(numbersNot2kNot3k))(*(Sample(id, 1.0) for id in numbersNot2kNot3k))

# initializing sketches structures
sketch2k = numpy.zeros(SKETCH_SIZE, dtype=numpy.double)
sketch2k_ptr = sketch2k.ctypes.data_as(ctypes.POINTER(ctypes.c_float))
sketch3k = numpy.zeros(SKETCH_SIZE, dtype=numpy.double)
sketch3k_ptr = sketch3k.ctypes.data_as(ctypes.POINTER(ctypes.c_float))
sketch6k = numpy.zeros(SKETCH_SIZE, dtype=numpy.double)
sketch6k_ptr = sketch6k.ctypes.data_as(ctypes.POINTER(ctypes.c_float))
sketch2kOr3k = numpy.zeros(SKETCH_SIZE, dtype=numpy.double)
sketch2kOr3k_ptr = sketch2kOr3k.ctypes.data_as(ctypes.POINTER(ctypes.c_float))
sketch2kAnd3k = numpy.zeros(SKETCH_SIZE, dtype=numpy.double)
sketch2kAnd3k_ptr = sketch2kAnd3k.ctypes.data_as(ctypes.POINTER(ctypes.c_float))
sketch3kNot6k = numpy.zeros(SKETCH_SIZE, dtype=numpy.double)
sketch3kNot6k_ptr = sketch3kNot6k.ctypes.data_as(ctypes.POINTER(ctypes.c_float))
sketchNot2kNot3k = numpy.zeros(SKETCH_SIZE, dtype=numpy.double)
sketchNot2kNot3k_ptr = sketchNot2kNot3k.ctypes.data_as(ctypes.POINTER(ctypes.c_float))

# initializing sketches values
initializeSketch(sketch2k_ptr, SKETCH_SIZE)
initializeSketch(sketch3k_ptr, SKETCH_SIZE)
initializeSketch(sketch6k_ptr, SKETCH_SIZE)
initializeSketch(sketch2kOr3k_ptr, SKETCH_SIZE)
initializeSketch(sketch2kAnd3k_ptr, SKETCH_SIZE)
initializeSketch(sketch3kNot6k_ptr, SKETCH_SIZE)
initializeSketch(sketchNot2kNot3k_ptr, SKETCH_SIZE)

# updating sketches values based on data streams
updateSketchWithMultipleSamples(sketch2k_ptr, SKETCH_SIZE, numbers2kDataStream, len(numbers2kDataStream), SEED)
updateSketchWithMultipleSamples(sketch3k_ptr, SKETCH_SIZE, numbers3kDataStream, len(numbers3kDataStream), SEED)
updateSketchWithMultipleSamples(sketch6k_ptr, SKETCH_SIZE, numbers6kDataStream, len(numbers6kDataStream), SEED)
updateSketchWithMultipleSamples(sketch2kOr3k_ptr, SKETCH_SIZE, numbers2kOr3kDataStream, len(numbers2kOr3kDataStream), SEED)
updateSketchWithMultipleSamples(sketch2kAnd3k_ptr, SKETCH_SIZE, numbers2kAnd3kDataStream, len(numbers2kAnd3kDataStream), SEED)
updateSketchWithMultipleSamples(sketch3kNot6k_ptr, SKETCH_SIZE, numbers3kNot6kDataStream, len(numbers3kNot6kDataStream), SEED)
updateSketchWithMultipleSamples(sketchNot2kNot3k_ptr, SKETCH_SIZE, numbersNot2kNot3kDataStream, len(numbersNot2kNot3kDataStream), SEED)

# estimating sketches cardinality
print("cardinality of 2k numbers:", len(numbers2k), estimateSingleCardinality(sketch2k_ptr, SKETCH_SIZE))
print("cardinality of 3k numbers:", len(numbers3k), estimateSingleCardinality(sketch3k_ptr, SKETCH_SIZE))
print("cardinality of 6k numbers:", len(numbers6k), estimateSingleCardinality(sketch6k_ptr, SKETCH_SIZE))
print("cardinality of 2k or 3k numbers:", len(numbers2kOr3k), estimateDnfCardinality((ctypes.POINTER(ctypes.c_float) * 3)(sketch2k_ptr, sketch3k_ptr), 2, SKETCH_SIZE, (ctypes.POINTER(ctypes.c_ssize_t) * 3)((ctypes.c_ssize_t * 3)(1, -1, 0), (ctypes.c_ssize_t * 3)(-1, 1, 0), (ctypes.c_ssize_t * 3)(1, 1, 0)), 3))
print("cardinality of 2k and 3k numbers:", len(numbers2kAnd3k), estimateDnfCardinality((ctypes.POINTER(ctypes.c_float) * 3)(sketch6k_ptr, sketch3k_ptr, sketch2k_ptr), 3, SKETCH_SIZE, (ctypes.POINTER(ctypes.c_ssize_t) * 1)((ctypes.c_ssize_t * 3)(0, 1, 1)), 1))
print("cardinality of 3k not 6k", len(numbers3kNot6k), estimateDnfCardinality((ctypes.POINTER(ctypes.c_float) * 2)(sketch3k_ptr, sketch6k_ptr), 2, SKETCH_SIZE, (ctypes.POINTER(ctypes.c_ssize_t) * 1)((ctypes.c_ssize_t * 2)(1, -1)), 1))
print("cardinality of not 2k not 3k", len(numbersNot2kNot3k), estimateDnfCardinality((ctypes.POINTER(ctypes.c_float) * 2)(sketch2k_ptr, sketch3k_ptr), 2, SKETCH_SIZE, (ctypes.POINTER(ctypes.c_ssize_t) * 1)((ctypes.c_ssize_t * 2)(-1, -1)), 1))


# comparison of one use updateSketchWithMultipleSamples with data stream of size k
# and k uses of updateSketchWithSingleSample with single sample
sketch6kv2 = numpy.zeros(SKETCH_SIZE, dtype=numpy.double)
sketch6kv2_ptr = sketch6k.ctypes.data_as(ctypes.POINTER(ctypes.c_float))
initializeSketch(sketch6kv2_ptr, SKETCH_SIZE)
for id in numbers6k:
    sample = Sample(id, 1.0)
    updateSketchWithSingleSample(sketch6kv2_ptr, SKETCH_SIZE, sample, SEED)
print("cardinality of 6k numbers(single samples counting):", len(numbers6k), estimateSingleCardinality(sketch6kv2_ptr, SKETCH_SIZE))
