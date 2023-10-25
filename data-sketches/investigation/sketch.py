import sys
import numpy as np
import random
import time

# PYTHONHASHSEED -> seed for hash generation
bitsInHash = sys.hash_info[0]

def hashFun(i, k, seed):
    hashStr = f"{bin(int(i))[2:]:0>32}{bin(int(k))[2:]:0>32}{bin(int(seed))[2:]:0>32}"
    
    return abs(hash(hashStr)) / 2 ** (bitsInHash - 1)


def createExpSketch(inputStream, sketchSize, seed):
    # initialize the sketch
    sketch = np.full(sketchSize, np.inf)

    #update the sketch
    sketch, comparisons = updateExpSketch(sketch, inputStream, seed)

    return sketch, comparisons


def updateExpSketch(sketch, inputStream, seed):
    sketchSize = len(sketch)
    comparisons = 0

    # process the stream
    for i in range(inputStream.shape[0]):
        identifier = inputStream[i][0]
        value = inputStream[i][1]

        u = np.vectorize(hashFun)(identifier, np.arange(1, sketchSize + 1), seed)
        e = -np.log(u) / value
        sketch = np.minimum(sketch, e)

        comparisons += sketchSize

    return sketch, comparisons


def createFastExpSketch(inputStream, sketchSize, seed):
    # initialize the sketch
    sketch = np.full(sketchSize, np.inf)

    #update the sketch
    sketch, comparisons = updateFastExpSketch(sketch, inputStream, seed)

    return sketch, comparisons


def updateFastExpSketch(sketch, inputStream, seed):
    sketchSize = len(sketch)
    comparisons = 0

    maxVal = max(sketch)

    # process the stream
    for i in range(inputStream.shape[0]):
        identifier = inputStream[i][0]
        value = inputStream[i][1]

        random.seed(int(identifier))

        s = 0
        updateMax = False
        perm = np.arange(1, sketchSize + 1)

        for k in range(1, sketchSize + 1):
            u = hashFun(identifier, perm[k - 1], seed)
            e = -np.log(u) / value
            s += (e / (sketchSize - k + 1))

            if s > maxVal:
                break

            r = random.randint(k, sketchSize)
            perm[k - 1], perm[r - 1] = perm[r - 1], perm[k - 1]
            j = perm[k - 1] - 1

            if sketch[j] == np.inf and maxVal == np.inf:
                updateMax = True
            elif sketch[j] == np.inf or maxVal == np.inf:
                updateMax = False
            elif abs(sketch[j] - maxVal) < 0.00001:
                updateMax = True
        
            sketch[j] = min(sketch[j], s)

            comparisons += 1

        if updateMax:
            maxVal = max(sketch)


    return sketch, comparisons


def estimateSingleSketchCardinality(sketch):
    return (len(sketch) - 1) / sum(sketch)


def estimateCardinality(sketches, dnfs):
    sketchSize = len(sketches[0])
    disjointIntersectionsCounter = 0

    for conjuction in dnfs:
        positiveSketches = [sketchId for sketchId in conjuction if sketchId > 0]
        negativeSketches = [-sketchId for sketchId in conjuction if sketchId < 0]

        for experimentNum in range(1, sketchSize + 1):
            experiment = [row[experimentNum - 1] for row in sketches]
            positiveExperiments = [experiment[sketch - 1] for sketch in positiveSketches]
            negativeExperiments = [experiment[sketch - 1] for sketch in negativeSketches]

            if(all(x == positiveExperiments[0] for x in positiveExperiments) and (len(negativeExperiments) == 0 or positiveExperiments[0] < min(negativeExperiments))):
                disjointIntersectionsCounter += 1

    U = [min(x) for x in zip(*sketches)]

    return disjointIntersectionsCounter / sketchSize * (sketchSize - 1) / sum(U)


def generateStream(streamSize):
    return np.array([[i, random.uniform(0.0, 1.0)] for i in range(1, streamSize + 1)], dtype=float)


# Test - estimate cardinality
sketchSize = 1024
seed = 7
samplesNumber = 8192

