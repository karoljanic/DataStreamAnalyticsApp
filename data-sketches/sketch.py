import sys
import numpy as np
import random
import time

bitsInHash = sys.hash_info[0]

def hashFun(i, k, seed):
    hashStr = f"{bin(int(i))[2:]:0>32}{bin(int(k))[2:]:0>32}{bin(int(seed))[2:]:0>32}"
    
    return abs(hash(hashStr)) / 2 ** bitsInHash


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


def generateStream(streamSize):
    return np.array([[i, random.uniform(0.0, 1.0)] for i in range(1, streamSize + 1)], dtype=float)


# Test - estimate cardinality
sketchSize = 1024
seed = 7
samplesNumber = 4096
minSampleId = 1
maxSampleId = 100000

stream = np.array([[id, 1] for id in random.sample(range(minSampleId, maxSampleId), samplesNumber)])
stream1 = np.array([x for x in stream if x[0] % 3 == 0])
stream2 = np.array([x for x in stream if x[0] % 3 != 0])

sketch1, _ = createFastExpSketch(stream1, sketchSize, seed)
sketch2, _ = createFastExpSketch(stream2, sketchSize, seed)

print("cardinality of first group:", len(stream1), (len(sketch1) - 1) / sum(sketch1))
print("cardinality of second group:", len(stream2), (len(sketch2) - 1) / sum(sketch2))


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
