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
        else if (fabs(sketch[randomPosition] - maxValue) < SKETCH_VALUE_COMPARISON_EPSILON) {
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

  SketchValueType estimateSingleCardinality(SketchValueType* const sketch, SketchSizeType sketchSize) {
    SketchValueType sketchSum{0.0};
    for (SketchSizeType valueIndex = 0; valueIndex < sketchSize; valueIndex++) {
      sketchSum += sketch[valueIndex];
    }

    return static_cast<SketchValueType>(sketchSize - 1) / sketchSum;
  }

  SketchValueType estimateDnfCardinality(SketchValueType** const sketches, std::size_t sketchesNumber, SketchSizeType sketchSize,
                                         ssize_t** disjunctiveNormalForms, std::size_t disjunctiveNormalFormsNumber) {
    if (sketchesNumber < 1) {
      return 0;
    }

    std::size_t disjointIntersectionsCounter{0};
    for (size_t normalFormIndex = 0; normalFormIndex < disjunctiveNormalFormsNumber; normalFormIndex++) {
      std::vector<std::size_t> positiveSketcheIds{};
      std::vector<std::size_t> negativeSketcheIds{};

      for (std::size_t sketchIndex = 0; sketchIndex < sketchesNumber; sketchIndex++) {
        if (disjunctiveNormalForms[normalFormIndex][sketchIndex] == 1) {
          positiveSketcheIds.emplace_back(sketchIndex);
        }
        else if (disjunctiveNormalForms[normalFormIndex][sketchIndex] == -1) {
          negativeSketcheIds.emplace_back(sketchIndex);
        }
      }

      for (SketchSizeType experimentNum = 0; experimentNum < sketchSize; experimentNum++) {
        std::vector<SketchValueType> experiment{};
        for (std::size_t sketchIndex = 0; sketchIndex < sketchesNumber; sketchIndex++) {
          experiment.emplace_back(sketches[sketchIndex][experimentNum]);
        }

        std::vector<SketchValueType> positiveExperiments{};
        for (std::size_t posSketchIdPos = 0; posSketchIdPos < positiveSketcheIds.size(); posSketchIdPos++) {
          positiveExperiments.emplace_back(experiment[positiveSketcheIds[posSketchIdPos]]);
        }

        std::vector<SketchValueType> negativeExperiments{};
        for (std::size_t negSketchIdPos = 0; negSketchIdPos < negativeSketcheIds.size(); negSketchIdPos++) {
          negativeExperiments.emplace_back(experiment[negativeSketcheIds[negSketchIdPos]]);
        }

        bool allPositiveAreEqual{true};
        if (!positiveExperiments.empty()) {
          for (std::size_t i = 1; i < positiveExperiments.size(); i++) {
            if (fabs(positiveExperiments[0] - positiveExperiments[i]) > SKETCH_VALUE_COMPARISON_EPSILON) {
              allPositiveAreEqual = false;
              break;
            }
          }
        }

        SketchValueType minNegative{std::numeric_limits<SketchValueType>::infinity()};
        for (std::size_t i = 0; i < negativeExperiments.size(); i++) {
          if (negativeExperiments[i] < minNegative) {
            minNegative = negativeExperiments[i];
          }
        }

        if (positiveExperiments.empty()) {}
        else {
          if (allPositiveAreEqual && positiveExperiments[0] < minNegative) {
            disjointIntersectionsCounter++;
          }
        }
      }
    }

    SketchValueType sumOfMinimums{0};
    for (SketchSizeType valueIndex = 0; valueIndex < sketchSize; valueIndex++) {
      double minVal{sketches[0][valueIndex]};
      for (std::size_t sketchIndex = 1; sketchIndex < sketchesNumber; sketchIndex++) {
        if (sketches[sketchIndex][valueIndex] < minVal) {
          minVal = sketches[sketchIndex][valueIndex];
        }
      }

      sumOfMinimums += minVal;
    }

    return static_cast<double>(disjointIntersectionsCounter) / static_cast<double>(sketchSize) *
           static_cast<double>(sketchSize - 1) / sumOfMinimums;
  }
  }
}  // namespace sketch
