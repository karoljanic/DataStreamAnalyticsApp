import sys
import numpy as np
import random
import time

bitsInHash = sys.hash_info[0]

def hashFun(i, k, seed):
    hashStr = f'{bin(int(i))[2:]:0>32}{bin(int(k))[2:]:0>32}{bin(int(seed))[2:]:0>32}'
    
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

        random.seed(identifier)

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


# Test
# sketchSize = 5
# stream = np.array([[1, 0.4], [2, 0.5], [3, 0.3]])
# seed = 7

# print("ExpSketch: ", createExpSketch(stream, sketchSize, seed))
# print("FastExpSketch:", createFastExpSketch(stream, sketchSize, seed))


# Data generation
sketchSize = 1024
seed = 17
repeats = 10
streamSizes = [i for i in range(50, 1001, 50)]

allExpSketchComparisons = []
allExpSketchTimes = []

allFastExpSketchComparisons = []
allFastExpSketchTimes = []

for size in streamSizes:
    expSketchComparisons = []
    expSketchTimes = []

    fastExpSketchComparisons = []
    fastExpSketchTimes = []

    for i in range(repeats):
        stream = generateStream(size)

        startTime = time.time()
        sketch, comparisons = createExpSketch(stream, sketchSize, seed)
        endTime = time.time()
        elapsedTime = endTime - startTime

        expSketchComparisons.append(comparisons)
        expSketchTimes.append(elapsedTime)

        startTime = time.time()
        sketch, comparisons = createFastExpSketch(stream, sketchSize, seed)
        endTime = time.time()
        elapsedTime = endTime - startTime
        
        fastExpSketchComparisons.append(comparisons)
        fastExpSketchTimes.append(elapsedTime)
    
    allExpSketchComparisons.append(sum(expSketchComparisons) / repeats)
    allExpSketchTimes.append(sum(expSketchTimes) / repeats)
    allFastExpSketchComparisons.append(sum(fastExpSketchComparisons) / repeats)
    allFastExpSketchTimes.append(sum(fastExpSketchTimes) / repeats)

    print(size)


# Save data to file
with open("python-implementation.txt", "w") as file:
    file.write("sketch-size: {}\n".format(sketchSize))
    file.write("reps: {}\n".format(repeats))
    file.write("comparisions:\n")
    for i in range(len(streamSizes)):
        file.write("{} {} {}\n".format(streamSizes[i], allExpSketchComparisons[i], allFastExpSketchComparisons[i]))
    file.write("times:\n")
    for i in range(len(streamSizes)):
        file.write("{} {} {}\n".format(streamSizes[i], allExpSketchTimes[i], allFastExpSketchTimes[i]))
