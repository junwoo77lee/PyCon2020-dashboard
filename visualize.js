function drawBarChart(sortedData, div) {
    let config = getConfiguration(div);

    let { xScaler, yScaler } = drawAxes(config, sortedData);
    drawBars(config, sortedData, xScaler, yScaler);

}

function drawBars(config, sortedData, xScaler, yScaler) {
    let { chart } = config;
    let barGroup = addToParent(chart, 'g', 'bar', null);
    let bars = barGroup.selectAll('.bar')
        .data(sortedData)
        .enter()
        .append('rect')
        //.attr('fill', 'black')
        .on(
            'click', d => displayVideoInfo(d)
        ).on('mouseenter', function() {
            this.style.fill = 'red';
        }).on('mouseleave', function() {
            this.style.fill = 'black';
        });

    bars.transition()
        .duration(300)
        .attrs({
            'x': 0,
            'y': d => yScaler(d.Video_id),
            'width': d => xScaler(d.viewCount),
            'height': yScaler.bandwidth()
        });
}

function drawAxes(config, sortedData) {
    let { chartWidth, chartHeight, chart } = config;
    let { xScaler, yScaler } = createScaler(config, sortedData);

    let xAxis = d3.axisTop(xScaler);
    addToParent(chart, 'g', 'x-axis', null)
        .transition()
        .duration(500)
        .call(xAxis);

    let yAxis = d3.axisLeft(yScaler);
    addToParent(chart, 'g', 'y-axis', null)
        .transition()
        .duration(500)
        .call(yAxis);

    return { xAxis, yAxis, xScaler, yScaler }
}

function createScaler(config, data) {
    let { chartWidth, chartHeight } = config;

    let xScaler = d3.scaleLinear()
        .domain(d3.extent(data, d => d.viewCount))
        .range([0, chartWidth]);

    let yScaler = d3.scaleBand()
        .domain(data.map(d => d.Video_id))
        .range([0, chartHeight])
        .padding(0.2);

    return { xScaler, yScaler }
}

function displayVideoInfo(info) {
    let divInfo = d3.select("#video-info");
    clearContents(divInfo);

    // fill the video infomation clicked
    Object.keys(info).forEach(key => {
        if (!key.includes("_") && !key.includes("Count")) {
            renderSelection(key, info);
        }
    });

    // add the video stats
    d3.select("#video-Stats")
        .data([info])
        .html(d => `<span class="badge badge-pill badge-success">Like ${d.likeCount === undefined ? 0 : d.likeCount}</span>
               <span class="badge badge-pill badge-danger">Dislike ${d.dislikeCount === undefined ? 0 : d.dislikeCount}</span>
               <span class="badge badge-pill badge-primary">Favorite ${d.favoriteCount}</span>
               <span class="badge badge-pill badge-info">Comments ${d.commentCount}</span>`);

    // add a button to watch the video
    d3.select("#video-Watch")
        .html('<button type="button" class="btn btn-outline-dark btn-sm btn-block" id="link" data-toggle="modal" data-target=".bd-modal-lg">Watch</button>');

    // Pop a modal embedding the video when user clicks 'watch' button
    $('#link').click(function() {
        let src = `https://www.youtube.com/embed/${info.Video_id}`;
        $('#currentVideo').modal('show');
        $('#currentVideo iframe').attr('src', src);
    });

    $('#currentVideo button').click(function() {
        $('#currentVideo iframe').removeAttr('src');
    });

}

function renderSelection(content, data) {
    d3.select(`#video-${content}`)
        .data([data])
        .html(d => d[content]);
}