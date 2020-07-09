if (!layui.modules["base"]) {
    layui.extend({
        tableFilter: "layui/my/tableFilter",
        base: "myjs/base"
    })
    layui.define([
        'jquery',
        'layer',
        'table',
        'tableFilter',
        'element',
        'form'
    ], function (exports) {
        let obj = {}
        window.$ = layui.$;
        window.layer = layui.layer;
        window.table = layui.table;
        window.tableFilter = layui.tableFilter;
        window.globalloadings = 0;
        window.element = layui.element;
        axios.interceptors.request.use(function (cfg) {
            showmask();
            return cfg;
        })

        axios.interceptors.response.use(function (data) {
            hidmask()
            return data;
        }, function (error) {
            hidmask();
            if (error.response) {
                if (error.response.status == 401 && top.location.href.indexOf("login.html") < 0) {
                    top.location.href = "login.html"
                } else if (error.response.status == 444) {
                    return Promise.reject(error);
                }
            }
            return Promise.reject(error);
        })

        function showmask() {
            window.globalloadings++;
            if (window.globalloadings > 0) {
                $(".lmask").show();
            }
        }

        function hidmask() {
            window.globalloadings--;
            if (window.globalloadings <= 0) {
                $(".lmask").hide();
            }
        }

        window.openinfo = function (url, title) {
            layer.open({
                type: 2,
                fixed: false,
                maxmin: true,
                title: title || "",
                area: ['888px', '600px'],
                content: url //这里content是一个URL，如果你不想让iframe出现滚动条，你还可以content: ['http://sentsin.com', 'no']
            });
        }
        exports("base", obj)
    });

}


function done(res, curr, count) {
    //如果是异步请求数据方式，res即为你接口返回的信息。
    //如果是直接赋值的方式，res即为：{data: [], count: 99} data为当前页数据、count为数据总长度
    var tb = this;
    var tb_ele = this.elem.next();
    // console.log(tb);
    tb_ele.find('[lay-event="LAYTABLE_COLS"]').click(function (e) {
        setTimeout(function () {
            layui.$(e.currentTarget).find('.layui-form-checkbox').click(function () {
                addcache("tb_cols_" + tb.id, tb.cols, true);
            })
        }, 50);
    });
    tb_ele.find(".tb_title").html(tb.title + " # " + count);
}

function makeoptions(id, data, title, cols, showLessColumns) {
    var options = {
        elem: '#' + id,
        data: data,
        title: title,
        toolbar: "#toolbar",
        defaultToolbar: ['filter', 'exports'],
        cols: makecolumns(id, data, cols, showLessColumns),
        cellMinWidth: 0,
        done: done,
        limit: data ? data.length : 1000
    };

    return options;
}

function makecolumns(id, obj, _usercol, showMinCols) {
    let usercol = Object.assign({}, _usercol);
    const minCols = ["name", "code", "rate", "roeAvg", "calcDate", "calcMsg", "msg", "JGCYD", "JGCYDType", "ZLCB", "price", "pctChg"]
    var datapoints = getcache("datapointsObj");
    var cols = getcache("tb_cols_" + id);
    if (cols) {
        for (c of cols[0]) {
            if (usercol && usercol[c.field]) {
                // console.log(usercol);
                Object.assign(c, usercol[c.field]);
            }
        }
        // console.log(cols);
        return cols;
    }
    if (!obj) {
        return [
            []
        ];
    }
    var cols = [];
    for (var k in obj[0]) {
        var col = {
            field: k,
            title: k,
            sort: true
        };
        if (datapoints[k]) {
            col.title = datapoints[k].title;
        }
        // console.log(usercol);
        if (usercol && usercol[k]) {
            Object.assign(col, usercol[k]);
            delete usercol[k]
        } else {
            if (showMinCols && minCols.indexOf(k) < 0) {
                col.hide = true;
            }
        }
        cols.push(col);
    }
    for (var k in usercol) {
        cols.push(usercol[k]);
    }
    return [cols];
}

