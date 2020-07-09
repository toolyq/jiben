var id = location.hash.replace("#", "");
axios.get("info/ts/" + id).then(function (res) {
    var arr = res.data.reverse();
    var k = [];
    var dates = [];
    var volumes = [];
    var datacost8 = [];
    var markpoints = [];
    var rate = [];
    var turnrate = [];//换手率
    var downColor = '#00da3c';
    var  upColor = '#ec0000';
    for (var r of arr) {
        dates.push(r.date);
        k.push([r.open, r.close, r.low, r.high]);
        volumes.push([r.date, r.volume, (r.close > r.open ? 1 : -1)]);
        datacost8.push(r.price_l);
        rate.push(r.rate);
        turnrate.push(r.turn)
        if (r.istop) {
            markpoints.push({
                name: "T",
                coord: [r.date, r.high],
                value: r.high,
                itemStyle: {
                    color: upColor
                }
            });
        } else if (r.isbottom) {
            markpoints.push({
                name: "B",
                coord: [r.date, r.high],
                value: r.low,
                itemStyle: {
                    color: downColor
                }
            });
        }
    }
    // console.log(datacost8)

    var option = {
        legend: {
            data: ['日线', '8日成本','rate']
        },
        xAxis: [{
            data: dates
        }, {
            data: dates,
            gridIndex: 1
        }],
        yAxis: [{
            gridIndex: 0,
            scale: true,splitArea: {
                show: true
            }
        }, {
            gridIndex: 1
        },{
            gridIndex: 0,
            position: "right"
        },{
            gridIndex: 1,
            position: "right"
        }],
        grid: [{
                left: '10%',
                right: '8%',
                height: '50%'
            },
            {
                left: '10%',
                right: '8%',
                top: '68%',
                height: '16%'
            }
        ],
        series: [{
            name: 'Volume',
            type: 'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: volumes
        }, {
            name: '换手率',
            type: 'line',
            xAxisIndex: 1,
            yAxisIndex: 3,
            data: turnrate
        }, {
            name: "日线",
            type: 'k',
            data: k,
            itemStyle: {
                color: '#ef232a',
                color0: '#14b143',
                borderColor: '#ef232a',
                borderColor0: '#14b143'
            },
            markPoint: {
                symbol: 'path://m 0,0 h 48 v 20 h -30 l -6,10 l -6,-10 h -6 z',
                symbolOffset: ['30%', '-50%'],
                symbolKeepAspect: true,// 如果 symbol 是 path:// 的形式，是否在缩放时保持该图形的长宽比。
                label: {
                    normal: {
                        formatter: function (param) {
                            return param.name;
                        }
                    }
                },
                data: markpoints,
                symbolSize: [3, 3],       // 标注大小，半宽（半径）参数，当图形为方向或菱形则总宽度为symbolSize * 2
                itemStyle: {
                    normal: {
                        borderColor: '#1e90ff',
                        borderWidth: 1,            // 标注边线线宽，单位px，默认为1
                        label: {
                            show: true,
                            position: 'top|inside|left',
                            textStyle:{
                                fontWeight: 'bold',
                                fontSize: 13
                            }
                        }
                    },
                    emphasis: {
                        borderColor: '#1e90ff',
                        borderWidth: 3
                    }
                },
                effect : {
                    show: true,
                    shadowBlur : 0
                },
            }
        }, {
            name: '8日成本',
            type: 'line',
            data: datacost8,
            smooth: true,
            showSymbol: true,
            lineStyle: {
                width: 1
            }
        }, {
            name: 'rate',
            type: 'line',
            data: rate,
            smooth: false,
            yAxisIndex:2,
            showSymbol: false,
            lineStyle: {
                width: 1
            }
        }],
        dataZoom: [{
            type: 'slider',
            xAxisIndex: [0, 1],
            realtime: false,
            start: 68,
            end: 100,
            bottom: 3,
            height: 38,
            handleSize: '120%'
        }, {
            type: 'inside',
            xAxisIndex: [0, 1],
            start: 68,
            end: 100,
            height: 33
        }],
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            },
            backgroundColor: 'rgba(245, 245, 245, 0.8)',
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 10,
            textStyle: {
                color: '#000'
            },
            position: function (pos, params, el, elRect, size) {
                var obj = {
                    top: 10
                };
                obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
                return obj;
            }
            // extraCssText: 'width: 170px'
        },
        visualMap: {
            show: false,
            seriesIndex: 0,
            dimension: 2,
            pieces: [{
                value: 1,
                color:  upColor
            }, {
                value: -1,
                color: downColor
            }]
        },
        axisPointer: {
            link: {
                xAxisIndex: 'all'
            },
            label: {
                backgroundColor: '#777'
            }
        }
    };
    var myChart = echarts.init(document.getElementById('chart'));
    myChart.setOption(option);
    window.onresize = myChart.resize; 
})

function mynum(f) {
    f = parseFloat(f)
    return Math.round(f * 10) / 10;
}