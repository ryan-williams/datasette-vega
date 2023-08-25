import Head from 'next/head'
import styles from '../styles/Home.module.css'
import DatasetteVega from "../src/DatasetteVega";
import React, {FormEvent, useCallback, useEffect, useMemo} from "react";

const examples = {
    defaultUrl: "https://fivethirtyeight.datasettes.com/fivethirtyeight/nba-elo~2Fnbaallelo.json",
    gamePtsTeamId: "/?url=https%3A%2F%2Ffivethirtyeight.datasettes.com%2Ffivethirtyeight%2Fnba-elo~2Fnbaallelo.json#g.mark=bar&g.x_column=game_id&g.x_type=ordinal&g.y_column=pts&g.y_type=quantitative&g.color_column=team_id",
    ptsResult: "/?url=https%3A%2F%2Ffivethirtyeight.datasettes.com%2Ffivethirtyeight%2Fnba-elo%7E2Fnbaallelo.json#g.mark=circle&g.x_column=opp_pts&g.x_type=quantitative&g.y_column=pts&g.y_type=quantitative&g.color_column=game_result&g.size_column=opp_pts",
}

const matchesCurrentHostAndPath = (url: string) => {
    // Given a url, is it the same host and path as current page?
    // (ignores querystring and fragment hash)
    url = url.split('#')[0];
    // Only activate if link is to current page (presumably with different querystring)
    var currentHostAndPath = window.location.hostname;
    if (window.location.port !== '') {
        currentHostAndPath += ':' + window.location.port;
    }
    currentHostAndPath += window.location.pathname;
    // Ignore http/s due to https://github.com/simonw/datasette/issues/333
    var linkedHostAndPath = url.split('://')[1].split('?')[0];
    return currentHostAndPath === linkedHostAndPath;
};

export default function Home() {
    const [ jsonUrl, setJsonUrl ] = React.useState(examples.defaultUrl)
    const onFragmentChange = () => {
        if (window.location.hash.length === 0) {
            return;
        }
        Array.from(document.getElementsByTagName('form')).forEach(form => {
            const action = form.action.split('#')[0];
            if (matchesCurrentHostAndPath(action)) {
                form.action = action + window.location.hash;
            }
        });
    };

    useEffect(
        () => {
            // Dev mode - use graph elements already on the index.html page
            let m = /\?url=(.*)/.exec(window.location.search)
            if (m) {
                setJsonUrl(decodeURIComponent(m[1]))
            }
        },
        [ window.location.search ]
    )

    const arrayJsonUrl = useMemo(
        () => `${jsonUrl}${(jsonUrl.indexOf('?') > -1) ? '&' : '?'}_shape=array`,
        [ jsonUrl ]
    )

    const handleJsonUrlFormSubmit = useCallback(
        (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            const input = e.currentTarget.elements.namedItem("url") as HTMLInputElement
            const jsonUrl = input.value
            window.location.href = `?url=${encodeURIComponent(jsonUrl)}`
        },
        []
    )

    return (
        <div className={styles.container}>
            <Head>
                <title>Datasette-Vega</title>
                <meta name="description" content="Demo of Datasette-Vega React component" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Datasette Vega</h1>
                <p>Enter the URL of the JSON version of any Datasette table:</p>
                <form action="." onSubmit={handleJsonUrlFormSubmit} method="GET" style={{ marginBottom: "2em", }}>
                    <input id="jsonUrl" type="text" name="url" value={examples.defaultUrl} style={{ width: "80%", fontSize: "1.2em", }} />
                    <input type="submit" value="Load" style={{ fontSize: "1.2em", border: "1px solid #ccc", }} />
                    <p>
                        Examples:
                        <a href={examples.gamePtsTeamId}>game_id/pts/team_id</a>,
                        <a href={examples.ptsResult}>pts/opp_pts/result</a>
                    </p>
                </form>
                <div id="vis-tool">
                    <DatasetteVega base_url={arrayJsonUrl} onFragmentChange={onFragmentChange} />
                </div>
                <div id="vis-wrapper" style={{ overflow: "auto" }}>
                    <div id="vis"></div>
                </div>
            </main>
        </div>
    )
}
