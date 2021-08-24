import { useSelector } from "react-redux";
import { List, ListItem, ListItemText, Paper } from "@material-ui/core";
import { useCallback, useEffect, useState } from "react";


const KEYNAMES = {
    65: 'a',
    66: 'b',
    67: 'c',
    68: 'd',
    69: 'e',
    70: 'f',
    71: 'g',
    72: 'h',
    73: 'i',
    74: 'j',
    75: 'k',
    76: 'l',
    77: 'm',
    78: 'n',
    79: 'o',
    80: 'p',
    81: 'q',
    82: 'r',
    83: 's',
    84: 't',
    85: 'u',
    86: 'v',
    87: 'w',
    88: 'x',
    89: 'y',
    90: 'z',
    97: 'a',
    98: 'b',
    99: 'c',
    100: 'd',
    101: 'e',
    102: 'f',
    103: 'g',
    104: 'h',
    105: 'i',
    106: 'j',
    107: 'k',
    108: 'l',
    109: 'm',
    110: 'n',
    111: 'o',
    112: 'p',
    113: 'q',
    114: 'r',
    115: 's',
    116: 't',
    117: 'u',
    118: 'v',
    119: 'w',
    120: 'x',
    121: 'y',
    122: 'z'
};

export default function ShortcutKeyView(props) {
    const label_names = useSelector(state => state.dataset.labels);
    const [shortcut_keys, set_shortcut_keys] = useState({0: 81, 1: 87, 2: 69, 3: 82, 4: 65, 5: 83, 6: 68, 7: 70});
    const { selected_label, set_selected_label } = props;

    const key_shortcut_map = Object.keys(shortcut_keys).reduce((acc, key) => {acc[shortcut_keys[key]] = parseInt(key); return acc;}, {});
    const on_key_down = useCallback((e) => {
        if (e.keyCode in key_shortcut_map) {
            const selected_label_id = key_shortcut_map[e.keyCode];
            if (selected_label_id < label_names.length) {
                set_selected_label(selected_label_id);
            }
        }
    }, [key_shortcut_map, set_selected_label, label_names]);

    console.log(props.selected_label);

    useEffect(() => {
        window.addEventListener("keydown", on_key_down);
        return () => window.removeEventListener("keydown", on_key_down);
    }, [on_key_down]);

    return (<div>
        <Paper variant="outlined">
        <List dense>
        {label_names.map((n, i) => <ListItem button key={i} onClick={() => props.set_selected_label(i)} selected={selected_label === i}><ListItemText primary={n + ((i in shortcut_keys) ? "  (key: " + KEYNAMES[shortcut_keys[i]] + ")": "")}/></ListItem>)}
        </List>
        </Paper>
    </div>)
}