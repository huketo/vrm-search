#!/bin/bash

# models 디렉토리에서 '.vrm' 확장자를 가진 파일들을 찾아서 models 배열에 저장
models=($(find models -name "*.vrm"))

# models 배열의 각 원소에 대해서 다음을 수행, node index.js -i <모델 파일 경로> 명령어를 실행
for model in ${models[@]}; do
    node index.js -i $model
done