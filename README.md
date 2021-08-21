# simpledataset-labeler

## Setup
```
pip install simpledatasetlabeler
```

## Usage
```
dataset_labeler <input_filepath> <output_filepath> [--host <hostname>] [--port <port_number>]
```
Then, open your favorite browser and access to the "http://localhost:5000".

## How to build
```
cd frontend && npm install && npm run build && cd ..
cp -r frontend/build simpledatasetlabeler/frontend
python seutp.py sdist bdist_wheel
```
