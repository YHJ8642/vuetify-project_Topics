<template>
  <div style="width: 100%; height: 400px">
    <Pie :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { Pie } from "vue-chartjs";
import { computed, reactive } from "vue";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";
ChartJS.register(Title, Tooltip, Legend, ArcElement);

const props = defineProps({ posts: { type: Array, required: true } });

// 產生統一顏色
const generateColors = (num) => {
  const colors = [];
  for (let i = 0; i < num; i++) {
    const hue = Math.floor((360 / num) * i);
    colors.push(`hsl(${hue}, 70%, 60%)`);
  }
  return colors;
};

const chartData = computed(() => {
  if (!props.posts || props.posts.length === 0) {
    return { labels: [], datasets: [{ data: [], backgroundColor: [] }] };
  }

  // legend / label 用裁切後的標題
  const labels = props.posts.map((p) => {
    const title = p.title || "未知文章";
    return title.length > 10 ? title.slice(0, 10) + "..." : title;
  });

  const data = props.posts.map((p) => p.clickCount || 0);
  const backgroundColor = generateColors(props.posts.length);

  return {
    labels,
    datasets: [
      {
        // 保留完整標題 (tooltip 用)
        fullTitles: props.posts.map((p) => p.title || "未知文章"),
        label: "文章點擊量",
        data,
        backgroundColor,
      },
    ],
  };
});

// Chart 設定（加入動畫）
const chartOptions = reactive({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom" },
    title: { display: true, text: "文章點擊量圓餅圖" },
    tooltip: {
      callbacks: {
        label: function (context) {
          const dataset = context.dataset;
          const fullTitle =
            dataset.fullTitles?.[context.dataIndex] || "未知文章";
          const count = context.raw || 0;
          return `${fullTitle}: ${count} 次點擊`;
        },
      },
    },
  },
  animation: {
    animateRotate: true,
    animateScale: true,
    duration: 1500,
    easing: "easeOutQuart",
  },
});
</script>
