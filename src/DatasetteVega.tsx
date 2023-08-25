import React, {useCallback, useEffect, useMemo, useRef, useState, MouseEvent} from 'react'
import vegaEmbed from 'vega-embed'
import {AxisType, AxisTypes, MarkerType, MarkerTypes, VegaAxisTypes} from "../pages"

const escapeString = (s: string) => (s || '').replace(/"/g, '\\x22').replace(/'/g, '\\x27');

export type Props = {
    jsonUrl: string
    markerType: MarkerType
    setMarkerType: (markerType: MarkerType) => void
    xColumn: string | undefined
    setXColumn: (xColumn: string | undefined) => void
    xType: AxisType
    setXType: (xType: AxisType) => void
    yColumn: string | undefined
    setYColumn: (yColumn: string | undefined) => void
    yType: AxisType
    setYType: (yType: AxisType) => void
    colorColumn: string | undefined
    setColorColumn: (colorColumn: string | undefined) => void
    sizeColumn: string | undefined
    setSizeColumn: (sizeColumn: string | undefined) => void
    containerClass?: string
    wrapperClass?: string
    visDivClass?: string
}

type Row = any

function ColumnSelect(
    {
        label,
        value,
        setColumn,
        columns,
    }: {
        label: string,
        value: string | undefined,
        setColumn: (value: string | undefined) => void,
        columns: string[] | null,
    }
) {
    return (
        <label>
            {label}
            <div className="select-wrapper">
                <select
                    name={`${label.toLowerCase()}_column`}
                    value={value || ""}
                    onChange={e => setColumn(e.target.value)}
                >
                    <option value="">-- none --</option>
                    {
                        columns?.map(column => <option key={column} value={column}>{column}</option>)
                    }
                </select>
            </div>
        </label>
    )
}

function AxisControlsRow(
    {
        axis,
        column, setColumn,
        type, setType,
        columns,
    }: {
        axis: string
        column: string | undefined,
        setColumn: (column: string | undefined) => void,
        type: AxisType,
        setType: (type: AxisType) => void,
        columns: string[] | null,
    }
) {
    return (
        <div className="filter-row" style={{ display: "flex", }}>
            <label>
                {axis.toUpperCase()} Column
                <div className="select-wrapper">
                    <select
                        name={`${axis}_column`}
                        value={column || ''}
                        onChange={e => setColumn(e.target.value)}
                    >{
                        columns?.map(column => <option key={column} value={column}>{column}</option>)
                    }</select>
                </div>
            </label>
            <label>
                Type
                <div className="select-wrapper">
                    <select
                        name={`${axis}_type`}
                        value={type}
                        onChange={e => setType(e.target.value as AxisType)}
                    >{
                        AxisTypes.map(type => <option key={type} value={type}>{type}</option>)
                    }</select>
                </div>
            </label>
        </div>
    )
}

export default function DatasetteVega(
    {
        jsonUrl,
        markerType, setMarkerType,
        xColumn, setXColumn,
        xType, setXType,
        yColumn, setYColumn,
        yType, setYType,
        colorColumn, setColorColumn,
        sizeColumn, setSizeColumn,
        containerClass, wrapperClass, visDivClass,
    }: Props
) {
    const [ rows, setRows ] = useState<Row[] | null>(null)
    const [ columns, setColumns ] = useState<string[] | null>(null)

    const chartRef = useRef(null)
    const jsonArrayUrl = useMemo(
        () =>`${jsonUrl}${/\?/.exec(jsonUrl) ? '&' : '?'}_shape=array`,
        [ jsonUrl ],
    )

    useEffect(
        () => {
            const cachedStr = localStorage.getItem(jsonArrayUrl)
            const rowsPromise =
                cachedStr
                    ? Promise.resolve(JSON.parse(cachedStr)).then(rows => {
                        console.log(`Loaded ${rows.length} rows from cache, for ${jsonArrayUrl}`)
                        return rows
                    })
                    : fetch(jsonArrayUrl)
                        .then(r => r.json())
                        .then(rows => {
                            console.log(`Caching ${rows.length} rows from ${jsonArrayUrl}`)
                            localStorage.setItem(jsonArrayUrl, JSON.stringify(rows))
                            return rows
                        })

            // Load the columns
            rowsPromise.then(rows => {
                if (rows.length > 1) {
                    console.log("got rows:", rows)
                    setRows(rows)
                    // Set columns to first item's keys
                    const columns = Object.keys(rows[0]).map(key => {
                        // Do ANY of these rows have a .label property?
                        if (rows.filter((row: Row) => row[key]?.label !== undefined).length) {
                            return `${key}.label`;
                        } else {
                            return key;
                        }
                    });
                    setColumns(columns)
                    setXColumn(columns[0])
                    setYColumn(columns[0])
                }
            });
        },
        [ jsonArrayUrl, setRows, setColumns, setXColumn, setYColumn ],
    )

    useEffect(
        () => {
            const ref = chartRef.current
            if (!ref || !xColumn || !yColumn) return
            const xt = VegaAxisTypes[xType]
            const yt = VegaAxisTypes[yType]
            const xBin = !!/, binned$/.exec(xType)
            const yBin = !!/, binned$/.exec(yType)
            const mark = markerType == 'Bar' ? 'bar' : markerType == 'Line' ? 'line' : 'circle'
            let encoding: any = {
                x: { field: xColumn, type: xt, bin: xBin, },
                y: { field: yColumn, type: yt, bin: yBin, },
                tooltip: { field: "_tooltip_summary", type: "ordinal", },
            }
            if (colorColumn) {
                encoding.color = { field: colorColumn, type: "nominal", }
            }
            if (sizeColumn) {
                encoding.size = { field: sizeColumn, type: "quantitative", }
            }
            const xEsc = escapeString(xColumn)
            const yEsc = escapeString(yColumn)
            let calculate = `'${xEsc}: ' + datum['${xEsc}'] + ', ${yEsc}: ' + datum['${yEsc}']`
            if (colorColumn) {
                const colorEsc = escapeString(colorColumn)
                calculate += ` + ', ${colorEsc}: ' + datum['${colorEsc}']`
            }
            if (sizeColumn) {
                const sizeEsc = escapeString(sizeColumn)
                calculate += ` + ', ${sizeEsc}: ' + datum['${sizeEsc}']`
            }
            vegaEmbed(
                ref,
                {
                    data: { url: jsonArrayUrl, },
                    transform: [{ calculate,  as: "_tooltip_summary" }],
                    mark,
                    encoding,
                    width: "container",
                },
                { theme: 'quartz', tooltip: true, },
            )
        },
        [ chartRef.current, xColumn, xType, yColumn, yType, colorColumn, sizeColumn, markerType, ]
    )

    const swapAxes = useCallback(
        (e: MouseEvent) => {
            e.preventDefault();
            setXColumn(yColumn)
            setXType(yType)
            setYColumn(xColumn)
            setYType(xType)
        },
        [ xColumn, xType, yColumn, yType, ],
    )
    return (
        (columns?.length && columns?.length > 1)
            ? <div className={containerClass || ''}>
                <form action="" method="GET" id="graphForm" className="datasette-vega">
                    <h3>Charting options</h3>
                    <div className="filter-row radio-buttons">{
                        MarkerTypes.map(mt => (
                            <label key={mt}>
                                <input
                                    type="radio"
                                    name="mark"
                                    value={mt}
                                    checked={mt === markerType}
                                    onChange={e => setMarkerType(e.target.value as MarkerType)}
                                />
                                {mt}
                            </label>
                        ))
                    }</div>
                    <AxisControlsRow axis={"x"} column={xColumn} setColumn={setXColumn} type={xType} setType={setXType} columns={columns} />
                    <AxisControlsRow axis={"y"} column={yColumn} setColumn={setYColumn} type={yType} setType={setYType} columns={columns} />
                    <div className="swap-x-y">
                        <button onClick={swapAxes}>Swap X and Y</button>
                    </div>
                    <div className="filter-row">
                        <ColumnSelect label={"Color"} value={colorColumn} setColumn={setColorColumn} columns={columns} />
                        <ColumnSelect label={"Size"} value={sizeColumn} setColumn={setSizeColumn} columns={columns} />
                    </div>
                </form>
                <div className={wrapperClass || ''}>
                    <div className={visDivClass || ''} ref={chartRef}></div>
                </div>
            </div>
            : null
    );
}
