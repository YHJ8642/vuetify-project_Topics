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
  const labels = props.posts.map((p) => p.title);
  const data = props.posts.map((p) => p.clickCount || 0);
  const backgroundColor = generateColors(props.posts.length);

  return {
    labels,
    datasets: [
      {
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
          const post = props.posts[context.dataIndex];
          const title = post?.title || "未知文章";
          const count = post?.clickCount || 0;
          return `${title}: ${count} 次點擊`;
        },
      },
    },
  },
  animation: {
    animateRotate: true,
    animateScale: true,
    duration: 1500, // 1.5秒動畫
    easing: "easeOutQuart",
  },
});
</script>
