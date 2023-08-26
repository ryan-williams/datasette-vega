import React, {FormEvent, useCallback, useEffect, useMemo} from "react";
import {enumParam, Param, ParsedParam, parseQueryParams, intParam, optIntParam, urlParam} from "next-utils/params";
import css from "../styles/Home.module.scss";
import DatasetteVega from "../src/DatasetteVega";
import Head from "next/head";
import Link from "next/link";
import {getBasePath} from "next-utils/basePath";

const examples = {
    defaultUrl: "https://fivethirtyeight.datasettes.com/fivethirtyeight/nba-elo~2Fnbaallelo.json",
    gamePtsTeamId: "/?m=b&x=2&xt=c&y=11&c=9&ct=c",
    ptsResult: "/?m=s&x=17&y=11&c=21&ct=c&s=11",
    // https://fivethirtyeight.datasettes.com/fivethirtyeight/bad-drivers~2Fbad-drivers.json
    fatalCrashStats: "/?u=fivethirtyeight.datasettes.com%2Ffivethirtyeight%2Fbad-drivers~2Fbad-drivers.json&m=s&x=3&y=4&c=1&ct=c&s=2",
}

type Params = {
    u: Param<string>
    m: Param<MarkerType>
    x: Param<number>
    xt: Param<AxisType>
    y: Param<number>
    yt: Param<AxisType>
    c: Param<number | null>
    ct: Param<AxisType>
    s: Param<number | null>
}

type ParsedParams = {
    u: ParsedParam<string>
    m: ParsedParam<MarkerType>
    x: ParsedParam<number>
    xt: ParsedParam<AxisType>
    y: ParsedParam<number>
    yt: ParsedParam<AxisType>
    c: ParsedParam<number | null>
    ct: ParsedParam<AxisType>
    s: ParsedParam<number | null>
}

export type MarkerType = "Bar" | "Line" | "Scatter"
export const MarkerTypes = [ "Bar", "Line", "Scatter" ]
export type AxisType = "Numeric" | "Numeric, binned" | "Date/time" | "Date/time, binned" | "Label" | "Category"
export const AxisTypes = [ "Numeric", "Numeric, binned", "Date/time", "Date/time, binned", "Label", "Category" ]
export const AxisTypeQueryParams: { [k in AxisType]: string } = {
    "Numeric": 'n',
    "Numeric, binned": 'nb',
    "Date/time": 'd',
    "Date/time, binned": 'db',
    "Label": 'l',
    "Category": 'c'
}
export const VegaAxisTypes: { [k in AxisType]: string } = {
    "Numeric": 'quantitative',
    "Numeric, binned": 'quantitative',
    "Date/time": 'temporal',
    "Date/time, binned": 'temporal',
    "Label": 'ordinal',
    "Category": 'nominal'
}

export const DefaultXType = "Numeric"
export const DefaultYType = "Numeric"
export const DefaultColorType = "Numeric"

export default function Home() {
    const params: Params = {
        u: urlParam(examples.defaultUrl),
        m: enumParam<MarkerType>("Bar", { Bar: 'b', Line: 'l', Scatter: 's' }),
        x: intParam(0),
        xt: enumParam<AxisType>(DefaultXType, AxisTypeQueryParams),
        y: intParam(0),
        yt: enumParam<AxisType>(DefaultYType, AxisTypeQueryParams),
        c: optIntParam(),
        ct: enumParam<AxisType>(DefaultYType, AxisTypeQueryParams),
        s: optIntParam(),
    }
    const {
        u: [ jsonUrl, setJsonUrl ],
        m: [ markerType, setMarkerType ],
        x: [ xColumn, setXColumn ],
        xt: [ xType, setXType ],
        y: [ yColumn, setYColumn ],
        yt: [ yType, setYType ],
        c: [ colorColumn, setColorColumn ],
        ct: [ colorType, setColorType ],
        s: [ sizeColumn, setSizeColumn ],
    }: ParsedParams = parseQueryParams({ params })

    const handleJsonUrlFormSubmit = useCallback(
        (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            const input = e.currentTarget.elements.namedItem("url") as HTMLInputElement
            const jsonUrl = input.value
            setJsonUrl(jsonUrl)
            setXColumn(0)
            setXType(DefaultXType)
            setYColumn(0)
            setYType(DefaultYType)
            setColorColumn(null)
            setColorType(DefaultColorType)
            setSizeColumn(null)
        },
        []
    )

    const basePath = getBasePath()

    return (
        <div className={css.container}>
            <Head>
                <title>Datasette-Vega</title>
                <meta name="description" content="Demo of Datasette-Vega React component" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={css.main}>
                <h1 className={css.title}>Datasette Vega</h1>
                <p>Enter the URL of the JSON version of any Datasette table:</p>
                <form className={css.jsonUrlForm} onSubmit={handleJsonUrlFormSubmit} method="GET">
                    <input id="jsonUrl" className={css.urlInput} type="text" name="url" defaultValue={jsonUrl} />
                    <input type="submit" value="Load" style={{ fontSize: "1.2em", border: "1px solid #ccc", }} />
                    <p>
                        Examples:
                        {' '}<Link href={`${basePath}${examples.gamePtsTeamId}`}>game_id/pts/team_id</Link>,
                        {' '}<Link href={`${basePath}${examples.ptsResult}`}>pts/opp_pts/result</Link>,
                        {' '}<Link href={`${basePath}${examples.fatalCrashStats}`}>fatalities_per_billion_miles/speeding/alcohol/state</Link>,
                    </p>
                </form>
                <DatasetteVega
                    containerClass={css.visContainer}
                    wrapperClass={css.visWrapper}
                    visDivClass={css.visDiv}
                    jsonUrl={jsonUrl}
                    markerType={markerType} setMarkerType={setMarkerType}
                    xColumn={xColumn} setXColumn={setXColumn}
                    xType={xType} setXType={setXType}
                    yColumn={yColumn} setYColumn={setYColumn}
                    yType={yType} setYType={setYType}
                    colorColumn={colorColumn} setColorColumn={setColorColumn}
                    colorType={colorType} setColorType={setColorType}
                    sizeColumn={sizeColumn} setSizeColumn={setSizeColumn}
                />
            </main>
        </div>
    )
}
