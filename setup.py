import pathlib
import setuptools

readme_filepath = pathlib.Path(__file__).parent / 'README.md'

setuptools.setup(name='simpledatasetlabeler',
                 version='0.1.1',
                 description="Simple labeling tool",
                 long_description=readme_filepath.read_text(),
                 long_description_content_type='text/markdown',
                 packages=setuptools.find_packages(),
                 package_data={'simpledatasetlabeler': ['frontend/*', 'frontend/static/*/*']},
                 install_requires=['flask', 'simpledataset'],
                 license='MIT',
                 url='https://github.com/shonohs/simpledataset_labeler',
                 classifiers=[
                     'Intended Audience :: Developers',
                     'License :: OSI Approved :: MIT License'
                 ],
                 entry_points={
                     'console_scripts': [
                         'dataset_labeler=simpledatasetlabeler.commands.labeler:main'
                     ]})
