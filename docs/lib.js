// auxiliary
function _convertDataToItems(data) {
    // convert data into array of objects with probability weights
    return Object.keys(data.pickCounts).map(key => ({
        name: key,
        count: parseInt(data.pickCounts[key]),
        weight: key == data.lastPicked ? 0 : 1 / Math.max(0.1, data.pickCounts[key])
    }))
}

// Getting the data from the url
const getDataFromQueryString = async (state) => {
    const queryString = state.window.location.search
    if (queryString.startsWith("?https://")) {
        source = { type: "remote", url: queryString.slice(1) }
        data = await _getDataFromRemote(source.url)
    } else {
        source = { type: "params", params: Object.fromEntries(new URLSearchParams(queryString)) }
        data = _getDataFromParams(source.params)
    }

    state.source = source
    state.data = data
}
async function _getDataFromRemote(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('Data received:', data);
        return data;
    } catch (error) {
        console.error(`Error when getting data from ${url}:`, error);
    }
}
function _getDataFromParams(params) {
    let pickCounts = {}
    const lastPicked = params.last;
    if (params.items === null) {
        console.log("no items found in the url");
    } else {
        params.items.split(",").forEach(pair => {
            const [key, value] = pair.split(':');
            pickCounts[key] = parseInt(value);
        });
    }

    return { pickCounts, lastPicked };
}

// Plotting the data
const createPiePlot = (data, divId) => {
    const items = _convertDataToItems(data)
    var data = [
        {
            values: items.map((i) => i.weight),
            labels: items.map((i) => i.name),
            type: "pie",
            textinfo: "label+percent",
        },
    ];
    var layout = {
        height: 400,
        // width: 500,
        margin: { l: 20, r: 20, b: 20, t: 30, pad: 5 },
        title: false,
        showlegend: false,
    };
    Plotly.newPlot(divId, data, layout);
}

// Set/update the data into the storage
const storeState = async (state) => {
    if (state.source.type == "remote") {
        await _setDataToRemote(state.source.url, state.data)
    } else {
        console.log(state)
        _setDataToParams(state)
    }
}
async function _setDataToRemote(url, data) {
    dataToUpload = {
        "pickCounts": data.pickCounts,
        "lastPicked": data.lastPicked
    }
    await fetch(url, {
        method: 'PUT',
        headers: { "x-ms-blob-type": "BlockBlob" },
        body: JSON.stringify(dataToUpload)
    });
    console.log('Data uploaded:', dataToUpload);
}
function _setDataToParams(state) {
    count_params = Object.entries(state.data.pickCounts).map(
        ([key, value]) => `${key}:${value}`
    ).join(',');

    console.log({ location })
    var url = new URL(location.href);
    url.searchParams.set("last", state.data.lastPicked);
    url.searchParams.set("items", count_params);
    state.window.location.href = url;
}

// pick a weighted-random item
function pickItem(state) {
    items = _convertDataToItems(state.data)
    return _weightedRandom(items)
}
function _weightedRandom(items) {
    let cumulative = 0;
    const totalweights = items.reduce((total, item) => total + item.weight, 0);
    var scaledRandom = Math.random() * totalweights;
    for (var i = 0; i < items.length; i++) {
        cumulative += items[i].weight;
        if (cumulative > scaledRandom) {
            return items[i].name
        }
    }
}


// module import-export stuff..
const exportable = {
    getDataFromQueryString,
    createPiePlot,
    storeState,
    pickItem,
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = exportable;
} else {
    window.lib = exportable;
}