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
    if (tag._groups[0][0].id !== "video-info") {
        tag.html(null);
    } else {
        tag.html(`<div class="container mt-2">
                  <dl class="row">
                  <dt class="col-sm-3">Title</dt>
                  <dd class="col-sm-9" id="video-Title"></dd>
                  <dt class="col-sm-3">Video Stats</dt>
                  <dd class="col-sm-9" id="video-Stats"></dd>                                        
                  <dt class="col-sm-3"></dt>
                  <dd class="col-sm-9" id="video-Watch"></dd>
                  <dt class="col-sm-3 mt-2">Description</dt>
                  <dd class="col-sm-9" id="video-Description"></dd>
            
                  <dt class="col-sm-3">Author</dt>
                  <dd class="col-sm-9" id="video-Author"></dd>
              
                  <dt class="col-sm-3">Bio</dt>
                  <dd class="col-sm-9" id="video-Bio"></dd>
                  </dl>
                  </div>`);
    }
}