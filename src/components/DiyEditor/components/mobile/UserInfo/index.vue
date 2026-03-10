<template>
  <div class="user-info">
    <div class="header">
      <div class="title">{{ property.title }}</div>
    </div>
    <div class="menu-list">
      <div
        v-for="(item, index) in property.items"
        :key="index"
        class="menu-item"
        @click="handleClick(item)"
      >
        <div class="left">
          <Icon :icon="item.icon" :size="24" color="#333" />
          <span class="name">{{ item.name }}</span>
        </div>
        <Icon icon="ep:arrow-right" :size="16" color="#999" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserInfoProperty } from './config'

/** 用户信息 */
defineOptions({ name: 'UserInfo' })
// 定义属性
const props = defineProps<{ property: UserInfoProperty }>()

/** 点击菜单项 */
const handleClick = (item: any) => {
  console.log('点击菜单项:', item.name)
}
</script>

<style scoped lang="scss">
.user-info {
  .header {
    margin-bottom: 20px;
    .title {
      font-size: 18px;
      font-weight: bold;
      color: #333;
    }
  }

  .menu-list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .menu-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      padding: 8px 0;

      .left {
        display: flex;
        align-items: center;
        gap: 12px;

        .name {
          font-size: 16px;
          color: #333;
        }
      }

      &:active {
        opacity: 0.7;
      }
    }
  }
}
</style>
