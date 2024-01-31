#!/bin/bash

build_types=()
accepted_build_types=("release" "debug")

for arg in "$@"; do
    for acc in ${accepted_build_types[@]}; do
        if [[ $arg == $acc ]]; then
            build_types+=($arg)
        fi
    done
done

for build_type in ${build_types[@]}; do
    echo "Testing in ${build_type} mode..."
    ( cd ../out/build/unixlike-clang-${build_type}/test && ./data-sketches-tests)
done