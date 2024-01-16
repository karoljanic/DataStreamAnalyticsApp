#!/bin/bash

mkdir -p ../out/build/unixlike-clang-release

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

procs_number=$(nproc)

for build_type in ${build_types[@]}; do
    echo "Bulding in ${build_type} mode on $procs_number procs..."
    cmake --build ../out/build/unixlike-clang-${build_type} -- -j $procs_number
done
