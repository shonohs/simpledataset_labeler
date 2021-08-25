import { Grid, IconButton, Typography } from "@material-ui/core";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link, useHistory } from "react-router-dom";
import ImageAnnotator from './image_annotator';
import ShortcutKeyView from './shortcut_key_view';
import { get_image_labels } from "./redux/store";
import { NavigateNext, NavigateBefore } from "@material-ui/icons";


export default function ImageView(props) {
    const params = useParams();
    const image_id = parseInt(params.image_id);
    const num_images = useSelector(state => state.dataset.num_images);

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(get_image_labels(image_id));
    }, [dispatch, image_id]);

    const history = useHistory();
    const on_key_down = useCallback((e) => {
        if (e.keyCode === 32) {
            if (e.shiftKey) {
                if (image_id > 0) {
                    history.push("/images/" + (image_id - 1));
                }
            } else {
                if (image_id < num_images - 1) {
                    history.push("/images/" + (image_id + 1));
                }
            }
        }
    }, [image_id, history, num_images]);

    useEffect(() => {
        window.addEventListener("keydown", on_key_down);
        return () => window.removeEventListener("keydown", on_key_down);
    }, [on_key_down]);

    return (
        <div className="image_view">
            <Typography variant="h5">
                {image_id > 0 && <IconButton><Link to={"/images/" + (image_id - 1)}><NavigateBefore /></Link></IconButton>}
                {image_id} / {num_images}
                {image_id < num_images - 1 && <IconButton><Link to={"/images/" + (image_id + 1)}><NavigateNext /></Link></IconButton>}
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={9}>
                    <ImageAnnotator image_id={image_id} selected_label={props.selected_label} />
                </Grid>
                <Grid item xs={3}>
                    <Typography variant="h6">Labels</Typography>
                    <ShortcutKeyView selected_label={props.selected_label} set_selected_label={props.set_selected_label} />
                </Grid>
            </Grid>
        </div>
    )
}