function parseMsg(row) {
    try {
        var msg = row['calcMsg'].replace(/'/g, "\"").replace(/False/g, "false").replace(/True/g, "true");
        msg = JSON.parse(msg);
        var botom = msg["isbottom"] ? "<span class='layui-badge layui-bg-cyan'>底部</span>" : "";
        var top = msg["istop"] ? "<span class='layui-badge'>顶部</span>" : "";
        var high = row["percent_long"] > 0 ? "<span class='layui-badge layui-bg-orange'>高位</span>" : "";
        var low = "<span class='layui-badge layui-bg-green'>低位</span>"
        return botom || top || high || low;
    } catch (ex) {
        // console.log(row["calcMsg"]);
    }
    return row["calcMsg"];
}

function okfunc(ok,v){
    return "<span class='" + (ok ? "" : "layui-badge") + "'>" + v + "</span>"
}

function loaddata(tbid, url, extraCols, option) {
    axios.get(url).then(function (res) {

        var industryRows = res.data.industrydata;
        var industry = {};
        if (industryRows && industryRows.length) {
            for (var row of industryRows) {
                var name = row["industry"];
                industry[name] = { "avgpe": row["avgpe"], "num": row["num"] };
            }
        }
        var colCfg = {
            "industry": {
                templet: function (row) {
                    var name = row.industry;
                    var url = "./industry.html#" + encodeURIComponent(name);
                    return "<a onclick='openinfo(\"" + url + "\",\"行业：" + name + "\")' href='javascript:;' >" + name + "</a> ";
                }
            },
            "industryPE": {
                title: "行业PE",
                sort: true,
                templet: function (row) {
                    var name = row.industry;
                    row["industryPE"] = industry[name] ? parseInt(industry[name].avgpe) : 0
                    return row["industryPE"];
                }
            },
            "code": {
                templet: function (row) {
                    var url = "./info.html#" + row.code;
                    return "<a onclick='openinfo(\"" + url + "\",\"" + row.name + " # " + row.code + "\")' href='javascript:;' >" + row.code + "</a> ";
                }
            },
            "Growth": {
                templet: function (row) {
                    var g = (row["Growth"] * 100).toFixed(2);
                    return g;
                }
            },
            "calcMsg": {
                templet: parseMsg
            },
            "percent_long": {
                templet: '<div><span style="color:#f00">{{d.percent_long}}</span></div>'
            },
            "cashRatio": {
                templet: function (row) {
                    return okfunc(row["cashRatio"] > 0.6,row["cashRatio"])
                }
            },
            "YOYAsset": {
                templet: function (row) {
                    return okfunc(row["YOYAsset"] > 0,row["YOYAsset"])
                }
            },
            "roeAvg": {
                templet: function (row) {
                    return okfunc(row["roeAvg"] > 0.03,row["roeAvg"])
                }
            },
            "CFOToGr": {
                templet: function (row) {
                    return okfunc(row["CFOToGr"] > 0.08, row["CFOToGr"])
                }
            },
            "CFOToNP": {
                templet: function (row) {
                    return okfunc(row["CFOToNP"] > 0.03,row["CFOToNP"])
                }
            }
        }
        if (extraCols) {
            Object.assign(colCfg, extraCols);
        }
        var highlightCols = $("#" + tbid).attr("highlight");
        if (highlightCols) {
            highlightCols = JSON.parse(highlightCols);
            for (var col of highlightCols) {
                if (!colCfg[col]) {
                    colCfg[col] = {};
                }
                colCfg[col]["style"] = "background-color: #5FB878;";
            }
        }

        option = option || {};
        option = Object.assign(option, makeoptions(tbid, res.data.data, "Stocks-" + tbid, colCfg, true));
        option.height = 680;
        table.render(option);
        var option2 = {
            elem: '#' + tbid,
            mode: 'local',
            filters: [{
                field: "calcMsg",
                type: "checkbox"
            }, { field: "JGCYDType", type: "checkbox" }]
        }
        tableFilter.render(option2);
    });
}

function getcache(key) {
    var str = localStorage.getItem(key);
    if (str) {
        var obj = JSON.parse(str);
        return obj;
    }
    return null;
}

function addcache(key, obj, toserver) {
    var str = obj;
    if (typeof (obj) == "object") {
        str = JSON.stringify(obj);
    }
    localStorage.setItem(key, str);
    if (toserver) {
        axios.post("api/user/configs", {
            key: key,
            configs: str
        }, function (res) {
            console.log("save cache to server success");
        })
    }
}

function clearcache(toserver) {
    localStorage.clear();
    if (toserver) {
        axios.delete("api/user/configs", function (res) {
            console.log("delete cache success");
        })
    }
}

function loaddatapoints() {
    if (window["nologin"]) {
        return;
    }
    axios.get("info/datapoints").then(function (res) {
        var arr = res.data;
        addcache("datapoints", arr);
        var dpsObj = {}
        for (var d of arr) {
            dpsObj[d["value"]] = {
                title: d["title"]
            };
        }
        addcache("datapointsObj", dpsObj);
    })
};
loaddatapoints();

function loadconfigs() {
    if (window["nologin"]) {
        return;
    }
    axios.get("api/user/configs").then(function (res) {
        var rows = res.data;
        for (var row of rows) {
            addcache(row["key"], row["configs"]);
        }
    })
}
loadconfigs();

function now() {
    var d = new Date();
    return d.getFullYear() + "-" + fixNum(d.getMonth() + 1, 2) + "-" + fixNum(d.getDate(), 2) + " " +
        fixNum(d.getHours(), 2) + ":" + fixNum(d.getMinutes(), 2) + ":" + fixNum(d.getSeconds(), 2)
}

function fixNum(num, n) {
    return ("00000000" + num).substr(-n);
}