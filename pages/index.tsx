import React, {FormEvent, useCallback, useEffect, useMemo} from "react";
import {defStringParam, enumParam, Param, ParsedParam, parseQueryParams, stringParam} from "next-utils/params";
import css from "../styles/Home.module.scss";
import DatasetteVega from "../src/DatasetteVega";
import Head from "next/head";
import {StandardType} from "vega-lite/src/type";

const examples = {
    defaultUrl: "fivethirtyeight.datasettes.com/fivethirtyeight/nba-elo~2Fnbaallelo.json",
    gamePtsTeamId: "/?u=fivethirtyeight.datasettes.com%2Ffivethirtyeight%2Fnba-elo~2Fnbaallelo.json&m=b&x=game_id&xt=c&y=pts&yt=n&c=team_id",
    ptsResult: "/?u=fivethirtyeight.datasettes.com%2Ffivethirtyeight%2Fnba-elo%7E2Fnbaallelo.json&m=s&x=opp_pts&xt=n&y=pts&yt=n&c=game_result&s=pts",
}

type Params = {
    u: Param<string>
    m: Param<MarkerType>
    x: Param<string | undefined>
    xt: Param<AxisType>
    y: Param<string | undefined>
    yt: Param<AxisType>
    c: Param<string | undefined>
    s: Param<string | undefined>
}

type ParsedParams = {
    u: ParsedParam<string>,
    m: ParsedParam<MarkerType>,
    x: ParsedParam<string | undefined>,
    xt: ParsedParam<AxisType>,
    y: ParsedParam<string | undefined>,
    yt: ParsedParam<AxisType>,
    c: ParsedParam<string | undefined>,
    s: ParsedParam<string | undefined>,
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
export const VegaAxisTypes: { [k in AxisType]: StandardType } = {
    "Numeric": 'quantitative',
    "Numeric, binned": 'quantitative',
    "Date/time": 'temporal',
    "Date/time, binned": 'temporal',
    "Label": 'ordinal',
    "Category": 'nominal'
}

export default function Home() {
    const params: Params = {
        u: defStringParam(examples.defaultUrl),
        m: enumParam<MarkerType>("Bar", { Bar: 'b', Line: 'l', Scatter: 's' }),
        x: stringParam(),
        xt: enumParam<AxisType>("Label", AxisTypeQueryParams),
        y: stringParam(),
        yt: enumParam<AxisType>("Numeric", AxisTypeQueryParams),
        c: stringParam(),
        s: stringParam(),
    }
    const {
        u: [ jsonUrl, setJsonUrl ],
        m: [ markerType, setMarkerType ],
        x: [ xColumn, setXColumn ],
        xt: [ xType, setXType ],
        y: [ yColumn, setYColumn ],
        yt: [ yType, setYType ],
        c: [ colorColumn, setColorColumn ],
        s: [ sizeColumn, setSizeColumn ],
    }: ParsedParams = parseQueryParams({ params })

    const location = (typeof window == "undefined") ? null : window.location

    useEffect(
        () => {
            if (!location) return
            // Dev mode - use graph elements already on the index.html page
            let m = /\?url=(.*)/.exec(location.search)
            if (m) {
                setJsonUrl(decodeURIComponent(m[1]))
            }
        },
        [ location?.search ]
    )

    const fullJsonUrl = useMemo(
        () => /^https?:\/\//.exec(jsonUrl) ? jsonUrl : `https://${jsonUrl}`,
        [ jsonUrl ]
    )

    const handleJsonUrlFormSubmit = useCallback(
        (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            const input = e.currentTarget.elements.namedItem("url") as HTMLInputElement
            const jsonUrl = input.value
            setJsonUrl(jsonUrl)
            // window.location.href = `?url=${encodeURIComponent(jsonUrl)}`
        },
        []
    )

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
                    <input id="jsonUrl" type="text" name="url" defaultValue={examples.defaultUrl} style={{ width: "80%", fontSize: "1.2em", }} />
                    <input type="submit" value="Load" style={{ fontSize: "1.2em", border: "1px solid #ccc", }} />
                    <p>
                        Examples:
                        {' '}<a href={examples.gamePtsTeamId}>game_id/pts/team_id</a>,
                        {' '}<a href={examples.ptsResult}>pts/opp_pts/result</a>
                    </p>
                </form>
                <DatasetteVega
                    containerClass={css.visContainer}
                    wrapperClass={css.visWrapper}
                    visDivClass={css.visDiv}
                    jsonUrl={fullJsonUrl}
                    markerType={markerType} setMarkerType={setMarkerType}
                    xColumn={xColumn} setXColumn={setXColumn}
                    xType={xType} setXType={setXType}
                    yColumn={yColumn} setYColumn={setYColumn}
                    yType={yType} setYType={setYType}
                    colorColumn={colorColumn} setColorColumn={setColorColumn}
                    sizeColumn={sizeColumn} setSizeColumn={setSizeColumn}
                />
            </main>
        </div>
    )
}
