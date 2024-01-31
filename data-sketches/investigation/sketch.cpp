#include <math.h>
#include <bitset>
#include <chrono>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <limits>
#include <random>
#include <set>
#include <string>
#include <vector>

constexpr uint16_t SKETCH_SIZE{1024};
constexpr size_t REPS_NUMBER{10};
constexpr uint16_t SEED{17};

struct Sketch {
  double values[SKETCH_SIZE];
};

struct StreamElement {
  uint32_t id;
  double property;
};

double hashFun(uint32_t i, uint16_t k, uint16_t seed) {
  union {
    struct {
      uint32_t first;
      uint16_t second;
      uint16_t third;
    } in;
    uint64_t out;
  } converter;

  converter.in.first = i;
  converter.in.second = k;
  converter.in.third = seed;

  return static_cast<double>(
             std::hash<std::string>{}(std::to_string(converter.out))) /
         pow(2, 64);
}

size_t updateExpSketch(Sketch& sketch,
                       const std::vector<StreamElement>& inputStream,
                       size_t seed) {
  size_t comparisons{0};

  for (auto iter = inputStream.begin(); iter != inputStream.end(); ++iter) {
    for (size_t i = 1; i <= SKETCH_SIZE; i++) {
      double u = hashFun(iter->id, i, seed);
      double e = -log(u) / iter->property;
      sketch.values[i - 1] = std::min(sketch.values[i - 1], e);
    }

    comparisons += SKETCH_SIZE;
  }

  return comparisons;
}

size_t createExpSketch(Sketch& sketch,
                       const std::vector<StreamElement>& inputStream,
                       size_t seed) {
  for (size_t i = 0; i < SKETCH_SIZE; i++) {
    sketch.values[i] = std::numeric_limits<double>::infinity();
  }

  size_t comparisons = updateExpSketch(sketch, inputStream, seed);

  return comparisons;
}

size_t updateFastExpSketch(Sketch& sketch,
                           const std::vector<StreamElement>& inputStream,
                           size_t seed) {
  size_t comparisons{0};

  double maxVal = sketch.values[0];
  for (size_t i = 1; i < SKETCH_SIZE; i++) {
    if (sketch.values[i] > maxVal) {
      maxVal = sketch.values[i];
    }
  }

  for (auto iter = inputStream.begin(); iter != inputStream.end(); ++iter) {
    std::mt19937 gen{iter->id};

    double s = 0.0;
    bool updateMax = false;
    size_t perm[SKETCH_SIZE];
    for (size_t i = 0; i < SKETCH_SIZE; i++) {
      perm[i] = i + 1;
    }

    for (size_t k = 1; k <= SKETCH_SIZE; k++) {
      double u = hashFun(iter->id, perm[k - 1], seed);
      double e = -log(u) / iter->property;
      s += (e / static_cast<double>(SKETCH_SIZE - k + 1));

      if (s > maxVal) {
        break;
      }

      std::uniform_int_distribution<size_t> dist{k, SKETCH_SIZE};
      size_t r{dist(gen)};

      size_t tmp{perm[k - 1]};
      perm[k - 1] = perm[r - 1];
      perm[r - 1] = tmp;
      size_t j{perm[k - 1] - 1};

      if (sketch.values[j] == std::numeric_limits<double>::infinity() &&
          maxVal == std::numeric_limits<double>::infinity()) {
        updateMax = true;
      } else if (sketch.values[j] == std::numeric_limits<double>::infinity() ||
                 maxVal == std::numeric_limits<double>::infinity()) {
        updateMax = false;
      } else if (fabs(sketch.values[j] - maxVal) < 0.00001) {
        updateMax = true;
      }

      sketch.values[j] = std::min(sketch.values[j], s);

      comparisons++;
    }

    if (updateMax) {
      double newMax = sketch.values[0];
      for (size_t i = 1; i < SKETCH_SIZE; i++) {
        if (sketch.values[i] > newMax) {
          newMax = sketch.values[i];
        }
      }
      maxVal = newMax;
    }
  }

  return comparisons;
}

size_t createFastExpSketch(Sketch& sketch,
                           const std::vector<StreamElement>& inputStream,
                           size_t seed) {
  for (size_t i = 0; i < SKETCH_SIZE; i++) {
    sketch.values[i] = std::numeric_limits<double>::infinity();
  }

  size_t comparisons = updateFastExpSketch(sketch, inputStream, seed);

  return comparisons;
}

double estimateCardinality(const Sketch& sketch) {
  double sketchSum{0.0};
  for (uint16_t i = 0; i < SKETCH_SIZE; i++) {
    sketchSum += sketch.values[i];
  }

  return static_cast<double>(SKETCH_SIZE - 1) / sketchSum;
}

