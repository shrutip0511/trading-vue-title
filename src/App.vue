<template>
  <div>
    <!-- <div class="">
      <button @click="handleCrosshair">{{enableCrosshair ? 'Disable Crosshair' : 'Enable Crosshair' }}</button>
    </div> -->
    <!-- <div class="container">
      <span class="backclass">0.315</span>
    </div> -->
    <trading-vue
    :enableZoom="enableZoom"
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
      buttons:['display', 'settings', 'remove'],
      enableZoom: true,
      enableCrosshair:false,
      chart: new DataCube(Data),
      width: window.innerWidth,
      height: window.innerHeight,
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
    this.chart.data.chart.type='Spline'
    // console.log('Data2',this.chart.data.chart)
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
  },
  methods: {
    onResize() {
      this.width = window.innerWidth * .9;
      this.height = window.innerHeight * .9;
    },

    handleCrosshair(){
      console.log(this.enableCrosshair)
      this.enableCrosshair = !this.enableCrosshair
    }
  },
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
