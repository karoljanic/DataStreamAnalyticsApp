import ctypes

PATH_TO_LIBRARY = "../out/build/unixlike-clang-release/lib"
LIBRARY_NAME = "libdata-sketches-library.so"

SKETCH_SIZE = 512
SEED = 1024

# define type of data stream elements for ctypes and numpy
class Sample(ctypes.Structure):
    _fields_ = [
        ("identifier", ctypes.c_uint32),
        ("value", ctypes.c_double)
    ]

    def __repr__(self):
        return f"[id: {self.identifier}  val: {self.value}]"

# include library
data_sketches_library = ctypes.CDLL(PATH_TO_LIBRARY + "/" + LIBRARY_NAME)

# define args and returns of library functions
data_sketches_library.initializeSketch.argtypes = ctypes.POINTER(ctypes.c_double), ctypes.c_uint16
data_sketches_library.initializeSketch.restype = None
initializeSketch = data_sketches_library.initializeSketch

data_sketches_library.updateSketch.argtypes = ctypes.POINTER(ctypes.c_double), ctypes.c_uint16, ctypes.POINTER(Sample), ctypes.c_size_t, ctypes.c_uint16
data_sketches_library.updateSketch.restype = None
updateSketch = data_sketches_library.updateSketch

data_sketches_library.estimateSingleCardinality.argtypes = ctypes.POINTER(ctypes.c_double), ctypes.c_uint16
data_sketches_library.estimateSingleCardinality.restype = ctypes.c_double
estimateSingleCardinality = data_sketches_library.estimateSingleCardinality

data_sketches_library.estimateDnfCardinality.argtypes = ctypes.POINTER(ctypes.POINTER(ctypes.c_double)), ctypes.c_size_t, ctypes.c_uint16, ctypes.POINTER(ctypes.POINTER(ctypes.c_ssize_t)), ctypes.c_size_t
data_sketches_library.estimateDnfCardinality.restype = ctypes.c_double
estimateDnfCardinality = data_sketches_library.estimateDnfCardinality

class SamplesArray:
    samples: list[tuple[int, int]] = []


class DataSketch:
    values = (ctypes.c_double * SKETCH_SIZE)()

    def __init__(self) -> None:
        initializeSketch(self.values, SKETCH_SIZE)

    def update_from_samples(self, samples_collector: SamplesArray):
        sample_count = len(samples_collector.samples)
        samples = (Sample * sample_count)()
        for i in range(0, sample_count):
            id, value = samples_collector.samples[i]
            samples[i] = Sample(id,value)
        updateSketch(self.values, SKETCH_SIZE, samples, sample_count, SEED)
    
    def read_value(self) -> float:
        x = estimateSingleCardinality(self.values, SKETCH_SIZE)
        return x

    def to_bytes(self) -> bytes:
        return bytes(self.values)
    
    def from_bytes(self, bytes: bytes):
        ctypes.memmove(self.values, bytes, ctypes.sizeof(ctypes.c_double) * SKETCH_SIZE)


