#include "data-sketches-tests.hpp"

typedef sketch::SketchValueType FloatType;

TEST_CASE("Sketch initializing", "[data-sketches]") {
  constexpr uint16_t SKETCH_SIZE{1024};
  FloatType sketch[SKETCH_SIZE];

  sketch::initializeSketch(sketch, SKETCH_SIZE);

  for (uint16_t valueIndex = 0; valueIndex < SKETCH_SIZE; valueIndex++) {
    REQUIRE(sketch[valueIndex] == std::numeric_limits<FloatType>::infinity());
  }
}

TEST_CASE("Sketch estimating - simple elements counting", "[data-sketches]") {
  constexpr uint16_t SKETCH_SIZE{1024};
  FloatType sketch[SKETCH_SIZE];

  constexpr uint32_t DATA_STREAM_SIZE{128};
  sketch::Sample dataStream[DATA_STREAM_SIZE];
  for (uint32_t sampleId = 0; sampleId < DATA_STREAM_SIZE; sampleId++) {
    dataStream[sampleId] = {sampleId + 1, 1.0};
  }

  constexpr uint16_t SEED{17};
  constexpr FloatType MAX_ESTIMATION_ERROR_PERCENTAGE{0.1};

  sketch::initializeSketch(sketch, SKETCH_SIZE);
  sketch::updateSketchWithMultipleSamples(sketch, SKETCH_SIZE, dataStream, DATA_STREAM_SIZE, SEED);

  FloatType cardinality = sketch::estimateSingleCardinality(sketch, SKETCH_SIZE);
  FloatType expectedCardinality = static_cast<FloatType>(DATA_STREAM_SIZE);

  REQUIRE(fabs(expectedCardinality - cardinality) <= MAX_ESTIMATION_ERROR_PERCENTAGE * expectedCardinality);
}

TEST_CASE("Sketch updating - simple elements summing", "[data-sketches]") {
  constexpr uint16_t SKETCH_SIZE{1024};
  FloatType sketch[SKETCH_SIZE];

  constexpr uint32_t DATA_STREAM_SIZE{128};
  sketch::Sample dataStream[DATA_STREAM_SIZE];
  for (uint32_t sampleId = 0; sampleId < DATA_STREAM_SIZE; sampleId++) {
    dataStream[sampleId] = {sampleId + 1, static_cast<sketch::SketchValueType>(sampleId)};
  }

  constexpr uint16_t SEED{17};
  constexpr FloatType MAX_ESTIMATION_ERROR_PERCENTAGE{0.1};

  sketch::initializeSketch(sketch, SKETCH_SIZE);
  sketch::updateSketchWithMultipleSamples(sketch, SKETCH_SIZE, dataStream, DATA_STREAM_SIZE, SEED);

  FloatType cardinality = sketch::estimateSingleCardinality(sketch, SKETCH_SIZE);
  FloatType expectedCardinality = static_cast<FloatType>(DATA_STREAM_SIZE * (DATA_STREAM_SIZE + 1) / 2);

  REQUIRE(fabs(expectedCardinality - cardinality) <= MAX_ESTIMATION_ERROR_PERCENTAGE * expectedCardinality);
}

TEST_CASE("Sketch updating - batch of samples vs with single samples", "[data-sketches]") {
  constexpr uint16_t SKETCH_SIZE{1024};
  FloatType sketch1[SKETCH_SIZE];
  FloatType sketch2[SKETCH_SIZE];

  constexpr uint32_t DATA_STREAM_SIZE{128};
  sketch::Sample dataStream[DATA_STREAM_SIZE];
  for (uint32_t sampleId = 0; sampleId < DATA_STREAM_SIZE; sampleId++) {
    dataStream[sampleId] = {sampleId + 1, 1.0};
  }

  constexpr uint16_t SEED{17};
  constexpr FloatType MAX_ESTIMATION_DIFFERENCE{0.00001};

  sketch::initializeSketch(sketch1, SKETCH_SIZE);
  sketch::updateSketchWithMultipleSamples(sketch1, SKETCH_SIZE, dataStream, DATA_STREAM_SIZE, SEED);

  sketch::initializeSketch(sketch1, SKETCH_SIZE);
  for (uint32_t sampleNum = 0; sampleNum < DATA_STREAM_SIZE; sampleNum++) {
    sketch::updateSketchWithSingleSample(sketch2, SKETCH_SIZE, dataStream[sampleNum], SEED);
  }

  FloatType cardinality1 = sketch::estimateSingleCardinality(sketch1, SKETCH_SIZE);
  FloatType cardinality2 = sketch::estimateSingleCardinality(sketch2, SKETCH_SIZE);

  REQUIRE(fabs(cardinality1 - cardinality2) <= MAX_ESTIMATION_DIFFERENCE);
}

