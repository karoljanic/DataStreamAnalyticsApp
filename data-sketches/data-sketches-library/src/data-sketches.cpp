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
    // hash is calculated based on bitstring representation - such inputs give a uniform probability distribution
    const std::bitset<8 * sizeof(sampleIdentifier)> sampleIdentifierBits{sampleIdentifier};
    const std::bitset<8 * sizeof(sketchValueIndex)> sketchValueIndexBits{sketchValueIndex};
    const std::bitset<8 * sizeof(seed)> seedBits{seed};
    const std::string hashInput{sampleIdentifierBits.to_string() + sketchValueIndexBits.to_string() + seedBits.to_string()};

    const std::hash<std::string> stringHash{};

    // the result of the built-in hash function is scaled to provide a value between [0,1]
    return static_cast<SketchValueType>(stringHash(hashInput)) / pow(2, 8 * sizeof(size_t));
  }

  extern "C" {
  void initializeSketch(SketchValueType* const sketch, SketchSizeType sketchSize) {
    // values in sketch are set to the maximum
    for (SketchSizeType valueIndex = 0; valueIndex < sketchSize; valueIndex++) {
      sketch[valueIndex] = std::numeric_limits<SketchValueType>::infinity();
    }
  }

  void updateSketchWithSingleSample(SketchValueType* const sketch, SketchSizeType sketchSize, const Sample sample,
                                    SeedType seed) {
    // finding maximal value in sketch
    SketchValueType maxValue = sketch[0];
    for (SketchSizeType valueIndex = 1; valueIndex < sketchSize; valueIndex++) {
      if (sketch[valueIndex] > maxValue) {
        maxValue = sketch[valueIndex];
      }
    }

    const SampleIdentifierType sampleIdentifier{sample.identifier};
    const SketchValueType sampleValue{sample.value};

    // the seed of the generator is the id of the sample
    std::mt19937 generator{sampleIdentifier};

    SketchValueType e{0.0};
    bool updateMax = false;

    // initializing permutation with elements from [1, sketchSize]
    SketchSizeType permutation[sketchSize];
    for (SketchSizeType permutationIndex = 0; permutationIndex < sketchSize; permutationIndex++) {
      permutation[permutationIndex] = permutationIndex + 1;
    }

    for (SketchSizeType valueIndex = 1; valueIndex <= sketchSize; valueIndex++) {
      // compute next order statistic
      SketchValueType u = calculateHash(sampleIdentifier, permutation[valueIndex - 1], seed);
      e += (-log(u) / sampleValue / static_cast<SketchValueType>(sketchSize - valueIndex + 1));

      // break if current order statistic > maximal value
      if (e > maxValue) {
        break;
      }

      // obtain new value of valueIndex element in permutation using Fisher-Yates shuffle
      std::uniform_int_distribution<SketchSizeType> uniformDistribution{valueIndex, sketchSize};
      SketchSizeType randomPermutationPosition{uniformDistribution(generator)};
      SketchSizeType tmp{permutation[valueIndex - 1]};
      permutation[valueIndex - 1] = permutation[randomPermutationPosition - 1];
      permutation[randomPermutationPosition - 1] = tmp;
      SketchSizeType randomPosition{static_cast<SketchSizeType>(permutation[valueIndex - 1] - 1)};

      // check if current max in the sketch was changed
      if (sketch[randomPosition] == std::numeric_limits<SketchValueType>::infinity() &&
          maxValue == std::numeric_limits<SketchValueType>::infinity()) {
        updateMax = true;
      }
      else if (sketch[randomPosition] == std::numeric_limits<SketchValueType>::infinity() ||
               maxValue == std::numeric_limits<SketchValueType>::infinity()) {
        updateMax = false;
      }
      else if (fabs(sketch[randomPosition] - maxValue) < 10 * std::numeric_limits<SketchValueType>::epsilon()) {
        updateMax = true;
      }

      sketch[randomPosition] = std::min(sketch[randomPosition], e);
    }

    // if new maximal value was changed then compute new current maximal value
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

  void updateSketchWithMultipleSamples(SketchValueType* const sketch, SketchSizeType sketchSize, const Sample* const samples,
                                       std::size_t samplesNumber, SeedType seed) {
    // sketch is updated for each sample
    for (size_t sampleNum = 0; sampleNum < samplesNumber; sampleNum++) {
      updateSketchWithSingleSample(sketch, sketchSize, samples[sampleNum], seed);
    }
  }

  SketchValueType estimateSingleCardinality(SketchValueType* const sketch, SketchSizeType sketchSize) {
    // calculating sum of all sketch values
    SketchValueType sketchSum{0.0};
    for (SketchSizeType valueIndex = 0; valueIndex < sketchSize; valueIndex++) {
      sketchSum += sketch[valueIndex];
    }

    // result is estimated weighted cardinality
    return static_cast<SketchValueType>(sketchSize - 1) / sketchSum;
  }

  SketchValueType estimateDnfCardinality(SketchValueType** const sketches, std::size_t sketchesNumber, SketchSizeType sketchSize,
                                         ssize_t** disjunctiveNormalForms, std::size_t disjunctiveNormalFormsNumber) {

    std::size_t disjointIntersectionsCounter{0};
    for (size_t normalFormIndex = 0; normalFormIndex < disjunctiveNormalFormsNumber; normalFormIndex++) {
      std::vector<std::size_t> positiveSketcheIds{};
      std::vector<std::size_t> negativeSketcheIds{};

      // division of sketches into groups: those which are used and those whose complements are used
      for (std::size_t sketchIndex = 0; sketchIndex < sketchesNumber; sketchIndex++) {
        if (disjunctiveNormalForms[normalFormIndex][sketchIndex] == 1) {
          positiveSketcheIds.emplace_back(sketchIndex);
        }
        else if (disjunctiveNormalForms[normalFormIndex][sketchIndex] == -1) {
          negativeSketcheIds.emplace_back(sketchIndex);
        }
      }

      // running experiment sketchSize times
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

        // checking if all result of experiments from positive group are equal
        bool allPositiveAreEqual{true};
        if (!positiveExperiments.empty()) {
          for (std::size_t i = 1; i < positiveExperiments.size(); i++) {
            if (fabs(positiveExperiments[0] - positiveExperiments[i]) > 10 * std::numeric_limits<SketchValueType>::epsilon()) {
              allPositiveAreEqual = false;
              break;
            }
          }
        }

        // finding minimal result of experiment from negative group
        SketchValueType minNegative{std::numeric_limits<SketchValueType>::infinity()};
        for (std::size_t i = 0; i < negativeExperiments.size(); i++) {
          if (negativeExperiments[i] < minNegative) {
            minNegative = negativeExperiments[i];
          }
        }

        if (!positiveExperiments.empty()) {
          if (allPositiveAreEqual && positiveExperiments[0] < minNegative) {
            disjointIntersectionsCounter++;
          }
        }
      }
    }

    // calculating sum of minimal values in each sketch
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

    // result is estimated weighted cardinality
    return static_cast<double>(disjointIntersectionsCounter) / static_cast<double>(sketchSize) *
           static_cast<double>(sketchSize - 1) / sumOfMinimums;
  }
  }
}  // namespace sketch
