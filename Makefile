all: frontend
	python setup.py sdist bdist_wheel

frontend:
	cd frontend && npm install && npm run build && cd ../
	rm -rf simpledatasetlabeler/frontend && mv frontend/build simpledatasetlabeler/frontend

clean:
	rm -rf simpledatasetlabeler/frontend
	rm -rf dist build

.PHONY: all frontend clean
