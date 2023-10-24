import matplotlib.pyplot as plt

def drawSingleChart(streamSize, sketchData, title, xLabel, yLabel, outputFileName):
    plt.scatter(x=streamSizes, y=sketchData)
    plt.title(title)
    plt.xlabel(xLabel)
    plt.ylabel(yLabel)
    plt.savefig(outputFileName)
    plt.clf()


def drawDoubleSketchChart(streamSizes, expSketchData, fastExpSketchData, title, xLabel, yLabel, outputFileName):
    plt.scatter(x=streamSizes, y=expSketchData, label="ExpSketch")
    plt.scatter(x=streamSizes, y=fastExpSketchData, label="FastExpSketch")
    plt.title(title)
    plt.xlabel(xLabel)
    plt.ylabel(yLabel)
    plt.legend(loc="upper left")
    plt.savefig(outputFileName)
    plt.clf()


def drawDoubleImplementationChart(streamSizes, sketchImplementationPython, sketchImplementationCpp, title, xLabel, yLabel, outputFileName):
    plt.scatter(x=streamSizes, y=sketchImplementationPython, label="Python")
    plt.scatter(x=streamSizes, y=sketchImplementationCpp, label="C++")
    plt.title(title)
    plt.xlabel(xLabel)
    plt.ylabel(yLabel)
    plt.legend(loc="upper left")
    plt.savefig(outputFileName)
    plt.clf()


sketchSize = 0
reps = 0
streamSizes = []
allExpSketchComparisonsPython = []
allFastExpSketchComparisonsPython = []
allExpSketchTimesPython = []
allFastExpSketchTimesPython = []
allExpSketchComparisonsCpp = []
allFastExpSketchComparisonsCpp = []
allExpSketchTimesCpp = []
allFastExpSketchTimesCpp = []

with open("python-implementation.txt", "r") as file:
    lines = [line.strip().split() for line in file.readlines()]
    sketchSize = int(lines[0][1])
    reps = int(lines[1][1])

    sketchSizesNumber = (len(lines[2:]) - 2) // 2

    comparisionLines = lines[3:(3 + sketchSizesNumber)]
    timeLines = lines[(4 + sketchSizesNumber):(4 + 2 * sketchSizesNumber)]

    for i in range(sketchSizesNumber):
        streamSizes.append(int(comparisionLines[i][0]))
        allExpSketchComparisonsPython.append(float(comparisionLines[i][1]))
        allFastExpSketchComparisonsPython.append(float(comparisionLines[i][2]))
        allExpSketchTimesPython.append(float(timeLines[i][1]))
        allFastExpSketchTimesPython.append(float(timeLines[i][2]))


with open("cpp-implementation.txt", "r") as file:
    lines = [line.strip().split() for line in file.readlines()]
    sketchSize = int(lines[0][1])
    reps = int(lines[1][1])

    sketchSizesNumber = (len(lines[2:]) - 2) // 2

    comparisionLines = lines[3:(3 + sketchSizesNumber)]
    timeLines = lines[(4 + sketchSizesNumber):(4 + 2 * sketchSizesNumber)]

    for i in range(sketchSizesNumber):
        #streamSizes.append(int(comparisionLines[i][0]))
        allExpSketchComparisonsCpp.append(float(comparisionLines[i][1]))
        allFastExpSketchComparisonsCpp.append(float(comparisionLines[i][2]))
        allExpSketchTimesCpp.append(float(timeLines[i][1]))
        allFastExpSketchTimesCpp.append(float(timeLines[i][2]))


drawSingleChart(streamSizes, allExpSketchComparisonsPython, "Comparisons, ExpSketch, sketch size={}, reps={}, Python".format(sketchSize, reps),
    "Stream size", "Comparision number", "charts/python/comparisons-exp-sketch-python.png")

drawSingleChart(streamSizes, allFastExpSketchComparisonsPython, "Comparisons, FastExpSketch, sketch size={}, reps={}, Python".format(sketchSize, reps),
    "Stream size", "Comparision number", "charts/python/comparisons-fast-exp-sketch-python.png")

drawSingleChart(streamSizes, allExpSketchTimesPython, "Times, ExpSketch, sketch size={}, reps={}, Python".format(sketchSize, reps),
    "Stream size", "Elapsed time[s]", "charts/python/times-exp-sketch-python.png")

drawSingleChart(streamSizes, allFastExpSketchTimesPython, "Times, FastExpSketch, sketch size={}, reps={}, Python".format(sketchSize, reps),
    "Stream size", "Elapsed time[s]", "charts/python/times-fast-exp-sketch-python.png")

drawDoubleSketchChart(streamSizes, allExpSketchComparisonsPython, allFastExpSketchComparisonsPython, 
    "Comparisons, sketch size={}, reps={}, Python".format(sketchSize, reps), "Stream size", "Comparision number", "charts/python/comparisons-python.png")

drawDoubleSketchChart(streamSizes, allExpSketchTimesPython, allFastExpSketchTimesPython, 
    "Times, sketch size={}, reps={}, Python".format(sketchSize, reps), "Stream size", "Elapsed time[s]", "charts/python/times-python.png")


drawSingleChart(streamSizes, allExpSketchComparisonsCpp, "Comparisons, ExpSketch, sketch size={}, reps={}, C++".format(sketchSize, reps),
    "Stream size", "Comparision number", "charts/cpp/comparisons-exp-sketch-cpp.png")

drawSingleChart(streamSizes, allFastExpSketchComparisonsCpp, "Comparisons, FastExpSketch, sketch size={}, reps={}, C++".format(sketchSize, reps),
    "Stream size", "Comparision number", "charts/cpp/comparisons-fast-exp-sketch-cpp.png")

drawSingleChart(streamSizes, allExpSketchTimesCpp, "Times, ExpSketch, sketch size={}, reps={}, C++".format(sketchSize, reps),
    "Stream size", "Elapsed time[s]", "charts/cpp/times-exp-sketch-cpp.png")

drawSingleChart(streamSizes, allFastExpSketchTimesCpp, "Times, FastExpSketch, sketch size={}, reps={}, C++".format(sketchSize, reps),
    "Stream size", "Elapsed time[s]", "charts/cpp/times-fast-exp-sketch-cpp.png")

drawDoubleSketchChart(streamSizes, allExpSketchComparisonsCpp, allFastExpSketchComparisonsCpp, 
    "Comparisons, sketch size={}, reps={}, C++".format(sketchSize, reps), "Stream size", "Comparision number", "charts/cpp/comparisons-cpp.png")

drawDoubleSketchChart(streamSizes, allExpSketchTimesCpp, allFastExpSketchTimesCpp, 
    "Times, sketch size={}, reps={}, C++".format(sketchSize, reps), "Stream size", "Elapsed time[s]", "charts/cpp/times-cpp.png")

drawDoubleImplementationChart(streamSizes, allExpSketchTimesPython, allExpSketchTimesCpp,
    "Times, ExpSketch, sketch size={}, reps={}".format(sketchSize, reps), "Stream size", "Elapsed time[s]", "charts/times-exp-sketch-python-cpp.png")

drawDoubleImplementationChart(streamSizes, allFastExpSketchTimesPython, allFastExpSketchTimesCpp,
    "Times, FastExpSketch, sketch size={}, reps={}".format(sketchSize, reps), "Stream size", "Elapsed time[s]", "charts/times-fast-exp-sketch-python-cpp.png")