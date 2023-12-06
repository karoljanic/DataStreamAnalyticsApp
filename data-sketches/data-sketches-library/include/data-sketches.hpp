// Namespace containing functions for creating and operating on data sketches Fast-Exp-Sketch
// implemented on the basis of https://www.vldb.org/pvldb/vol16/p1967-lemiesz.pdf

#ifndef DATA_SKETCHES_HPP
#define DATA_SKETCHES_HPP

#include <sys/types.h>
#include <cinttypes>

namespace sketch {

  /// \brief Type definition for the identifier of a sample.
  typedef uint32_t SampleIdentifierType;

  /// \brief Type definition for the values in a sketch.
  typedef float SketchValueType;

  /// \brief Type definition for the size of a sketch.
  typedef uint16_t SketchSizeType;

  /// \brief Type definition for the seed used in sketch calculations.
  typedef uint16_t SeedType;

  /// \brief Structure representing a sample with an identifier and a value used to updating sketch.
  struct Sample {
    SampleIdentifierType identifier;
    SketchValueType value;
  };

  /// \brief Calculates the hash value for a given sample identifier, sketch value index, and seed.
  /// \param sampleIdentifier The identifier of the sample.
  /// \param sketchValueIndex The index of the sketch value.
  /// \param seed The seed used in the hash calculation.
  /// \return The calculated hash value from range [0, 1].
  SketchValueType calculateHash(SampleIdentifierType sampleIdentifier, SketchSizeType sketchValueIndex, SeedType seed);

  extern "C" {

  /// \brief Initializes a sketch with the specified size.
  /// \param sketch Pointer to the sketch array.
  /// \param sketchSize The size of the sketch.
  void initializeSketch(SketchValueType* const sketch, SketchSizeType sketchSize);

  /// \brief Updates the sketch with a single sample.
  /// \param sketch Pointer to the sketch.
  /// \param sketchSize The size of the sketch.
  /// \param sample The sample to be added to the sketch.
  /// \param seed The seed used in the update.
  void updateSketchWithSingleSample(SketchValueType* const sketch, SketchSizeType sketchSize, const Sample sample, SeedType seed);

  /// \brief Updates the sketch with multiple samples.
  /// \param sketch Pointer to the sketch.
  /// \param sketchSize The size of the sketch.
  /// \param samples Pointer to an array of samples.
  /// \param samplesNumber The number of samples.
  /// \param seed The seed used in the update.
  void updateSketchWithMultipleSamples(SketchValueType* const sketch, SketchSizeType sketchSize, const Sample* const samples,
                                       std::size_t samplesNumber, SeedType seed);

  /// \brief Estimates the cardinality of a single sketch.
  /// \param sketch Pointer to the sketch.
  /// \param sketchSize The size of the sketch.
  /// \return The estimated weighted cardinality.
  SketchValueType estimateSingleCardinality(SketchValueType* const sketch, SketchSizeType sketchSize);

  /// \brief Estimates the cardinality of sketches in disjunctive normal forms.
  /// \param sketches Pointer to an array of sketches.
  /// \param sketchesNumber The number of sketches in the array.
  /// \param sketchSize The size of each sketch.
  /// \param disjunctiveNormalForms Pointer to an array of DNFs.
  /// \param disjunctiveNormalFormsNumber The number of DNFs in the array.
  /// \return The estimated weighted cardinality.
  SketchValueType estimateDnfCardinality(SketchValueType** const sketches, std::size_t sketchesNumber, SketchSizeType sketchSize,
                                         ssize_t** disjunctiveNormalForms, std::size_t disjunctiveNormalFormsNumber);
  }

}  // namespace sketch

#endif  // DATA_SKETCHES_HPP