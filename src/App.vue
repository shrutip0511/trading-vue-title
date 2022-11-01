<template>
  <div>
    <!-- <div>
      <button @click="handleCrosshair">{{enableCrosshair ? 'Disable Crosshair' : 'Enable Crosshair' }}</button>
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
      enableCrosshair:true,
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
</style>
