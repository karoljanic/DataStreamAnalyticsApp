#include "data-sketches-tests.hpp"

TEST_CASE("Sketch initializing", "[data-sketches]") {
  constexpr uint16_t SKETCH_SIZE{1024};
  double sketch[SKETCH_SIZE];

  sketch::initializeSketch(sketch, SKETCH_SIZE);

  for (uint16_t valueIndex = 0; valueIndex < SKETCH_SIZE; valueIndex++) {
    REQUIRE(sketch[valueIndex] == std::numeric_limits<double>::infinity());
  }
}

TEST_CASE("Sketch updating - simple elements counting", "[data-sketches]") {
  constexpr uint16_t SKETCH_SIZE{1024};
  double sketch[SKETCH_SIZE];

  constexpr uint32_t DATA_STREAM_SIZE{128};
  sketch::Sample dataStream[DATA_STREAM_SIZE];
  for (uint32_t sampleId = 0; sampleId < DATA_STREAM_SIZE; sampleId++) {
    dataStream[sampleId] = {sampleId + 1, 1.0};
  }

  constexpr uint16_t SEED{17};
  constexpr double MAX_ESTIMATION_ERROR_PERCENTAGE{0.1};

  sketch::initializeSketch(sketch, SKETCH_SIZE);
  sketch::updateSketch(sketch, SKETCH_SIZE, dataStream, DATA_STREAM_SIZE, SEED);

  double cardinality = sketch::estimateCardinality(sketch, SKETCH_SIZE);

  REQUIRE(fabs(static_cast<double>(DATA_STREAM_SIZE) - cardinality) <=
          MAX_ESTIMATION_ERROR_PERCENTAGE * static_cast<double>(DATA_STREAM_SIZE));
}