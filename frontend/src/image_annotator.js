import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './image_annotator.css';
import { add_annotation } from './redux/store';

function AnnotationBox(props) {
    const label_names = useSelector(state => state.dataset.labels);
    const x = Math.max(0, props.annotation[1]);
    const y = Math.max(0, props.annotation[2]);
    const x2 = Math.min(props.image_width, props.annotation[3]);
    const y2 = Math.min(props.image_height, props.annotation[4]);

    const style = {
        left: x * props.scale,
        top: y * props.scale,
        width: (x2 - x) * props.scale,
        height: (y2 - y) * props.scale
    };

    const name = label_names[props.annotation[0]];
    return (<div style={style} className="annotation_box">
        <div className="annotation_box_label">{name}</div>
    </div>);
}

function BoxCanvas(props) {
    const [is_active, set_is_active] = useState(false);
    const [start_xy, set_start_xy] = useState(null);
    const canvas_ref = useRef(null);
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const draw_box = useCallback((x, y, x2, y2) => {
        const ctx = canvas_ref.current.getContext('2d');
        ctx.clearRect(0, 0, canvas_ref.current.width, canvas_ref.current.height);
        ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
        ctx.fillRect(x / props.scale, y / props.scale, (x2 - x) / props.scale, (y2 - y) / props.scale);
    }, [props.scale]);

    const commit_box = useCallback((x, y, x2, y2) => {
        x = Math.min(x, x2);
        y = Math.min(y, y2);
        x2 = Math.max(x, x2);
        y2 = Math.max(y, y2);

        if (x === x2 || y === y2) {
            return;
        }

        if (props.selected_label === null) {
            enqueueSnackbar("Please select a tag first.");
            return;
        }

        dispatch(add_annotation({image_id: props.image_id, annotation: [props.selected_label, x / props.scale, y / props.scale, x2 / props.scale, y2 / props.scale]}));
    }, [dispatch, props.image_id, props.scale, props.selected_label, enqueueSnackbar]);

    const on_mouse_move = useCallback((e) => {
        if (!is_active || e.buttons === 0)
            return;

        if (is_active) {
            const {x, y} = e.target.getBoundingClientRect();
            const cur_x = e.pageX - x;
            const cur_y = e.pageY - y;
            const [start_x, start_y] = start_xy;
            draw_box(start_x, start_y, cur_x, cur_y);
        }
    }, [draw_box, is_active, start_xy]);

    const on_mouse_down = useCallback((e) => {
        set_is_active(true);
        const {x, y} = e.target.getBoundingClientRect();
        set_start_xy([e.pageX - x, e.pageY - y]);
    }, [set_is_active]);

    const on_mouse_up = useCallback((e) => {
        if (is_active) {
            set_is_active(false);
            const ctx = canvas_ref.current.getContext('2d');
            ctx.clearRect(0, 0, canvas_ref.current.width, canvas_ref.current.height);
            const {x, y} = e.target.getBoundingClientRect();
            const cur_x = e.pageX - x;
            const cur_y = e.pageY - y;
            const [start_x, start_y] = start_xy;
            commit_box(start_x, start_y, cur_x, cur_y);
        }
    }, [set_is_active, commit_box, is_active, start_xy]);

    useEffect(() => {
        window.addEventListener("mouseup", on_mouse_up);
        return () => window.removeEventListener("mouseup", on_mouse_up);
    }, [on_mouse_up]);

    return <canvas ref={canvas_ref} width={props.width} height={props.height} className="image_annotator_canvas" onMouseMove={on_mouse_move} onMouseDown={on_mouse_down} />;
}

export default function ImageAnnotator(props) {
    const image_ref = useRef(null);
    const image_labels = useSelector(state => state.labels[props.image_id]) || [];
    const [scale, set_scale] = useState(1);
    const [image_width, set_image_width] = useState(100);
    const [image_height, set_image_height] = useState(100);

    useEffect(() => {
        function resize_handler() {
            set_scale(image_ref.current.width / image_ref.current.naturalWidth);
        }
        window.addEventListener("resize", resize_handler);
        return () => window.removeEventListener("resize", resize_handler);
    }, [image_ref]);

    function on_load() {
        set_scale(image_ref.current.width / image_ref.current.naturalWidth);
        set_image_width(image_ref.current.naturalWidth);
        set_image_height(image_ref.current.naturalHeight);
    }

    return (
            <div className="image_annotator">
                <img ref={image_ref} className="image_annotator_img" src={"/api/images/" + props.image_id} onLoad={on_load} alt="annotation target" />
                {image_labels.map((v, i) => <AnnotationBox key={i} annotation={v} scale={scale} image_width={image_width} image_height={image_height} />)}
                <BoxCanvas scale={scale} width={image_width} height={image_height} image_id={props.image_id} selected_label={props.selected_label} />
            </div>
    );

}