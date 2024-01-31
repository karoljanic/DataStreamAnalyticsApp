#include <bitset>
#include <cstdint>
#include <iostream>
#include <vector>

constexpr ssize_t SETS_NUMBER = 3;
constexpr ssize_t BITSET_SIZE = 1 << SETS_NUMBER;

enum class SetOperation {
  SET,
  UNION,
  INTERSECTION,
  DIFFERENCE,
  SYMMETRIC_DIFFERENCE,
  COMPLEMENT
};

struct ExpressionNode {
  ExpressionNode* left;
  ExpressionNode* right;
  SetOperation operation;
  ssize_t setIndex;
};

void createIndicators(std::vector<std::bitset<BITSET_SIZE>>& indicators) {
  for (ssize_t i = 0; i < SETS_NUMBER; i++) {
    indicators.emplace_back(std::bitset<BITSET_SIZE>(0));
  }

  ssize_t blockSize{1};
  ssize_t blockBeginStep{2};
  for (ssize_t i = 0; i < SETS_NUMBER; i++) {
    for (ssize_t j = 0; j < BITSET_SIZE; j += blockBeginStep) {
      for (ssize_t k = 0; k < blockSize; k++) {
        indicators[SETS_NUMBER - i - 1].set(BITSET_SIZE - (j + k) - 1);
      }
    }

    blockSize <<= 1;
    blockBeginStep <<= 1;
  }
}

void convertToFdnfUtil(const ExpressionNode* const ExpressionNode,
                       const std::vector<std::bitset<BITSET_SIZE>>& indicators,
                       std::bitset<BITSET_SIZE>& result) {
  switch (ExpressionNode->operation) {
    case SetOperation::SET: {
      result = indicators[ExpressionNode->setIndex];
      break;
    }
    case SetOperation::UNION: {
      std::bitset<BITSET_SIZE> leftTemporaryResult;
      convertToFdnfUtil(ExpressionNode->left, indicators, leftTemporaryResult);
      std::bitset<BITSET_SIZE> rightTemporaryResult;
      convertToFdnfUtil(ExpressionNode->right, indicators,
                        rightTemporaryResult);
      result = leftTemporaryResult | rightTemporaryResult;
      break;
    }
    case SetOperation::INTERSECTION: {
      std::bitset<BITSET_SIZE> leftTemporaryResult;
      convertToFdnfUtil(ExpressionNode->left, indicators, leftTemporaryResult);
      std::bitset<BITSET_SIZE> rightTemporaryResult;
      convertToFdnfUtil(ExpressionNode->right, indicators,
                        rightTemporaryResult);
      result = leftTemporaryResult & rightTemporaryResult;
      break;
    }
    case SetOperation::DIFFERENCE: {
      std::bitset<BITSET_SIZE> leftTemporaryResult;
      convertToFdnfUtil(ExpressionNode->left, indicators, leftTemporaryResult);
      std::bitset<BITSET_SIZE> rightTemporaryResult;
      convertToFdnfUtil(ExpressionNode->right, indicators,
                        rightTemporaryResult);
      result = leftTemporaryResult & ~rightTemporaryResult;
      break;
    }
    case SetOperation::SYMMETRIC_DIFFERENCE: {
      std::bitset<BITSET_SIZE> leftTemporaryResult;
      convertToFdnfUtil(ExpressionNode->left, indicators, leftTemporaryResult);
      std::bitset<BITSET_SIZE> rightTemporaryResult;
      convertToFdnfUtil(ExpressionNode->right, indicators,
                        rightTemporaryResult);
      result = leftTemporaryResult ^ rightTemporaryResult;
      break;
    }
    case SetOperation::COMPLEMENT: {
      std::bitset<BITSET_SIZE> temporaryResult;
      convertToFdnfUtil(ExpressionNode->left, indicators, temporaryResult);
      result = ~temporaryResult;
      break;
    }
  }
}

void extractClauses(const std::bitset<BITSET_SIZE>& result, ssize_t left,
                    ssize_t right, std::vector<std::vector<ssize_t>>& fdnf,
                    std::vector<ssize_t>& clause, ssize_t depth) {
  ssize_t range = right - left;
  ssize_t mid = range / 2;

  if (result.test(left)) {
    clause[depth] = 1;
  } else {
    clause[depth] = -1;
  }

  if (range == 0) {
    fdnf.push_back(clause);
  } else if (range == 1) {
    extractClauses(result, left, left, fdnf, clause, depth + 1);
    extractClauses(result, right, right, fdnf, clause, depth + 1);
  } else {
    extractClauses(result, left, left + mid, fdnf, clause, depth + 1);
    extractClauses(result, left + mid + 1, right, fdnf, clause, depth + 1);
  }
}

void convertToFdnf(const ExpressionNode* const ExpressionNode,
                   std::vector<std::vector<ssize_t>>& fdnf) {
  std::vector<std::bitset<BITSET_SIZE>> indicators;
  createIndicators(indicators);

  std::bitset<BITSET_SIZE> result;
  convertToFdnfUtil(ExpressionNode, indicators, result);

  std::cout << result << std::endl;

  std::vector<ssize_t> clause;
  clause.reserve(SETS_NUMBER);
  extractClauses(result, 0, BITSET_SIZE - 1, fdnf, clause, 0);

  // 01234567
  // 0123 4567
  // 01 23 45 67
  // 0 1 2 3 4 5 6 7
}

int main() {
  std::cout << "Sets number: " << SETS_NUMBER << std::endl;
  std::cout << "Bitset size: " << BITSET_SIZE << std::endl;

  ExpressionNode* a =
      new ExpressionNode{nullptr, nullptr, SetOperation::SET, 0};
  ExpressionNode* b =
      new ExpressionNode{nullptr, nullptr, SetOperation::SET, 1};
  ExpressionNode* c =
      new ExpressionNode{nullptr, nullptr, SetOperation::SET, 2};

  ExpressionNode* aUnionB = new ExpressionNode{a, b, SetOperation::UNION, 0};
  ExpressionNode* aUnionBIsectC =
      new ExpressionNode{aUnionB, c, SetOperation::INTERSECTION, 0};

  std::vector<std::vector<ssize_t>> fdnf;
  convertToFdnf(aUnionBIsectC, fdnf);

  // std::cout << "FDNF:" << fdnf.size();

  // for (const auto& clause : fdnf) {
  //   for (const auto& literal : clause) {
  //     if (literal == 1) {
  //       std::cout << "1";
  //     } else {
  //       std::cout << "0";
  //     }
  //   }
  //   std::cout << std::endl;
  // }

  return 0;
}

// A: [1, 1, 0, 0]
// B: [1, 0, 1, 0]

// A: [1, 1, 1, 1, 0, 0, 0, 0]
// B: [1, 1, 0, 0, 1, 1, 0, 0]
// C: [1, 0, 1, 0, 1, 0, 1, 0]

// D: [1, 0, 1, 0, 1, 0, 0, 0]
