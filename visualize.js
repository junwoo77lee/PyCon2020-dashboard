function drawBarChart(sortedData, div) {
    let config = getConfiguration(div);

    let { xScaler, yScaler } = drawAxes(config, sortedData);
    drawBars(config, sortedData, xScaler, yScaler);

}

function drawBars(config, sortedData, xScaler, yScaler) {
    let { chart } = config;
    let barGroup = addToParent(chart, 'g', 'bar', null);
    barGroup.selectAll('.bar')
        .data(sortedData)
        .enter()
        .append('rect')
        .attrs({
            'x': 0,
            'y': d => yScaler(d.Video_id),
            'width': d => xScaler(d.viewCount),
            'height': yScaler.bandwidth()
        })
        .on('click', d => displayVideoInfo(d));
}

function drawAxes(config, sortedData) {
    let { chartWidth, chartHeight, chart } = config;
    let { xScaler, yScaler } = createScaler(config, sortedData);

    let xAxis = d3.axisTop(xScaler);
    addToParent(chart, 'g', 'x-axis', null)
        .call(xAxis);

    let yAxis = d3.axisLeft(yScaler);
    addToParent(chart, 'g', 'y-axis', null)
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
    clearContents(divInfo)

    divInfo.selectAll('div.container')
        .data([info])
        .enter()
        .append('div')
        .classed('container mt-2', true)
        .html(d => `<dl class="row">
                    <dt class="col-sm-3">Title</dt>
                    <dd class="col-sm-9">${d.Title}</dd>
                    <dt class="col-sm-3">Vide Stats</dt>
                    <dd class="col-sm-9">
                        <span class="badge badge-pill badge-success">Like ${d.likeCount === undefined ? 0 : d.likeCount}</span>
                        <span class="badge badge-pill badge-danger">Dislike ${d.dislikeCount === undefined ? 0 : d.dislikeCount}</span>
                        <span class="badge badge-pill badge-primary">Favorite ${d.favoriteCount}</span>
                        <span class="badge badge-pill badge-info">Comments ${d.commentCount}</span>
                    </dd>                                        
                    <dt class="col-sm-3"></dt>
                    <dd class="col-sm-9">
                        <button type="button" class="btn btn-outline-dark btn-sm btn-block" id="link" data-toggle="modal" data-target=".bd-modal-lg">Watch</button>
                    </dd>
                    <dt class="col-sm-3 mt-2">Description</dt>
                    <dd class="col-sm-9">
                    <p>${d.Description}</p>
                    </dd>
                
                    <dt class="col-sm-3">Author</dt>
                    <dd class="col-sm-9">${d.Author}</dd>
                
                    <dt class="col-sm-3">Profile</dt>
                    <dd class="col-sm-9">${d.Bio}</dd>
                    </dl>`);

    $('#link').click(function() {
        let src = `https://www.youtube.com/embed/${info.Video_id}`;
        $('#currentVideo').modal('show');
        $('#currentVideo iframe').attr('src', src);
    });

    $('#currentVideo button').click(function() {
        $('#currentVideo iframe').removeAttr('src');
    });

}