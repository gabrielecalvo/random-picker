let picked = null;
let items = [];

function _weightedRandom(items, weights) {
  var i;

  for (i = 0; i < weights.length; i++) weights[i] += weights[i - 1] || 0;

  var random = Math.random() * weights[weights.length - 1];

  for (i = 0; i < weights.length; i++) if (weights[i] > random) break;

  return items[i];
}

function _parseQuery(queryString) {
  const urlParams = new URLSearchParams(queryString);
  const itemParam = urlParams.get("items");
  const lastPicked = urlParams.get("last");
  if (itemParam != null) {
    const itemStrArray = itemParam.split(",");

    for (let idx in itemStrArray) {
      values = itemStrArray[idx].split(":");
      let item = {
        name: values[0],
        count: parseInt(values[1]),
        weight: 0,
      };
      item.weight = item.name == lastPicked ? 0 : 1 / Math.max(0.1, item.count);
      items.push(item);
    }

    document.getElementById("pick-btn").hidden = false;
  }
}

function _createPiePlot(items) {
  if (items.length > 0) {
    document.getElementById("piechart-title").hidden = false;
  }

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
    margin: {
      l: 20,
      r: 20,
      b: 20,
      t: 20,
      pad: 5,
    },
    title: false,
    showlegend: false,
  };
  Plotly.newPlot("piechart", data, layout);
}

function pick() {
  picked = _weightedRandom(
    items.map((i) => i.name),
    items.map((i) => i.weight)
  );
  document.getElementById(
    "picked-text"
  ).innerHTML = `Fate chose <b>${picked}</b>. Do you accept or do you want to pick again?`;
  document.getElementById("accept-picked").hidden = false;
  document.getElementById("pick-btn").innerHTML = "Pick Again";
}

function acceptPicked() {
  for (idx in items) {
    let item = items[idx];
    if (item.name == picked) {
      item.count += 1;
    }
  }
  setState(picked, items);
}

function setState(last, items) {
  var url = new URL(window.location.href);
  count_params = items
    .map((i) => {
      newCount = i.name == picked ? i.count + 1 : i.count;
      return `${i.name}:${newCount}`;
    })
    .join(",");

  url.searchParams.set("last", last);
  url.searchParams.set("items", count_params);
  window.location.replace(url);
}

function addItem() {
  item_name = document.getElementById("new-item-input").value;
  let item = {
    name: item_name,
    count: 0,
    weight: 0,
  };
  console.log("adding item", item);
  new_items = [...items, item];
  console.log("new list of items", new_items);
  setState(picked, new_items);
}

_parseQuery(window.location.search);
_createPiePlot(items);
