from setuptools import setup, find_packages
from setuptools.command.install import install
from subprocess import check_call
import os

VERSION = '0.0.6'
DESCRIPTION = 'Library for operating on data sketches'
LONG_DESCRIPTION = 'This package is a implementation of paper "Efficient framework for operating on data sketches" authored by Jakub Lemiesz, Ph.D. \
The paper can be found here: https://www.vldb.org/pvldb/vol16/p1967-lemiesz.pdf. Package is a python wrapper for C++ library created by Karol Janic'

class CustomInstall(install):
    def run(self):
        # Run the default install command
        install.run(self)

        # Create the 'cmake' folder
        cmake_folder = os.path.join(self.install_lib, 'lib', 'cmake')
        print(cmake_folder)
        os.makedirs(cmake_folder, exist_ok=True)

        # Build libdatasketches
        check_call(["cmake", ".."], cwd=cmake_folder)
        check_call(["make"], cwd=cmake_folder)

        print("data-sketches-framework installation success!")

# Setting up
setup(
    name="datasketchesframework",
    version=VERSION,
    author="Karol Janic",
    author_email="<268414@student.pwr.edu.pl>",
    description=DESCRIPTION,
    long_description_content_type="text/markdown",
    long_description=LONG_DESCRIPTION,
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    install_requires=['numpy'],
    keywords=['python', 'data sketches', 'data stream', 'data analysis'],
    classifiers=[]
)