# simpledataset-labeler
Simple browser-based interface for dataset labeling.

Currently only Object Detection task is supported.

WARNING: This is work in progress. Not stable yet.

## Setup
```
pip install simpledatasetlabeler
```

## Usage
```
dataset_labeler <input_filepath> <output_filepath> [--host <hostname>] [--port <port_number>] [--dataset_type {image_classification,object_detection}]
```
Then, open your favorite browser and access to the "http://localhost:5000". (If you specified --port option, access the specified port instead.)

## How to build a package
```
make
```
