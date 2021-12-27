function weightedRandom(items, weights) {
    var i;

    for (i = 0; i < weights.length; i++)
        weights[i] += weights[i - 1] || 0;
    
    var random = Math.random() * weights[weights.length - 1];
    
    for (i = 0; i < weights.length; i++)
        if (weights[i] > random)
            break;
    
    return items[i];
}

function parseQuery(queryString){
    const urlParams = new URLSearchParams(queryString);
    const itemParam = urlParams.get("items")
    const lastPicked = urlParams.get("last") 
    const itemStrArray = itemParam.split(",")
    let items = []

    for(let idx in itemStrArray){
        values = itemStrArray[idx].split(":")
        let item = {
            name: values[0],
            count: parseInt(values[1]),
            weight: 0
        }
        item.weight = (item.name == lastPicked) ? 0 : 1/Math.max(0.1, item.count)
        items.push(item)
    }
    return items
}

function pick(){
    picked = weightedRandom(items.map(i=>i.name), items.map(i=>i.weight))
    document.getElementById("picked-text").innerHTML = `Fate chose <b>${picked}</b>. Do you accept or do you want to pick again?`
    document.getElementById("accept-picked").hidden = false
    document.getElementById("pick-btn").innerHTML = "Pick Again"
    return picked
}

function acceptPicked(){
    var url = new URL(window.location.href);
    url.searchParams.set('last', picked)
    count_params = items.map(i => {
        newCount = i.name == picked ? i.count+1 : i.count
        return `${i.name}:${newCount}`
    }).join(',')
    url.searchParams.set('items', count_params)
    window.location.replace(url);
}

function createPiePlot(items){
    var data = [{
        values: items.map(i => i.weight),
        labels: items.map(i => i.name),
        type: 'pie',
        textinfo: "label+percent",
    }];
    var layout = {
        height: 400,
        width: 500,
        showlegend: false
    };
    Plotly.newPlot('piechart', data, layout);
}

let items = []
let picked = null
items = parseQuery(window.location.search)
createPiePlot(items)
