#include "../include/data-sketches.hpp"
#include <math.h>
#include <bitset>
#include <functional>
#include <iostream>
#include <limits>
#include <random>
#include <string>

namespace sketch {
  SketchValueType calculateHash(SampleIdentifierType sampleIdentifier, SketchSizeType sketchValueIndex, SeedType seed) {
    const std::bitset<8 * sizeof(sampleIdentifier)> sampleIdentifierBits{sampleIdentifier};
    const std::bitset<8 * sizeof(sketchValueIndex)> sketchValueIndexBits{sketchValueIndex};
    const std::bitset<8 * sizeof(seed)> seedBits{seed};

    const std::hash<std::string> stringHash{};

    return static_cast<SketchValueType>(
               stringHash(sampleIdentifierBits.to_string() + sketchValueIndexBits.to_string() + seedBits.to_string())) /
           pow(2, 8 * (sizeof(sampleIdentifier) + sizeof(sketchValueIndex) + sizeof(seed)));
  }

  extern "C" {
  void initializeSketch(SketchValueType* const sketch, SketchSizeType sketchSize) {
    for (SketchSizeType valueIndex = 0; valueIndex < sketchSize; valueIndex++) {
      sketch[valueIndex] = std::numeric_limits<SketchValueType>::infinity();
    }
  }

  void updateSketch(SketchValueType* const sketch, SketchSizeType sketchSize, const Sample* const samples,
                    std::size_t samplesNumber, SeedType seed) {

    SketchValueType maxValue = sketch[0];
    for (SketchSizeType valueIndex = 1; valueIndex < sketchSize; valueIndex++) {
      if (sketch[valueIndex] > maxValue) {
        maxValue = sketch[valueIndex];
      }
    }

    for (size_t sampleNum = 0; sampleNum < samplesNumber; sampleNum++) {
      const SampleIdentifierType sampleIdentifier{samples[sampleNum].identifier};
      const SketchValueType sampleValue{samples[sampleNum].value};

      std::mt19937 generator{sampleIdentifier};

      SketchValueType sum{0};
      bool updateMax = false;

      SketchSizeType permutation[sketchSize];
      for (SketchSizeType permutationIndex = 0; permutationIndex < sketchSize; permutationIndex++) {
        permutation[permutationIndex] = permutationIndex + 1;
      }

      for (SketchSizeType valueIndex = 1; valueIndex <= sketchSize; valueIndex++) {
        SketchValueType u = calculateHash(sampleIdentifier, permutation[valueIndex - 1], seed);
        SketchValueType e = -log(u) / sampleValue;
        sum += (e / static_cast<SketchValueType>(sketchSize - valueIndex + 1));

        if (sum > maxValue) {
          break;
        }

        std::uniform_int_distribution<SketchSizeType> uniformDistribution{valueIndex, sketchSize};
        SketchSizeType randomPermutationPosition{uniformDistribution(generator)};

        SketchSizeType tmp{permutation[valueIndex - 1]};
        permutation[valueIndex - 1] = permutation[randomPermutationPosition - 1];
        permutation[randomPermutationPosition - 1] = tmp;
        SketchSizeType randomPosition{static_cast<SketchSizeType>(permutation[valueIndex - 1] - 1)};

        if (sketch[randomPosition] == std::numeric_limits<SketchValueType>::infinity() &&
            maxValue == std::numeric_limits<SketchValueType>::infinity()) {
          updateMax = true;
        }
        else if (sketch[randomPosition] == std::numeric_limits<SketchValueType>::infinity() ||
                 maxValue == std::numeric_limits<SketchValueType>::infinity()) {
          updateMax = false;
        }
        else if (fabs(sketch[randomPosition] - maxValue) < 0.00001) {
          updateMax = true;
        }
        sketch[randomPosition] = std::min(sketch[randomPosition], sum);
      }

      if (updateMax) {
        SketchValueType newMax = sketch[0];
        for (SketchSizeType valueIndex = 1; valueIndex < sketchSize; valueIndex++) {
          if (sketch[valueIndex] > newMax) {
            newMax = sketch[valueIndex];
          }
        }
        maxValue = newMax;
      }
    }
  }

  SketchValueType estimateCardinality(SketchValueType* const sketch, SketchSizeType sketchSize) {
    SketchValueType sketchSum{0.0};
    for (SketchSizeType valueIndex = 0; valueIndex < sketchSize; valueIndex++) {
      sketchSum += sketch[valueIndex];
    }

    return static_cast<SketchValueType>(sketchSize - 1) / sketchSum;
  }
  }
}  // namespace sketch
