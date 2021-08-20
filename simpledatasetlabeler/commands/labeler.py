import argparse
import http.server
import mimetypes
import os
import pathlib
import threading
from simpledataset import SimpleDatasetFactory, DatasetWriter


class DatasetManager:
    def __init__(self, dataset, output_filepath):
        self._dataset = dataset
        self._output_filepath = output_filepath
        self._image_read_lock = threading.Lock()
        self._updated = False

    def get_labels(self):
        return self._dataset.labels

    def get_image_binary(self, index):
        image_filepath = self._dataset[index]
        with self._image_read_lock:
            return self._dataset.read_image_binary(image_filepath)

    def get_image_labels(self, index):
        return self._dataset[index][1]

    def save(self):
        if self._updated:
            DatasetWriter().write(self._dataset, self._output_filepath)
            print(f"Saved the dataset to {self._output_filepath}")


class RequestHandler(http.server.BaseHTTPRequestHandler):
    manager = None
    static_file_directory = None

    def do_GET(self):
        if self.path.startswith('/api/'):
            self._handle_get_api()
        else:
            self._handle_get_file()

    def do_POST(self):
        if self.path.startswith('/api/'):
            self._handle_post_api()
        else:
            self.send_response(404)
            self.end_headers()

    def _handle_post_api(self):
        self.send_response(200)
        self.end_headers()

    def _handle_get_api(self):
        self.send_response(200)
        self.end_headers()

    def _handle_get_file(self):
        assert RequestHandler.static_file_directory is not None

        filepath = RequestHandler.static_file_directory
        paths = self.path.split('/') if self.path != '/' else ['index.html']
        for p in paths:
            if p in (os.curdir, os.pardir):
                self.send_response(400)
                self.end_headers()
                return

            filepath = filepath / p

        if not filepath.exists() or filepath.is_dir():
            self.send_response(404)
            self.end_headers()
            return

        file_contents = filepath.read_bytes()
        content_type = mimetypes.types_map.get(filepath.suffix, 'application/octet-stream')

        self.send_response(200)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(file_contents)))
        self.end_headers()
        self.wfile.write(file_contents)


def serve(input_filepath, output_filepath, host, port):
    print(f"Loading {input_filepath}...", end='')
    dataset = SimpleDatasetFactory().load(input_filepath)
    dataset_manager = DatasetManager(dataset, output_filepath)
    print("Loaded.")

    RequestHandler.manager = dataset_manager
    RequestHandler.static_file_directory = pathlib.Path(__file__).parent.parent / 'frontend'

    httpd = http.server.ThreadingHTTPServer((host, port), RequestHandler)
    try:
        print(f"Running on http://{host}:{port}/. (Ctrl-C to save and quit).")
        httpd.serve_forever()
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
