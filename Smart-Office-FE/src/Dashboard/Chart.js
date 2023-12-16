import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

function Chart({ data, title, start, end }) {
    if (title === "home.sh-humid") {
        title = "Humid"
    }
    else if (title === "home.sh-led") {
        title = "Led"
    }
    else if (title === "home.sh-lumos") {
        title = "Lumos"
    }
    else if (title === "home.sh-moved") {
        title = "Moved"
    }
    else if (title === "home.sh-temp") {
        title = "Temp";
    }

  const options = {
    chart: {
      type: "line",
      width: 1100,
      height: 500
    },
    title: {
      text: `${title} Recording`,
    },
    xAxis: {
      type: "datetime",
      labels: {
        formatter: function () {
          return Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.value);
        },
      },
      min: start.valueOf() + (7 * 60 * 60 * 1000),
      max: end.valueOf() + (7 * 60 * 60 * 1000),
    },    
    yAxis: {
      title: {
        text: "IOT Value",
      },
    },
    series: [
      {
        name: "IOT Value",
        data: data,
      },
    ],
  };
  return <HighchartsReact highcharts={Highcharts} options={options} />;
}

export default Chart;
