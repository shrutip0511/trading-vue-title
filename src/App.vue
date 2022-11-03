<template>
  <div>
     <label for="start">Start date:</label>

    <input type="checkbox" id="start" @change="changeType" name="trip-start" />
<!--    <select v-model="chartType" @change="changeType">
      <option value="Candle">Candle</option>
      <option value="Splines">Splines</option>
    </select>-->
<!--    <button @click="handleDate">Go to date</button> -->

    <trading-vue
      :enableZoom="enableZoom"
      :priceLine="priceLine"
      :decimalPlace="decimalPlace"
      :applyShaders="applyShaders"
      :enableCrosshair="enableCrosshair"
      :data="chart"
      :width="this.width"
      :height="this.height"
      :color-back="colors.colorBack"
      :color-grid="colors.colorGrid"
      :color-text="colors.colorText"
      :legend-buttons="buttons"
      :ignore_OHLC="['Spline']"
    >
    </trading-vue>
  </div>
</template>

<script>
import TradingVue from "./TradingVue.vue";
import Data from "../data/data.json";
import Data2 from "../test/data/data_buttons.json";
import CodeIcon from "../test/tests/LegendButtons/code3.json";
import DataCube from "../src/helpers/datacube.js";

export default {
  name: "App",
  components: {
    TradingVue,
  },
  data() {
    return {
      buttons: ["display", "settings", "remove"],
      enableZoom: true,
      decimalPlace:2,
      chartType:"Candle",
      priceLine:true,
      applyShaders:true,
      enableCrosshair:false,
      chart: new DataCube(Data),
      width: window.innerWidth,
      height: window.innerHeight,
      date: "",
      colors: {
        colorBack: "#fff",
        colorGrid: "#eee",
        colorText: "#333",
      },
    };
  },
  mounted() {
    window.addEventListener("resize", this.onResize);
    window.dc = this.chart;
    // this.chart.data.chart.type = "Splines";
    // console.log("chart", this.chart.tv);
    // this.chart.tv.goto(1543626000000);
    // console.log('Data2',this.chart.data.chart)
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
  },
  methods: {
    changeType(){
      let data = this.chart.get_one('chart.settings.priceLine')
      // console.log("priceLine",data.priceLine)
      this.chart.merge("chart.settings",{
        priceLine:!data.priceLine
      })
      // console.log("this.chart.data.chart",candles)
      // this.chart.data.chart.type = this.chartType;
    },
    handleDate() {
      let convertedDate= new Date(this.date)
      console.log("date",convertedDate.getTime())
      this.chart.tv.goto(convertedDate.getTime);
    },
    onResize() {
      this.width = window.innerWidth * 0.9;
      this.height = window.innerHeight * 0.9;
    },

    handleCrosshair(){
      console.log(this.enableCrosshair)
      this.enableCrosshair = !this.enableCrosshair
    }
  },
  //   mounted(){
  //   this.goto(1543572000000)
  // }
};
</script>

<style>
html,
body {
  background-color: #000;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
.container{
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.backclass{
  clip-path: polygon(40% 20%, 100% 20%, 100% 80%, 40% 80%, 39% 81%, 0% 50%);
  background-color: #399bf7;
  width: 60px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  color: white;
  font-size: 16px;
}
</style>
