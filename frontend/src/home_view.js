import { Grid, Typography } from "@material-ui/core";
import Pagination from "@material-ui/lab/Pagination";
import { useState } from "react";
import { useSelector } from "react-redux";
import "./home_view.css";

const NUM_PER_PAGE = 100;

// TODO: Implement image cache.

export default function HomeView(props) {
    const num_images = useSelector(state => state.dataset.num_images);
    const [page, set_page] = useState(0);
    const start_index = page * NUM_PER_PAGE;
    const end_index = Math.min(num_images, (page + 1) * NUM_PER_PAGE);
    const image_indexes = Array.from(new Array(end_index - start_index), (x, i) => i + start_index);
    const page_count = Math.ceil(num_images / NUM_PER_PAGE);
    return (
        <div>
            <div className="header">
            <Typography variant="h5">Total {num_images} images</Typography>
            </div>
            <Grid container spacing={2}>
                {image_indexes.map((i) => <Grid item sm={3} xs={6} key={i} className="image_container"><img src={"/api/images/" + i} /></Grid>)}
            </Grid>

            <div className="footer">
                <Pagination count={page_count} page={page + 1} onChange={(e, value) => set_page(value - 1)} className="footer_pagination" />
            </div>
        </div>
    );
}