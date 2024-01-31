#!/bin/bash

build_types=()
accepted_build_types=("release" "debug")

if [[ $# -eq 0 ]]; then
    build_types+=("release")
fi

for arg in "$@"; do
    for acc in ${accepted_build_types[@]}; do
        if [[ $arg == $acc ]]; then
            build_types+=($arg)
        fi
    done
done

for build_type in ${build_types[@]}; do
    echo "Generating ${build_type} configuration..."
    cmake ../ --preset unixlike-clang-${build_type}
done
