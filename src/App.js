import React, { Component } from 'react';
import './App.css';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Api from './Api.js';

const prefectureGenerateApiUrl = 'https://opendata.resas-portal.go.jp/api/v1/prefectures';
const apiKey = Api

const Styles = {
  prefectures : { margin: '0.5em', display: 'inline-block' }
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: Array(47).fill(false),
      prefectures: {},
      series: []
    };
    this._setSelection = this._setSelection.bind(this);
  }

  componentDidMount() {
    fetch(prefectureGenerateApiUrl, {
      headers: { 'X-API-KEY': apiKey }
    })
      .then(response => response.json())
      .then(res => {
        this.setState({ prefectures: res.result });
      });
  }

  _setSelection(index) {
    const selected_copy = this.state.selected.slice();
    selected_copy[index] = !selected_copy[index];

    if (!this.state.selected[index]) {
      fetch(
        `https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=${index +
          1}`,
        {
          headers: { 'X-API-KEY': apiKey }
        }
      )
        .then(response => response.json())
        .then(res => {
          let tmp = [];
          console.log(res)
          Object.keys(res.result.data[0].data).forEach(i => {
            tmp.push(res.result.data[0].data[i].value);
          });
          const res_series = {
            name: this.state.prefectures[index].prefName,
            data: tmp
          };
          this.setState({
            selected: selected_copy,
            series: [...this.state.series, res_series]
          });
        });
    } else {
      const series_copy = this.state.series.slice();
      for (let i = 0; i < series_copy.length; i++) {
        if (series_copy[i].name === this.state.prefectures[index].prefName) {
          series_copy.splice(i, 1);
        }
      }
      this.setState({
        selected: selected_copy,
        series: series_copy
      });
    }
  }

  renderItem(props) {
    return (
      <div
        key={props.prefCode}
        style={Styles.prefectures}
      >
        <input
          type="checkbox"
          checked={this.state.selected[props.prefCode - 1]}
          onChange={() => this._setSelection(props.prefCode - 1)}
        />
        {props.prefName}
      </div>
    );
  }

  render() {
    const obj = this.state.prefectures;
    const options = {
      title: {
        text: '人口の推移'
      },
      xAxis: {
        title: {
          text: '年度'
        }
      },
      yAxis: { 
        title: { 
            text: '人口数'
        }
      },
      plotOptions: {
        series: {
          label: {
            connectorAllowed: false
          },
          pointInterval: 5,
          pointStart: 1980
        }
      },
      series: this.state.series
    };
    return (
      <div>
        <h1>都道府県</h1>
        {Object.keys(obj).map(i => this.renderItem(obj[i]))}
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    );
  }
}
