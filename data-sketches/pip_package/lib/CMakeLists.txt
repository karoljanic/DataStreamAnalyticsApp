cmake_minimum_required(VERSION 3.5)

project(data-sketches-library
        VERSION 1.0.0
        DESCRIPTION ""
        LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

set(SOURCES
    src/data-sketches.cpp
)

set(HEADERS
    include/data-sketches.hpp
)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++20 -O2")

set(CMAKE_INSTALL_PREFIX ${PROJECT_SOURCE_DIR})

add_library(data-sketches-library SHARED ${SOURCES})

target_include_directories(data-sketches-library PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)

set_target_properties(data-sketches-library PROPERTIES
    LIBRARY_OUTPUT_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR}/lib
)

set(ENABLE_DEVELOPER_MODE TRUE CACHE BOOL "Enable 'developer mode'")

set(OPT_WARNINGS_AS_ERRORS_DEVELOPER_DEFAULT TRUE)

if (CMAKE_VERSION VERSION_GREATER_EQUAL "3.24.0")
    cmake_policy(SET CMP0135 NEW)
endif ()

# if(NOT EXISTS "${CMAKE_BINARY_DIR}/conan.cmake")
#     message(STATUS "Downloading conan.cmake from https://github.com/conan-io/cmake-conan")
#     file(DOWNLOAD "https://raw.githubusercontent.com/conan-io/cmake-conan/0.18.1/conan.cmake"
#             "${CMAKE_BINARY_DIR}/conan.cmake"
#             TLS_VERIFY ON)
# endif()

# include(${CMAKE_BINARY_DIR}/conan.cmake)

# conan_cmake_autodetect(settings)

# conan_cmake_install(PATH_OR_REFERENCE ${PROJECT_SOURCE_DIR}
        # BUILD missing
        # SETTINGS ${settings})

# option(ENABLE_TESTING "Enable the tests" ${PROJECT_IS_TOP_LEVEL})
# if (ENABLE_TESTING)
#     enable_testing()
#     add_subdirectory(test)
# endif ()

add_compile_options(-Wall -Wextra -Werror -pedantic -fprofile-instr-generate -fcoverage-mapping)

if (CMAKE_SKIP_INSTALL_RULES)
    return()
elseif (NOT PROJECT_IS_TOP_LEVEL)
    return()
endif ()