import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import client from '../api';

export const get_metadata = createAsyncThunk('dataset/get_metadata', () => client.get_metadata());
export const get_image_labels = createAsyncThunk('labels/get_image_labels', (image_id) => client.get_image_labels(image_id));
export const add_annotation = createAsyncThunk('labels/add_annotation', (args, {getState}) => {
    const {image_id, annotation} = args;
    const existing_annotations = getState().labels[image_id];
    const new_annotations = [...existing_annotations, annotation];
    return client.put_image_labels(image_id, new_annotations);
});
export const remove_annotation = createAsyncThunk('labels/remove_annotation', (args, {getState}) => {
    const {image_id, annotation} = args;
    const existing_annotations = getState().labels[image_id];
    const annotation_json = JSON.stringify(annotation); // I know! this is not efficient...
    const new_annotations = existing_annotations.filter(x => JSON.stringify(x) !== annotation_json);
    return client.put_image_labels(image_id, new_annotations);
});

const dataset_slice = createSlice({
    name: 'dataset',
    initialState: {num_images: 0, labels: [], run_id: null},
    reducers: {

    },
    extraReducers: builder => {
        builder.addCase(get_metadata.fulfilled, (state, action) => {
            state.num_images = action.payload.num_images;
            state.labels = action.payload.labels;
            state.run_id = action.payload.run_id;
        });
    }
});


const labels_slice = createSlice({
    name: 'labels',
    initialState: {},
    reducers: {
    },
    extraReducers: builder => {
        builder.addCase(get_image_labels.fulfilled, (state, action) => {
            state[action.meta.arg] = action.payload;
        });
        builder.addCase(add_annotation.fulfilled, (state, action) => {
            state[action.meta.arg.image_id].push(action.meta.arg.annotation);
        });
        builder.addCase(remove_annotation.fulfilled, (state, action) => {
            const annotation_json = JSON.stringify(action.meta.arg.annotation);
            const index = state[action.meta.arg.image_id].findIndex(x => JSON.stringify(x) === annotation_json);
            state[action.meta.arg.image_id].splice(index, 1);
        })
    }
});


export default configureStore({
    reducer: {
        dataset: dataset_slice.reducer,
        labels: labels_slice.reducer
    }
})