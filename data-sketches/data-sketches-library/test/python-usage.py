import ctypes
import numpy

PATH_TO_LIBRARY = "../out/build/unixlike-clang-release/lib"
LIBRARY_NAME = "libdata-sketches-library.so"

SKETCH_SIZE = 1024
SEED = 79
SAMPLES_NUMBER = 8192


# include library
data_sketches_library = ctypes.CDLL(PATH_TO_LIBRARY + "/" + LIBRARY_NAME)

# define type of data stream elements for ctypes and numpy
class Sample(ctypes.Structure):
    _fields_ = [
        ("identifier", ctypes.c_uint32),
        ("value", ctypes.c_double)
    ]

    def __repr__(self):
        return f"[id: {self.identifier}  val: {self.value}]"


# define args and returns of library functions
data_sketches_library.initializeSketch.argtypes = ctypes.POINTER(ctypes.c_double), ctypes.c_uint16
data_sketches_library.initializeSketch.restype = None
initializeSketch = data_sketches_library.initializeSketch

data_sketches_library.updateSketch.argtypes = ctypes.POINTER(ctypes.c_double), ctypes.c_uint16, ctypes.POINTER(Sample), ctypes.c_size_t, ctypes.c_uint16
data_sketches_library.updateSketch.restype = None
updateSketch = data_sketches_library.updateSketch

data_sketches_library.estimateCardinality.argtypes = ctypes.POINTER(ctypes.c_double), ctypes.c_uint16
data_sketches_library.estimateCardinality.restype = ctypes.c_double
estimateCardinality = data_sketches_library.estimateCardinality

# data streams generating
numbers = [id for id in range(1, SAMPLES_NUMBER + 1)]
numbers2k = [num for num in numbers if num % 2 == 0]
numbers3k = [num for num in numbers if num % 3 == 0]
numbers6k = [num for num in numbers if num % 6 == 0]
numbers2kOr3k = [num for num in numbers if (num % 2 == 0 or num % 3 == 0)]
numbers2kAnd3k = [num for num in numbers if (num % 2 == 0 and num % 3 == 0)]
numbers3kNot6k = [num for num in numbers if (num % 3 == 0 and num % 6 != 0)]

numbersDataStream = (Sample * len(numbers))(*(Sample(id, 1.0) for id in numbers))
numbers2kDataStream = (Sample * len(numbers2k))(*(Sample(id, 1.0) for id in numbers2k))
numbers3kDataStream = (Sample * len(numbers3k))(*(Sample(id, 1.0) for id in numbers3k))
numbers6kDataStream = (Sample * len(numbers6k))(*(Sample(id, 1.0) for id in numbers6k))
numbers2kOr3kDataStream = (Sample * len(numbers2kOr3k))(*(Sample(id, 1.0) for id in numbers2kOr3k))
numbers2kAnd3kDataStream = (Sample * len(numbers2kAnd3k))(*(Sample(id, 1.0) for id in numbers2kAnd3k))
numbers3kNot6kDataStream = (Sample * len(numbers3kNot6k))(*(Sample(id, 1.0) for id in numbers3kNot6k))

# sketches initializing
sketch2k = numpy.zeros(SKETCH_SIZE, dtype=numpy.double)
sketch2k_ptr = sketch2k.ctypes.data_as(ctypes.POINTER(ctypes.c_double))
sketch3k = numpy.zeros(SKETCH_SIZE, dtype=numpy.double)
sketch3k_ptr = sketch3k.ctypes.data_as(ctypes.POINTER(ctypes.c_double))
sketch6k = numpy.zeros(SKETCH_SIZE, dtype=numpy.double)
sketch6k_ptr = sketch6k.ctypes.data_as(ctypes.POINTER(ctypes.c_double))
sketch2kOr3k = numpy.zeros(SKETCH_SIZE, dtype=numpy.double)
sketch2kOr3k_ptr = sketch2kOr3k.ctypes.data_as(ctypes.POINTER(ctypes.c_double))
sketch2kAnd3k = numpy.zeros(SKETCH_SIZE, dtype=numpy.double)
sketch2kAnd3k_ptr = sketch2kAnd3k.ctypes.data_as(ctypes.POINTER(ctypes.c_double))
sketch3kNot6k = numpy.zeros(SKETCH_SIZE, dtype=numpy.double)
sketch3kNot6k_ptr = sketch3kNot6k.ctypes.data_as(ctypes.POINTER(ctypes.c_double))

initializeSketch(sketch2k_ptr, SKETCH_SIZE)
initializeSketch(sketch3k_ptr, SKETCH_SIZE)
initializeSketch(sketch6k_ptr, SKETCH_SIZE)
initializeSketch(sketch2kOr3k_ptr, SKETCH_SIZE)
initializeSketch(sketch2kAnd3k_ptr, SKETCH_SIZE)
initializeSketch(sketch3kNot6k_ptr, SKETCH_SIZE)

updateSketch(sketch2k_ptr, SKETCH_SIZE, numbers2kDataStream, len(numbers2kDataStream), SEED)
updateSketch(sketch3k_ptr, SKETCH_SIZE, numbers3kDataStream, len(numbers3kDataStream), SEED)
updateSketch(sketch6k_ptr, SKETCH_SIZE, numbers6kDataStream, len(numbers6kDataStream), SEED)
updateSketch(sketch2kOr3k_ptr, SKETCH_SIZE, numbers2kOr3kDataStream, len(numbers2kOr3kDataStream), SEED)
updateSketch(sketch2kAnd3k_ptr, SKETCH_SIZE, numbers2kAnd3kDataStream, len(numbers2kAnd3kDataStream), SEED)
updateSketch(sketch3kNot6k_ptr, SKETCH_SIZE, numbers3kNot6kDataStream, len(numbers3kNot6kDataStream), SEED)

print("cardinality of 2k numbers:", len(numbers2k), estimateCardinality(sketch2k_ptr, SKETCH_SIZE))
print("cardinality of 3k numbers:", len(numbers3k), estimateCardinality(sketch3k_ptr, SKETCH_SIZE))
print("cardinality of 6k numbers:", len(numbers6k), estimateCardinality(sketch6k_ptr, SKETCH_SIZE))
#print("cardinality of 2k or 3k numbers:", len(numbers2kOr3k), estimateCardinality([sketch2k_ptr, sketch3k], [[1, -2], [-1, 2]]))
#print("cardinality of 2k and 6k numbers:", len(numbers2kAnd3k), estimateCardinality([sketch2k_ptr, sketch3k], [[1, 2]]))
#print("cardinality of 3k not 6k", len(numbers3kNot6k), estimateCardinality([sketch3k_ptr, sketch6k_ptr], [[1, -2]]))