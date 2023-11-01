#include "../include/data-sketches.hpp"
#include <math.h>
#include <limits>

Sketch createSketch() {
  Sketch sketch;

  for (uint16_t valIndex = 0; valIndex < SKETCH_SIZE; valIndex++) {
    sketch.values[valIndex] = std::numeric_limits<double>::infinity();
  }

  return sketch;
}