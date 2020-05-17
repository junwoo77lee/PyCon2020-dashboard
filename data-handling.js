function loadData(url) {
    return d3.json(url).then(data => {
        return data;
    });
}

function showData(data) {
    let section = d3.select("#section-select")
    let div = d3.select("#main-chart");
    let divInfo = d3.select("#video-info");

    // display a barchart for 'tutorials' section as initialization
    init(div, data, section);

    // Event listener when dropdown menu changes
    section.on("change", function() {
        clearContents(div);
        clearContents(divInfo);

        let section = this.value;
        let sortedData = sortData(data[section], 'desc', 'viewCount');

        drawBarChart(sortedData, div);
    });

    // then, add an interactive container showing title, bio, description, and the statistics
}

function init(div, data, section) {
    let sectionName = section.node().value;
    let sortedData = sortData(data[sectionName], 'desc', 'viewCount');
    drawBarChart(sortedData, div);
}