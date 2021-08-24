import { AppBar, Button, Container, Toolbar, Typography } from '@material-ui/core';
import { Route, BrowserRouter as Router, Link, Switch } from 'react-router-dom';
import HomeView from './home_view';
import ImageView from './image_view';
import { useEffect, useState } from 'react';
import { get_labels, get_num_images } from './redux/store';
import { useDispatch } from 'react-redux';
import './app.css';
import client from './api';
import { useSnackbar } from 'notistack';

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(get_num_images());
    dispatch(get_labels());
  }, [dispatch]);

  const {enqueueSnackbar} = useSnackbar();
  const [selected_label, set_selected_label] = useState(null);

  async function save() {
    await client.post_save();
    enqueueSnackbar("Saved");
  }

  async function stop() {
    enqueueSnackbar("Server is shutting down... Please close this window.")
    await client.post_stop();
    enqueueSnackbar("Server is successfully stopped."); // TODO: Server will return 500 here.
  }

  return (
    <div className="App">
      <Router>
        <AppBar position="static" color="transparent">
          <Toolbar variant="dense">
            <Typography id="logo" variant="h5" component={Link} to="/" color="inherit">Simple Dataset Labeler</Typography>
            <Button id="save_button" onClick={save}>Save</Button>
            <Button id="exit_button" onClick={stop}>Exit</Button>
          </Toolbar>
        </AppBar>
        <Container>
          <Switch>
            <Route path="/images/:image_id"><ImageView selected_label={selected_label} set_selected_label={set_selected_label} /></Route>
            <Route path="/" exact><HomeView /></Route>
          </Switch>
        </Container>
      </Router>
   </div>
  );
}

export default App;
