<template>
  <div class="user-order">
    <div class="header">
      <div class="title">{{ property.title }}</div>
      <div class="more">
        <span>查看全部</span>
        <Icon icon="ep:arrow-right" :size="14" />
      </div>
    </div>
    <div class="order-list">
      <div v-for="(item, index) in property.items" :key="index" class="order-item">
        <Icon :icon="item.icon" :size="28" color="#333" />
        <div class="name">{{ item.name }}</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { UserOrderProperty } from './config'

/** 用户订单 */
defineOptions({ name: 'UserOrder' })
// 定义属性
defineProps<{ property: UserOrderProperty }>()
</script>

<style scoped lang="scss">
.user-order {
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;

    .title {
      font-size: 18px;
      font-weight: bold;
      color: #333;
    }

    .more {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: #999;

      span {
        margin-right: 4px;
      }
    }
  }

  .order-list {
    display: flex;
    justify-content: space-around;

    .order-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      .name {
        font-size: 14px;
        color: #333;
      }
    }
  }
}
</style>