double estimateCardinality(const std::vector<Sketch>& sketches,
                           const std::vector<std::vector<ssize_t>>& dnfs) {
  size_t disjointIntersectionsCounter{0};

  for (auto component = dnfs.begin(); component != dnfs.end(); ++component) {
    std::vector<size_t> positiveSketcheIds{};
    std::vector<size_t> negativeSketcheIds{};

    for (auto sketch = component->begin(); sketch != component->end();
         ++sketch) {
      if ((*sketch) > 0) {
        positiveSketcheIds.emplace_back((*sketch));
      } else {
        negativeSketcheIds.emplace_back(-(*sketch));
      }
    }

    for (uint16_t experimentNum = 0; experimentNum < SKETCH_SIZE;
         experimentNum++) {
      std::vector<double> experiment{};
      for (auto sketch = sketches.begin(); sketch != sketches.end(); ++sketch) {
        experiment.emplace_back(sketch->values[experimentNum]);
      }

      std::vector<double> positiveExperiments{};
      for (auto positiveSketchId = positiveSketcheIds.begin();
           positiveSketchId != positiveSketcheIds.end(); ++positiveSketchId) {
        positiveExperiments.emplace_back(experiment[(*positiveSketchId) - 1]);
      }

      std::vector<double> negativeExperiments{};
      for (auto negativeSketchId = negativeSketcheIds.begin();
           negativeSketchId != negativeSketcheIds.end(); ++negativeSketchId) {
        negativeExperiments.emplace_back(experiment[(*negativeSketchId) - 1]);
      }
      bool allPositiveAreEqual{true};
      for (size_t i = 1; i < positiveExperiments.size(); i++) {
        if (fabs(positiveExperiments[0] - positiveExperiments[i]) > 0.00001) {
          allPositiveAreEqual = false;
          break;
        }
      }

      bool negativeExperimentsIsEmpty{negativeExperiments.empty()};
      double minNegative{0};

      if (!negativeExperimentsIsEmpty) {
        minNegative = negativeExperiments[0];
        for (size_t i = 0; i < negativeExperiments.size(); i++) {
          if (negativeExperiments[i] < minNegative) {
            minNegative = negativeExperiments[i];
          }
        }
      }

      if (allPositiveAreEqual && (negativeExperimentsIsEmpty ||
                                  positiveExperiments[0] < minNegative)) {
        disjointIntersectionsCounter++;
      }
    }
  }

  double sumOfMinimums{0.0};
  for (uint16_t i = 0; i < SKETCH_SIZE; i++) {
    double minVal{sketches[0].values[i]};
    for (size_t j = 1; j < sketches.size(); j++) {
      if (sketches[j].values[i] < minVal) {
        minVal = sketches[j].values[i];
      }
    }

    sumOfMinimums += minVal;
  }

  return static_cast<double>(disjointIntersectionsCounter) /
         static_cast<double>(SKETCH_SIZE) *
         static_cast<double>(SKETCH_SIZE - 1) / sumOfMinimums;
}

std::vector<StreamElement> generateStream(uint32_t streamSize) {
  std::vector<StreamElement> stream{};
  std::mt19937 gen{std::random_device{}()};
  std::uniform_real_distribution<double> dist{0, 1};

  for (uint32_t i = 0; i < streamSize; i++) {
    stream.emplace_back(StreamElement{i + 1, dist(gen)});
  }

  return stream;
}

