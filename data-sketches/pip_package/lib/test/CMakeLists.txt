cmake_minimum_required(VERSION 3.5)
project(data-sketches-tests)

include_directories(${EXPERT_HEADERS_DIR})

find_package(Catch2 REQUIRED PATHS ${CMAKE_BINARY_DIR})

file(GLOB_RECURSE _SRCS "*.cpp" "*.hpp")

add_executable(data-sketches-tests ${_SRCS})

target_link_libraries(data-sketches-tests data-sketches-library Catch2::Catch2)

install(TARGETS data-sketches-tests DESTINATION bin)