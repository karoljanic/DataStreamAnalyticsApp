#ifndef DATA_SKETCHES_HPP
#define DATA_SKETCHES_HPP

#include <cinttypes>

constexpr uint16_t SKETCH_SIZE{1024};

typedef double SketchValueType;

struct Sketch {
    SketchValueType values[SKETCH_SIZE];
};


Sketch createSketch();

#endif // DATA_SKETCHES_HPP