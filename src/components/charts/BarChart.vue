<template>
  <div style="width: 100%; height: 400px">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { Bar } from "vue-chartjs";
import { reactive, computed } from "vue";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const props = defineProps({
  posts: { type: Array, required: true },
});

// 統一顏色生成
function generateColors(num) {
  const colors = [];
  for (let i = 0; i < num; i++) {
    const hue = Math.floor((360 / num) * i);
    colors.push(`hsl(${hue}, 70%, 60%)`);
  }
  return colors;
}

const chartData = computed(() => {
  if (!props.posts || props.posts.length === 0) {
    return { labels: [], datasets: [] };
  }

  // 先複製並排序 posts
  const sortedPosts = [...props.posts].sort((a, b) => {
    const aCount = a.commentCount || 0;
    const bCount = b.commentCount || 0;
    return bCount - aCount; // 大到小
  });

  // X 軸標籤（裁切後）
  const labels = sortedPosts.map((p) => {
    const title = p.title || "未知文章";
    return title.length > 10 ? title.slice(0, 10) + "..." : title;
  });

  const colors = generateColors(sortedPosts.length);

  return {
    labels,
    datasets: sortedPosts.map((p, i) => {
      const data = labels.map((_, j) => (i === j ? p.commentCount || 0 : null));
      return {
        // legend 也顯示裁切版
        label: p.title.length > 10 ? p.title.slice(0, 10) + "..." : p.title,
        // tooltip 用完整標題（放進 dataset 自訂屬性）
        fullTitle: p.title,
        data,
        backgroundColor: colors[i],
      };
    }),
  };
});

const chartOptions = reactive({
  responsive: true,
  maintainAspectRatio: false, // 關掉內建比例
  aspectRatio: 2, // 寬 : 高 = 2:1，可依需求調整
  plugins: {
    legend: { position: "bottom" },
    title: { display: true, text: "各貼文留言數" },
    tooltip: {
      callbacks: {
        label: function (context) {
          const dataset = context.dataset;
          const fullTitle = dataset.fullTitle || "未知文章";
          const count = context.raw || 0;
          return `${fullTitle}: ${count} 則留言`;
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        maxRotation: 0,
        minRotation: 0,
        callback: function (val, index) {
          const label = this.getLabelForValue(index);
          if (label.length > 10) {
            return label.match(/.{1,10}/g); // 每10字換行
          }
          return label;
        },
      },
    },
    y: { beginAtZero: true },
  },
  animation: {
    duration: 1500, // 1.5秒動畫
    easing: "easeOutQuart",
  },
});
</script>
