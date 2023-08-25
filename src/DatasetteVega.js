import React, {useCallback, useEffect, useRef, useState} from 'react';
import vegaEmbed from 'vega-embed';
import './DatasetteVega.css';

const serialize = (obj, prefix) => Object.keys(obj).filter(key => obj[key]).map(
    key => `${prefix}.${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`
).join('&');

const unserialize = (s, prefix) => {
    if (s && s[0] === '#') {
        s = s.slice(1);
    }
    if (!s) {
        return {};
    }
    var obj = {};
    s.split('&').filter(bit => bit.slice(0, prefix.length + 1) === `${prefix}.`).forEach(bit => {
        let pair = bit.split('=');
        obj[decodeURIComponent(pair[0]).replace(new RegExp(`^${prefix}\\.`), '')] = decodeURIComponent(pair[1]);
    });
    return obj;
};

const escapeString = s => (s || '').replace(/"/g, '\\x22').replace(/'/g, '\\x27');

export default function DatasetteVega({ base_url, onFragmentChange }) {
    const [ show, setShow ] = useState(false)
    const [ columns, setColumns ] = useState([])
    const [ mark, setMark ] = useState(null)
    const [ x_column, setX_column ] = useState(null)
    const [ x_type, setX_type ] = useState("ordinal")
    const [ y_column, setY_column ] = useState(null)
    const [ y_type, setY_type ] = useState("quantitative")
    const [ color_column, setColor_column ] = useState("")
    const [ size_column, setSize_column ] = useState("")
    const chartRef = useRef(null)
    const markOptions = [
        {"value": "bar", "name": "Bar"},
        {"value": "line", "name": "Line"},
        {"value": "circle", "name": "Scatter"},
    ]
    const typeOptions = [
        {"value": "quantitative", "name": "Numeric"},
        {"value": "quantitative-bin", "name": "Numeric, binned"},
        {"value": "temporal", "name": "Date/time"},
        {"value": "temporal-bin", "name": "Date/time, binned"},
        {"value": "ordinal", "name": "Label"},
        {"value": "nominal", "name": "Category"},
    ]
    const jsonUrl = useCallback(
        () => {
            let url = base_url;
            if (/\?/.exec(url)) {
                url += '&';
            } else {
                url += '?';
            }
            url += '_shape=array';
            return url;
        },
        [ base_url ],
    )

    useEffect(
        // function componentDidMount() {
        () => {
            window.onpopstate = function onPopStateChange(ev) {
                window.lastPopEv = ev;
                const expected = '#' + serializeState();
                if (expected !== document.location.hash && this.state.mark) {
                    const state = unserialize(document.location.hash, 'g');
                    setMark(state.mark)
                    setX_column(state.x_column)
                    setX_type(state.x_type)
                    setY_column(state.y_column)
                    setY_type(state.y_type)
                    setColor_column(state.color_column)
                    setSize_column(state.size_column)
                }
            }
            // Load the columns
            let url = jsonUrl();
            fetch(url).then(r => r.json()).then(data => {
                if (data.length > 1) {
                    // Set columns to first item's keys
                    const columns = Object.keys(data[0]).map(key => {
                        // Do ANY of these rows have a .label property?
                        if (data.filter(d => (d[key] || '').label !== undefined).length) {
                            return `${key}.label`;
                        } else {
                            return key;
                        }
                    });
                    let initialState = {
                        columns: columns,
                        x_column: columns[0],
                        y_column: columns[1],
                    };
                    // Is there state in the URL? If so use that too
                    let urlState = unserialize(document.location.hash, 'g');
                    if (Object.keys(urlState).length) {
                        initialState = Object.assign(initialState, urlState);
                        // And show the widget
                        initialState.show = true;
                    }
                    this.setState(initialState, () => {
                        this.onPopStateChange();
                        this.renderGraph();
                    });
                }
            });
        },
        []
    )
    const serializeState = useCallback(
        () => serialize(
            { mark, x_column, x_type, y_column, y_type, color_column, size_column, },
            'g',
        ),
        [ mark, x_column, x_type, y_column, y_type, color_column, size_column, ],
    )
    function renderGraph() {
        const x_type = x_type.split('-bin')[0]
        const y_type = y_type.split('-bin')[0]
        const x_bin = !!/-bin$/.exec(x_type)
        const y_bin = !!/-bin$/.exec(y_type)
        let encoding = {
            x: { field: x_column, type: x_type, bin: x_bin, },
            y: { field: y_column, type: y_type, bin: y_bin, },
            tooltip: { field: "_tooltip_summary", type: "ordinal", },
        }
        if (color_column) {
            encoding.color = { field: color_column, type: "nominal", }
        }
        if (size_column) {
            encoding.size = { field: size_column, type: "quantitative", }
        }
        const spec = {
            data: {
                url: jsonUrl()
            },
            transform: [{
                calculate: `
          '${escapeString(x_column)}: ' + datum['${escapeString(x_column)}'] +
          ', ${escapeString(y_column)}: ' + datum['${escapeString(y_column)}'] +
          (${!!color_column} ? ', ${escapeString(color_column)}: ' + datum['${escapeString(color_column)}'] : '') +
          (${!!size_column} ? ', ${escapeString(size_column)}: ' + datum['${escapeString(size_column)}'] : '')
        `,
                as: "_tooltip_summary"
            }],
            mark,
            encoding,
        }
        if (spec.mark && spec.encoding.x.field && spec.encoding.y.field) {
            vegaEmbed(chartRef.current, spec, { theme: 'quartz', tooltip: true, })
            document.location.hash = '#' + serializeState()
            onFragmentChange && onFragmentChange()
            // Add to state so react debug tools can see it (for debugging):
            setSpec(spec)
            setShow(true)
        }
    }
    const toggleAxis = useCallback(
        e => {
            e.preventDefault();
            setX_column(y_column)
            setX_type(y_type)
            setY_column(x_column)
            setY_type(x_type)
        },
        [ x_column, x_type, y_column, y_type, ],
    )
    if (!show) {
        return <div className="datasette-vega-inactive">
            <button onClick={() => setShow(true)}>
                Show charting options
            </button>
        </div>;
    }
    return (
        (columns.length > 1)
            ? <div>
                <form action="" method="GET" id="graphForm" className="datasette-vega">
                    <h3>Charting options</h3>
                    <div className="filter-row radio-buttons">
                        {markOptions.map(option => (
                            <label key={option.value} value={option.value}>
                                <input
                                    type="radio"
                                    name="mark"
                                    value={option.value}
                                    checked={option.value === mark}
                                    onChange={e => setMark(e.target.value)}
                                />
                                {option.name}
                            </label>
                        ))}
                    </div>
                    <div className="filter-row">
                        <label>
                            X column
                            <div className="select-wrapper">
                                <select
                                    name="x_column"
                                    value={x_column || ''}
                                    onChange={e => setX_column(e.target.value)}
                                >{
                                    columns.map(column => <option key={column} value={column}>{column}</option>)
                                }</select>
                            </div>
                        </label>
                        <label>
                            Type
                            <div className="select-wrapper">
                                <select
                                    name="x_type"
                                    value={x_type}
                                    onChange={e => setX_type(e.target.value)}
                                >{
                                    typeOptions.map(option => <option key={option.value} value={option.value}>{option.name}</option>)
                                }</select>
                            </div>
                        </label>
                    </div>
                    <div className="filter-row">
                        <label>
                            Y column
                            <div className="select-wrapper">
                                <select
                                    name="y_column"
                                    value={y_column || ''}
                                    onChange={e => setY_column(e.target.value)}
                                >{
                                    columns.map(column => <option key={column} value={column}>{column}</option>)
                                }</select>
                            </div>
                        </label>
                        <label>
                            Type
                            <div className="select-wrapper">
                                <select
                                    name="y_type"
                                    value={y_type}
                                    onChange={e => setY_type(e.target.value)}
                                >{
                                    typeOptions.map(option => <option key={option.value} value={option.value}>{option.name}</option>)
                                }</select>
                            </div>
                        </label>
                    </div>
                    <div className="swap-x-y">
                        <button onClick={e => toggleAxis()}>Swap X and Y</button>
                    </div>
                    <div className="filter-row">
                        <label>
                            Color
                            <div className="select-wrapper">
                                <select
                                    name="color_column"
                                    value={color_column}
                                    onChange={e => setColor_column(e.target.value)}
                                >
                                    <option value="">-- none --</option>
                                    {
                                        columns.map(column => <option key={column} value={column}>{column}</option>)
                                    }
                                </select>
                            </div>
                        </label>
                        <label>
                            Size
                            <div className="select-wrapper">
                                <select
                                    name="size_column"
                                    value={size_column}
                                    onChange={e => setSize_column(e.target.value)}
                                >
                                    <option value="">-- none --</option>
                                    {
                                        columns.map(column => <option key={column} value={column}>{column}</option>)
                                    }
                                </select>
                            </div>
                        </label>
                    </div>
                </form>
                <div style={{overflow:'auto'}}>
                    <div ref={chartRef}></div>
                </div>
            </div>
            : null
    );
}
