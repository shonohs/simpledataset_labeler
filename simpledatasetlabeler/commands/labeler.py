import argparse
import mimetypes
import pathlib
import threading
from simpledataset import SimpleDatasetFactory, DatasetWriter
import flask
import werkzeug.serving


class DatasetManager:
    def __init__(self, dataset, output_filepath):
        self._dataset = dataset
        self._data = dataset._data
        self._output_filepath = output_filepath
        self._image_read_lock = threading.Lock()
        self._updated = False

    def get_labels(self):
        return self._dataset.labels

    def get_image_binary(self, index):
        image_filepath = self._data[index][0]
        filename = image_filepath.split('@')[-1]
        content_type = mimetypes.guess_type(filename)[0]
        with self._image_read_lock:
            return content_type, self._dataset.read_image_binary(image_filepath)

    def get_image_labels(self, index):
        return self._data[index][1]

    def set_image_labels(self, index, labels):
        if not isinstance(labels, list):
            raise RuntimeError("Invalid labels.")

        self._updated = True
        self._data[index] = self._data[index][0], labels

    def save(self):
        if self._updated:
            dataset = SimpleDatasetFactory().create(self._dataset.type, self._data, self._dataset.base_directory, label_names=self._dataset.labels)
            DatasetWriter().write(dataset, self._output_filepath)
            self._updated = False
            print(f"Saved the dataset to {self._output_filepath}")


def serve(input_filepath, output_filepath, host, port):
    print(f"Loading {input_filepath}...", end='')
    dataset = SimpleDatasetFactory().load(input_filepath)
    dataset_manager = DatasetManager(dataset, output_filepath)
    print("Loaded.")
    frontend_dir = pathlib.Path(__file__).parent.parent / 'frontend'

    app = flask.Flask(__name__, static_url_path='', static_folder=str(frontend_dir))

    @app.route('/')
    def index():
        return app.send_static_file('index.html')

    @app.route('/api/labels')
    def get_labels():
        return flask.jsonify(dataset_manager.get_labels())

    @app.route('/api/images/count')
    def get_images():
        return {'count': len(dataset)}

    @app.route('/api/images/<int:index>')
    def get_image_binary(index):
        content_type, image_binary = dataset_manager.get_image_binary(index)
        response = flask.make_response(image_binary)
        if content_type:
            response.headers.set('Content-Type', content_type)
        return response

    @app.route('/api/labels/<int:index>')
    def get_image_labels(index):
        return flask.jsonify(dataset_manager.get_image_labels(index))

    @app.route('/api/labels/<int:index>', methods=['PUT'])
    def set_image_labels(index):
        req = flask.request.json
        dataset_manager.set_image_labels(index, req)

    @app.route('/api/save', methods=['POST'])
    def save():
        dataset_manager.save()
        return {'state': 'success'}

    @app.route('/api/stop', methods=['POST'])
    def stop():
        raise KeyboardInterrupt

    try:
        werkzeug.serving.run_simple(host, port, app)
    except KeyboardInterrupt:
        dataset_manager.save()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('input_filepath', type=pathlib.Path)
    parser.add_argument('output_filepath', type=pathlib.Path)
    parser.add_argument('--host', default='0.0.0.0')
    parser.add_argument('--port', '-p', default=5000, type=int)

    args = parser.parse_args()

    if args.output_filepath.exists():
        parser.error(f"{args.output_filepath} already exists.")

    serve(args.input_filepath, args.output_filepath, args.host, args.port)


if __name__ == '__main__':
    main()
