function addToParent(parent, child, className, transformation) {
    return parent.append(child)
        .attrs({
            "class": className,
            "transform": transformation
        });
}

function getConfiguration(obj) {
    let width = +obj.width || 600;
    let height = +obj.height || 600;
    let margin = { top: 30, right: 20, bottom: 20, left: 100 };

    let svg = addToParent(obj, 'svg', 'svgWrapper', null);
    svg.attrs({
        'width': width,
        'height': height
    });

    let chartWidth = width - margin.left - margin.right;
    let chartHeight = height - margin.top - margin.bottom;
    let chart = addToParent(svg, 'g', 'chartWrapper', `translate(${margin.left},${margin.top})`);
    chart.attrs({
        'width': chartWidth,
        'height': chartHeight
    });

    return { width, height, chartWidth, chartHeight, svg, chart }
}

function sortData(data, order, attribute) {
    if (order.toLowerCase() !== 'desc' && order.toLowerCase() !== 'asc') {
        throw new Error("order should be either 'asc' or 'desc'.");
    } else if (order.toLowerCase() === 'desc') {
        return data.sort((a, b) => d3.descending(a[attribute], b[attribute]));
    } else {
        return data.sort((a, b) => d3.ascending(a[attribute], b[attribute]));
    }
}

function clearContents(tag) {
    // tag: d3.selection object
    tag.html(null);
}