TEST_CASE("Sketch estimating - complex weighted cardinality estimating", "[data-sketches]") {
  constexpr uint16_t SKETCH_SIZE{1024};
  constexpr uint8_t SKETCHES_NUMBER{2};

  // numbers divisible by 2 and / or numbers divisible by 3
  FloatType** sketches = new FloatType*[SKETCHES_NUMBER];
  sketches[0] = new FloatType[SKETCH_SIZE];
  sketches[1] = new FloatType[SKETCH_SIZE];

  constexpr uint16_t SEED{17};
  constexpr FloatType MAX_ESTIMATION_ERROR_PERCENTAGE{0.1};

  sketch::initializeSketch(sketches[0], SKETCH_SIZE);
  sketch::initializeSketch(sketches[1], SKETCH_SIZE);

  uint32_t numberDivisableBy2AndBy3{0};
  uint32_t numberDivisableBy2OrBy3{0};

  constexpr uint32_t ALL_SAMPLES_NUMBER{32768};
  for (uint32_t sampleNum = 0; sampleNum < ALL_SAMPLES_NUMBER; sampleNum++) {
    if (sampleNum % 2 == 0 || sampleNum % 2 == 0) {
      numberDivisableBy2AndBy3++;
      sketch::updateSketchWithSingleSample(sketches[0], SKETCH_SIZE, sketch::Sample{sampleNum + 1, 1.0}, SEED);
    }

    if (sampleNum % 2 == 0 && sampleNum % 2 == 0) {
      numberDivisableBy2OrBy3++;
      sketch::updateSketchWithSingleSample(sketches[1], SKETCH_SIZE, sketch::Sample{sampleNum + 1, 1.0}, SEED);
    }
  }

  constexpr uint8_t DFNS1_NUMBER{3};
  ssize_t** dfns1 = new ssize_t*[DFNS1_NUMBER];
  for (uint8_t i = 0; i < DFNS1_NUMBER; i++) {
    dfns1[i] = new ssize_t[SKETCHES_NUMBER];
  }
  dfns1[0][0] = 1;
  dfns1[0][1] = -1;
  dfns1[0][0] = -1;
  dfns1[0][1] = 1;
  dfns1[0][0] = 1;
  dfns1[0][1] = 1;

  constexpr uint8_t DFNS2_NUMBER{1};
  ssize_t** dfns2 = new ssize_t*[DFNS2_NUMBER];
  for (uint8_t i = 0; i < DFNS2_NUMBER; i++) {
    dfns2[i] = new ssize_t[SKETCHES_NUMBER];
  }
  dfns2[0][0] = 1;
  dfns2[0][1] = 1;

  FloatType cardinalityDiv2OrDiv3 = sketch::estimateDnfCardinality(sketches, SKETCHES_NUMBER, SKETCH_SIZE, dfns1, DFNS1_NUMBER);
  FloatType cardinalityDiv2AndDiv3 = sketch::estimateDnfCardinality(sketches, SKETCHES_NUMBER, SKETCH_SIZE, dfns2, DFNS2_NUMBER);

  REQUIRE(fabs(numberDivisableBy2OrBy3 - cardinalityDiv2OrDiv3) <= MAX_ESTIMATION_ERROR_PERCENTAGE * numberDivisableBy2OrBy3);
  REQUIRE(fabs(numberDivisableBy2AndBy3 - cardinalityDiv2AndDiv3) <= MAX_ESTIMATION_ERROR_PERCENTAGE * numberDivisableBy2AndBy3);

  delete[] sketches[0];
  delete[] sketches[1];
  delete[] sketches;

  for (uint8_t i = 0; i < DFNS1_NUMBER; i++) {
    delete[] dfns1[i];
  }
  delete[] dfns1;

  for (uint8_t i = 0; i < DFNS2_NUMBER; i++) {
    delete[] dfns2[i];
  }
  delete[] dfns2;
}