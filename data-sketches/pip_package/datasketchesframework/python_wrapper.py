import ctypes
import pathlib

LIBRARY_NAME = "libdata-sketches-library.so"
PATH_TO_LIBRARY = pathlib.Path(__file__).parent.joinpath("lib/cmake/lib" + LIBRARY_NAME)

SKETCH_SIZE = 512
SEED = 1024

# define type of data stream elements for ctypes and numpy
class Sample(ctypes.Structure):
    _fields_ = [
        ("identifier", ctypes.c_uint32),
        ("value", ctypes.c_float)
    ]

    def __repr__(self):
        return f"[id: {self.identifier}  val: {self.value}]"

# include library
data_sketches_library = ctypes.CDLL(PATH_TO_LIBRARY)

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

Sample: tuple[int, int]

class SamplesArray:
    samples: list[Sample] = []

class DataSketch:
    def __init__(self) -> None:
        self.values = (ctypes.c_float * SKETCH_SIZE)()
        initializeSketch(self.values, SKETCH_SIZE)

    def update_from_sample(self, sample):
        updateSketchWithSingleSample(self.values, SKETCH_SIZE, sample, SEED)

    def update_from_samples(self, samples_collector: SamplesArray):
        sample_count = len(samples_collector.samples)
        samples = (Sample * sample_count)()
        for i in range(0, sample_count):
            id, value = samples_collector.samples[i]
            samples[i] = Sample(id,value)
        updateSketchWithMultipleSamples(self.values, SKETCH_SIZE, samples, sample_count, SEED)
    
    def read_value(self) -> float:
        x = estimateSingleCardinality(self.values, SKETCH_SIZE)
        return x

    def to_bytes(self) -> bytes:
        return bytes(self.values)
    
    def from_bytes(self, bytes: bytes):
        ctypes.memmove(self.values, bytes, ctypes.sizeof(ctypes.c_float) * SKETCH_SIZE)

# data_sketches_library.estimateDnfCardinality.argtypes = ctypes.POINTER(ctypes.POINTER(ctypes.c_float)), ctypes.c_size_t, ctypes.c_uint16, ctypes.POINTER(ctypes.POINTER(ctypes.c_ssize_t)), ctypes.c_size_t
# data_sketches_library.estimateDnfCardinality.restype = ctypes.c_float
# estimateDnfCardinality = data_sketches_library.estimateDnfCardinality

def compute_dnf(sketches: list[DataSketch], table: list[list[int]]):
    sketches_count = len(sketches)
    dnf_len = len(table)
    sketches_arr = (ctypes.POINTER(ctypes.c_float) * sketches_count)()
    dnf_arr = (ctypes.POINTER(ctypes.c_ssize_t) * dnf_len)()

    for i in range(sketches_count):
        sketches_arr[i] = sketches[i].values
    
    for i in range(dnf_len):
        form_arr = (ctypes.c_ssize_t * sketches_count)()
        for j in range(sketches_count):
            form_arr[j] = table[i][j]
        dnf_arr[i] = form_arr

    res = estimateDnfCardinality(sketches_arr, sketches_count, SKETCH_SIZE, dnf_arr, dnf_len)
    return res