int main() {
  /* EXPRESSION TREE TO FDNF CONVERSION */

  /* TEST - ESTIMATE CARDINALITY */
  // const uint32_t samplesNumber{8192};

  // std::vector<StreamElement> numbers2k{};
  // std::vector<StreamElement> numbers3k{};
  // std::vector<StreamElement> numbers6k{};
  // std::vector<StreamElement> numbers2kOr3k{};
  // std::vector<StreamElement> numbers2kAnd3k{};
  // std::vector<StreamElement> numbers3kNot6k{};

  // for (uint32_t num = 1; num <= samplesNumber; num++) {
  //   if (num % 2 == 0) {
  //     numbers2k.emplace_back(StreamElement{num, 1});
  //   }

  //   if (num % 3 == 0) {
  //     numbers3k.emplace_back(StreamElement{num, 1});
  //   }

  //   if (num % 6 == 0) {
  //     numbers6k.emplace_back(StreamElement{num, 1});
  //   }

  //   if ((num % 2 == 0) || (num % 3 == 0)) {
  //     numbers2kOr3k.emplace_back(StreamElement{num, 1});
  //   }

  //   if ((num % 2 == 0) && (num % 3 == 0)) {
  //     numbers2kAnd3k.emplace_back(StreamElement{num, 1});
  //   }

  //   if ((num % 3 == 0) && (num % 6 != 0)) {
  //     numbers3kNot6k.emplace_back(StreamElement{num, 1});
  //   }
  // }

  // Sketch sketch2k{};
  // createFastExpSketch(sketch2k, numbers2k, SEED);
  // Sketch sketch3k{};
  // createFastExpSketch(sketch3k, numbers3k, SEED);
  // Sketch sketch6k{};
  // createFastExpSketch(sketch6k, numbers6k, SEED);
  // Sketch sketch2kOr3k{};
  // createFastExpSketch(sketch2kOr3k, numbers2kOr3k, SEED);
  // Sketch sketch2kAnd3k{};
  // createFastExpSketch(sketch2kAnd3k, numbers2kAnd3k, SEED);
  // Sketch sketch3kNot6k{};
  // createFastExpSketch(sketch3kNot6k, numbers3kNot6k, SEED);

  // std::cout << "cardinality of 2k numbers: " << numbers2k.size() << " "
  //           << estimateCardinality(sketch2k) << std::endl;
  // std::cout << "cardinality of 3k numbers: " << numbers3k.size() << " "
  //           << estimateCardinality(sketch3k) << std::endl;
  // std::cout << "cardinality of 6k numbers: " << numbers6k.size() << " "
  //           << estimateCardinality(sketch6k) << std::endl;
  // std::cout << "cardinality of 2kOr3k numbers: " << numbers2kOr3k.size() << " "
  //           << estimateCardinality({sketch2k, sketch3k}, {{1, -2}, {-1, 2}})
  //           << std::endl;
  // std::cout << "cardinality of 2kAnd3k numbers: " << numbers2kAnd3k.size()
  //           << " " << estimateCardinality({sketch2k, sketch3k}, {{1, 2}})
  //           << std::endl;
  // std::cout << "cardinality of 3kNot6k numbers: " << numbers3kNot6k.size()
  //           << " " << estimateCardinality({sketch3k, sketch6k}, {{1, -2}})
  //           << std::endl;

  /* CHART DATA GENERATION */
  // std::vector<uint32_t> streamSizes{};
  // for(uint32_t i = 50; i <= 1000; i += 50) {
  //     streamSizes.emplace_back(i);
  // }

  // std::vector<double> allExpSketchComparisons{};
  // std::vector<double> allExpSketchTimes{};
  // std::vector<double> allFastExpSketchComparisons{};
  // std::vector<double> allFastExpSketchTimes{};

  // for(auto iter = streamSizes.begin(); iter != streamSizes.end(); ++iter) {
  //     double sumOfExpSketchComparisons{0.0};
  //     double sumOfExpSketchTimes{0.0};
  //     double sumOfFastExpSketchComparisons{0.0};
  //     double sumOfFastExpSketchTimes{0.0};

  //     for(size_t rep = 0; rep < REPS_NUMBER; rep++) {
  //         auto stream = generateStream(*iter);
  //         Sketch sketch1, sketch2;
  //         size_t comparisons1, comparisons2;

  //         auto startTime = std::chrono::high_resolution_clock::now();
  //         comparisons1 = createExpSketch(sketch1, stream, SEED);
  //         auto midTime = std::chrono::high_resolution_clock::now();
  //         comparisons2 = createFastExpSketch(sketch2, stream, SEED);
  //         auto endTime = std::chrono::high_resolution_clock::now();

  //         sumOfExpSketchComparisons += comparisons1;
  //         sumOfFastExpSketchComparisons += comparisons2;
  //         sumOfExpSketchTimes += static_cast<double>(std::chrono::duration_cast<std::chrono::microseconds>(midTime - startTime).count()) / 1000000;
  //         sumOfFastExpSketchTimes += static_cast<double>(std::chrono::duration_cast<std::chrono::microseconds>(endTime - midTime).count()) / 1000000;
  //     }

  //     allExpSketchComparisons.emplace_back(sumOfExpSketchComparisons / REPS_NUMBER);
  //     allExpSketchTimes.emplace_back(sumOfExpSketchTimes / REPS_NUMBER);
  //     allFastExpSketchComparisons.emplace_back(sumOfFastExpSketchComparisons / REPS_NUMBER);
  //     allFastExpSketchTimes.emplace_back(sumOfFastExpSketchTimes / REPS_NUMBER);

  //     std::cout << *iter << std::endl;
  // }

  // // Save data to file
  // std::ofstream outputFile{"cpp-implementation.txt"};
  // outputFile << "sketch-size: " << SKETCH_SIZE << std::endl << "reps: " << REPS_NUMBER << std::endl;

  // outputFile << "comparisions:" << std::endl;
  // for(size_t i = 0; i < streamSizes.size(); i++) {
  //     outputFile << streamSizes[i] << " " << allExpSketchComparisons[i] << " " << allFastExpSketchComparisons[i] << std::endl;
  // }

  // outputFile << "times:" << std::endl;
  // for(size_t i = 0; i < streamSizes.size(); i++) {
  //     outputFile << streamSizes[i] << " " << allExpSketchTimes[i] << " " << allFastExpSketchTimes[i] << std::endl;
  // }

  return 0;
}