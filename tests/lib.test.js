const fetchMock = require('jest-fetch-mock');
const lib = require('../docs/lib.js');

const sampleData = { "pickCounts": { "A": 1, "B": 2, "C": 3 }, "lastPicked": "A" }
const expectedParsedData = { "lastPicked": "A", "pickCounts": { "A": 1, "B": 2, "C": 3 } }
// [
//     { "name": "A", "count": 1, "weight": 0 },
//     { "name": "B", "count": 2, "weight": 1 / 2 },
//     { "name": "C", "count": 3, "weight": 1 / 3 },
// ]

beforeEach(() => { fetchMock.resetMocks() });

it("createPiePlot sends correct info to Plotly", () => {
    const data = { "pickCounts": { "A": 1, "B": 2 }, "lastPicked": "A" }

    let actuals = {}
    global.Plotly = {}
    global.Plotly.newPlot = (divId, data, layout) => {
        actuals = { divId, data, layout }
    }

    lib.createPiePlot(data, "any")

    expect(actuals.divId).toEqual("any")
    expect(actuals.data).toEqual([
        {
            values: [0, 0.5],
            labels: ["A", "B"],
            type: "pie",
            textinfo: "label+percent",
        },
    ])
})

it("getDataFromQueryString extracts info from url string", async () => {
    state = { "window": { "location": { "search": "?items=A%3A1%2CB%3A2%2CC%3A3&last=A" } } }

    await lib.getDataFromQueryString(state)

    expect(state.source).toEqual({ type: "params", params: { "items": "A:1,B:2,C:3", "last": "A" } })
    expect(state.data).toEqual(expectedParsedData)
})

it("getDataFromQueryString download data from sas url", async () => {
    fetchMock.mockResponseOnce(JSON.stringify(sampleData))
    const sas = "https://myStorage.blob.core.windows.net/myBlob/myFile.json?sp=rcwd&xxx"
    state = { "window": { "location": { "search": "?" + sas } } }

    await lib.getDataFromQueryString(state)

    expect(state.source).toEqual({ type: "remote", url: sas })
    expect(state.data).toEqual(expectedParsedData)
})

it("pickItem", () => {
    state = { "data": sampleData }

    counts = { "A": 0, "B": 0, "C": 0 }
    for (var i = 0; i < 100; i++) {
        picked = lib.pickItem(state)
        counts[picked] += 1
    }
    console.log("=========", counts)
    expect(counts.A).toEqual(0)  // last picked
    expect(counts.B).toBeGreaterThan(counts.C)
})