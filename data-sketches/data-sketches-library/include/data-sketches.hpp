#ifndef DATA_SKETCHES_HPP
#define DATA_SKETCHES_HPP

#include <sys/types.h>
#include <cinttypes>

namespace sketch {
  typedef uint32_t SampleIdentifierType;
  typedef double SketchValueType;
  typedef uint16_t SketchSizeType;
  typedef uint16_t SeedType;

  constexpr SketchValueType SKETCH_VALUE_COMPARISON_EPSILON{0.00001};

  struct Sample {
    SampleIdentifierType identifier;
    SketchValueType value;
  };

  SketchValueType calculateHash(SampleIdentifierType sampleIdentifier, SketchSizeType sketchValueIndex, SeedType seed);

  extern "C" {
  void initializeSketch(SketchValueType* const sketch, SketchSizeType sketchSize);
  void updateSketch(SketchValueType* const sketch, SketchSizeType sketchSize, const Sample* const samples,
                    std::size_t samplesNumber, SeedType seed);
  SketchValueType estimateSingleCardinality(SketchValueType* const sketch, SketchSizeType sketchSize);
  SketchValueType estimateDnfCardinality(SketchValueType** const sketches, std::size_t sketchesNumber, SketchSizeType sketchSize,
                                         ssize_t** disjunctiveNormalForms, std::size_t disjunctiveNormalFormsNumber);
  }

}  // namespace sketch

#endif  // DATA_SKETCHES_HPP