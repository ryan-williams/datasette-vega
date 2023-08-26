import React, {useCallback, useEffect, useMemo, useRef, useState, MouseEvent} from 'react'
import vegaEmbed from 'vega-embed'
import {AxisType, AxisTypes, MarkerType, MarkerTypes, VegaAxisTypes} from "../pages"
import css from "./DatasetteVega.module.scss"
import {useResizeDetector} from "react-resize-detector";

export type Props = {
    jsonUrl: string
    markerType: MarkerType
    setMarkerType: (markerType: MarkerType) => void
    xColumn: number
    setXColumn: (xColumn: number) => void
    xType: AxisType
    setXType: (xType: AxisType) => void
    yColumn: number
    setYColumn: (yColumn: number) => void
    yType: AxisType
    setYType: (yType: AxisType) => void
    colorColumn: number | null
    setColorColumn: (colorColumn: number | null) => void
    colorType: AxisType
    setColorType: (colorType: AxisType) => void
    sizeColumn: number | null
    setSizeColumn: (sizeColumn: number | null) => void
    containerClass?: string
    wrapperClass?: string
    visDivClass?: string
}

type Row = { [k: string]: any }

function ColumnSelect(
    {
        label,
        value,
        setValue,
        columns,
        includeNone,
    }: {
        label: string,
        value: number | null,
        setValue: (value: number | null) => void
        columns: string[] | null
        includeNone?: boolean
    }
) {
    return (
        <label>
            {label}{' '}
            <div className="select-wrapper">
                <select value={value === null ? "" : value} onChange={e => setValue(e.target.value === '' ? null : parseInt(e.target.value))}>
                    {includeNone && <option value="">-- none --</option>}
                    {columns?.map((column, idx) => <option key={column} value={idx}>{columns[idx]}</option>)}
                </select>
            </div>
        </label>
    )
}

function AxisControlsRow(
    {
        label,
        column, setColumn,
        type, setType,
        columns,
        includeNone,
    }: {
        label: string
        column: number | null,
        setColumn: (column: number | null) => void
        type: AxisType
        setType: (type: AxisType) => void
        columns: string[] | null
        includeNone?: boolean
    }
) {
    return (
        <div className="filter-row" style={{ display: "flex", }}>
            <ColumnSelect label={label} value={column} setValue={setColumn} columns={columns} includeNone={includeNone} />
            <label>
                Type{' '}
                <div className="select-wrapper">
                    <select
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
        colorType, setColorType,
        sizeColumn, setSizeColumn,
        containerClass, wrapperClass, visDivClass,
    }: Props
) {
    const [ columns, setColumns ] = useState<string[] | null>(null)
    const wrapper = useResizeDetector();
    const chartRef = useRef<HTMLDivElement>(null)
    const jsonArrayUrl = useMemo(
        () =>`${jsonUrl}${/\?/.exec(jsonUrl) ? '&' : '?'}_shape=array`,
        [ jsonUrl ],
    )
    const xCol = useMemo(
        () => columns ? columns[xColumn] : undefined,
        [ xColumn, columns ],
    )
    const yCol = useMemo(
        () => columns ? columns[yColumn] : undefined,
        [ yColumn, columns ],
    )
    const colorCol = useMemo(
        () => columns && colorColumn !== null ? columns[colorColumn] : undefined,
        [ colorColumn, columns ],
    )
    const sizeCol = useMemo(
        () => columns && sizeColumn !== null ? columns[sizeColumn] : undefined,
        [ sizeColumn, columns ],
    )
    // Load jsonUrl (from localStorage), or fetch it
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
                }
            });
        },
        [ jsonArrayUrl, setColumns ],
    )

    // Build a Vega-lite spec, render chart in designated DOM element
    useEffect(
        () => {
            const ref = chartRef.current
            if (!ref || !xCol || !yCol) return
            const xt = VegaAxisTypes[xType]
            const yt = VegaAxisTypes[yType]
            const xBin = !!/, binned$/.exec(xType)
            const yBin = !!/, binned$/.exec(yType)
            const mark = markerType == 'Bar' ? 'bar' : markerType == 'Line' ? 'line' : 'circle'
            let encoding: any = {
                x: { field: xCol, type: xt, bin: xBin, },
                y: { field: yCol, type: yt, bin: yBin, },
            }
            if (colorCol) {
                encoding.color = { field: colorCol, type: VegaAxisTypes[colorType], }
            }
            if (sizeCol) {
                encoding.size = { field: sizeCol, type: "quantitative", }
            }
            console.log(
                "embed:", jsonArrayUrl, "xCol", xCol, "yCol", yCol, "encoding", encoding,
                "wrapper", wrapper.ref.current, "height", wrapper.height, wrapper.ref.current?.offsetHeight,
                "ref", ref, "height", ref?.offsetHeight,
            )
            vegaEmbed(
                ref,
                {
                    data: { url: jsonArrayUrl, },
                    mark: { type: mark, tooltip: { content: "data", }, },
                    encoding,
                    height: "container",
                    width: "container",
                    autosize: { type: "fit" },
                },
                { theme: 'quartz', tooltip: true, },
            )
        },
        [
            chartRef.current, chartRef.current?.offsetWidth, chartRef.current?.offsetHeight,
            jsonArrayUrl,
            xCol, xType,
            yCol, yType,
            colorCol, colorType,
            sizeCol,
            markerType,
            wrapper.width, wrapper.height, wrapper.ref.current,
        ]
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
                <form action="" method="GET" id="graphForm" className={css.datasetteVega}>
                    <h3>Charting options</h3>
                    <div className={`filter-row ${css.radioButtons}`}>{
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
                    <AxisControlsRow label={"X Column"} column={xColumn} setColumn={v => setXColumn(v || 0)} type={xType} setType={setXType} columns={columns} />
                    <AxisControlsRow label={"Y Column"} column={yColumn} setColumn={v => setYColumn(v || 0)} type={yType} setType={setYType} columns={columns} />
                    <div className={css.swapXY}>
                        <button onClick={swapAxes}>Swap X and Y</button>
                    </div>
                    <AxisControlsRow label={"Color"} column={colorColumn} setColumn={setColorColumn} type={colorType} setType={setColorType} columns={columns} includeNone={true} />
                    <div className="filter-row">
                        <ColumnSelect label={"Size"} value={sizeColumn} setValue={setSizeColumn} columns={columns} includeNone={true} />
                    </div>
                </form>
                <div ref={wrapper.ref} className={wrapperClass || ''}>
                    <div className={`${css.vegaEmbed} ${visDivClass}`} ref={chartRef}>
                        {/* Embedded chart gets rendered here */}
                    </div>
                </div>
            </div>
            : null
    );
}
