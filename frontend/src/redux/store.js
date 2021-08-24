import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import client from '../api';

export const get_num_images = createAsyncThunk('dataset/get_num_images', () => client.get_num_images());
export const get_labels = createAsyncThunk('dataset/labels', () => client.get_labels());
export const get_image_labels = createAsyncThunk('labels/get_image_labels', (image_id) => client.get_image_labels(image_id));
export const add_annotation = createAsyncThunk('labels/add_annotation', (args, {getState}) => {
    const {image_id, annotation} = args;
    const existing_annotations = getState().labels[image_id];
    const new_annotations = [...existing_annotations, annotation];
    return client.put_image_labels(image_id, new_annotations);
});

const dataset_slice = createSlice({
    name: 'dataset',
    initialState: {num_images: 0, labels: []},
    reducers: {

    },
    extraReducers: builder => {
        builder.addCase(get_num_images.fulfilled, (state, action) => {
            state.num_images = action.payload;
        });
        builder.addCase(get_labels.fulfilled, (state, action) => {
            state.labels = action.payload;
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
    }
});


export default configureStore({
    reducer: {
        dataset: dataset_slice.reducer,
        labels: labels_slice.reducer
    }
})