numbers = np.array([[id, 1] for id in range(1, samplesNumber + 1)])
numbers2k = np.array([num for num in numbers if num[0] % 2 == 0])
numbers3k = np.array([num for num in numbers if num[0] % 3 == 0])
numbers6k = np.array([num for num in numbers if num[0] % 6 == 0])
numbers2kOr3k = np.array([num for num in numbers if (num[0] % 2 == 0 or num[0] % 3 == 0)])
numbers2kAnd3k = np.array([num for num in numbers if (num[0] % 2 == 0 and num[0] % 3 == 0)])
numbers3kNot6k = np.array([num for num in numbers if (num[0] % 3 == 0 and num[0] % 6 != 0)])

sketch2k, _ = createFastExpSketch(numbers2k, sketchSize, seed)
sketch3k, _ = createFastExpSketch(numbers3k, sketchSize, seed)
sketch6k, _ = createFastExpSketch(numbers6k, sketchSize, seed)
sketch2kOr3k, _ = createFastExpSketch(numbers2kOr3k, sketchSize, seed)
sketch2kAnd3k, _ = createFastExpSketch(numbers2kAnd3k, sketchSize, seed)
sketch3kNot6k, _ = createFastExpSketch(numbers3kNot6k, sketchSize, seed)

print("cardinality of 2k numbers:", len(numbers2k), estimateSingleSketchCardinality(sketch2k))
print("cardinality of 3k numbers:", len(numbers3k), estimateSingleSketchCardinality(sketch3k))
print("cardinality of 6k numbers:", len(numbers6k), estimateSingleSketchCardinality(sketch6k))
print("cardinality of 2k or 3k numbers:", len(numbers2kOr3k), estimateCardinality([sketch2k, sketch3k], [[1, -2], [-1, 2]]))
print("cardinality of 2k and 6k numbers:", len(numbers2kAnd3k), estimateCardinality([sketch2k, sketch3k], [[1, 2]]))
print("cardinality of 3k not 6k", len(numbers3kNot6k), estimateCardinality([sketch3k, sketch6k], [[1, -2]]))


# Chart data generation
# sketchSize = 1024
# seed = 17
# repeats = 10
# streamSizes = [i for i in range(50, 1001, 50)]

# allExpSketchComparisons = []
# allExpSketchTimes = []

# allFastExpSketchComparisons = []
# allFastExpSketchTimes = []

# for size in streamSizes:
#     expSketchComparisons = []
#     expSketchTimes = []

#     fastExpSketchComparisons = []
#     fastExpSketchTimes = []

#     for i in range(repeats):
#         stream = generateStream(size)

#         startTime = time.time()
#         sketch, comparisons = createExpSketch(stream, sketchSize, seed)
#         endTime = time.time()
#         elapsedTime = endTime - startTime

#         expSketchComparisons.append(comparisons)
#         expSketchTimes.append(elapsedTime)

#         startTime = time.time()
#         sketch, comparisons = createFastExpSketch(stream, sketchSize, seed)
#         endTime = time.time()
#         elapsedTime = endTime - startTime
        
#         fastExpSketchComparisons.append(comparisons)
#         fastExpSketchTimes.append(elapsedTime)
    
#     allExpSketchComparisons.append(sum(expSketchComparisons) / repeats)
#     allExpSketchTimes.append(sum(expSketchTimes) / repeats)
#     allFastExpSketchComparisons.append(sum(fastExpSketchComparisons) / repeats)
#     allFastExpSketchTimes.append(sum(fastExpSketchTimes) / repeats)

#     print(size)


# # Save data to file
# with open("python-implementation.txt", "w") as file:
#     file.write("sketch-size: {}\n".format(sketchSize))
#     file.write("reps: {}\n".format(repeats))
#     file.write("comparisions:\n")
#     for i in range(len(streamSizes)):
#         file.write("{} {} {}\n".format(streamSizes[i], allExpSketchComparisons[i], allFastExpSketchComparisons[i]))
#     file.write("times:\n")
#     for i in range(len(streamSizes)):
#         file.write("{} {} {}\n".format(streamSizes[i], allExpSketchTimes[i], allFastExpSketchTimes[i]))
