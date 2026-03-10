<template>
  <div class="user-card-pro" :style="containerStyle">
    <!-- 右上角小程序风格按钮 -->
    <div class="top-right-menu">
      <div class="menu-btn">
        <Icon icon="ep:more-filled" :size="16" />
        <div class="divider"></div>
        <Icon icon="ep:circle-check" :size="16" />
      </div>
    </div>

    <!-- 用户信息区 -->
    <div class="user-info-section">
      <div class="avatar-wrap">
        <el-avatar :size="70" :src="avatar" />
      </div>
      <div class="info-content">
        <div class="nickname-row">
          <span class="nickname">{{ nickname }}</span>
        </div>
        <div class="mobile">{{ mobile }}</div>
      </div>
      <div class="member-badge">
        <Icon icon="ep:medal" :size="14" />
        <span>{{ levelName }}</span>
      </div>
    </div>

    <!-- 资产统计区 -->
    <div class="stats-section">
      <div v-for="(stat, index) in statsData" :key="index" class="stat-item">
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-label">{{ stat.label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CSSProperties } from 'vue'
import { UserCardProProperty } from './config'
import * as MemberUserApi from '@/api/member/user'
import * as WalletApi from '@/api/pay/wallet/balance'
import { useUserStore } from '@/store/modules/user'

/** 用户卡片Pro */
defineOptions({ name: 'UserCardPro' })
// 定义属性
const props = defineProps<{ property: UserCardProProperty }>()

const userStore = useUserStore()
const memberInfo = ref<any>(null)
const walletInfo = ref<any>(null)

// 动态展示数据
const nickname = computed(
  () => memberInfo.value?.nickname || userStore.getUser.nickname || props.property.nickname
)
const mobile = computed(() => memberInfo.value?.mobile || props.property.mobile)
const levelName = computed(() => memberInfo.value?.levelName || props.property.levelName)
const avatar = computed(
  () => memberInfo.value?.avatar || userStore.getUser.avatar || 'https://img.yzcdn.cn/vant/cat.jpeg'
)

// 资产数据
const statsData = computed(() => {
  return [
    {
      label: '余额',
      value: walletInfo.value?.balance
        ? (walletInfo.value.balance / 100).toFixed(2)
        : props.property.stats[0].value
    },
    {
      label: '积分',
      value:
        memberInfo.value?.point !== undefined
          ? memberInfo.value.point
          : props.property.stats[1].value
    },
    { label: '优惠券', value: props.property.stats[2].value } // 优惠券通常需要独立接口，暂用配置值
  ]
})

/** 获取会员信息及资产 */
const loadData = async () => {
  try {
    // 注意：在管理后台 DIY 编辑器预览时，通常没有当前会员上下文
    // 这里演示如何通过 API 获取（假设有一个测试会员 ID 或当前管理员关联了会员）
    const adminUserId = userStore.getUser.id
    if (adminUserId) {
      // 尝试获取会员信息
      // memberInfo.value = await MemberUserApi.getUser(adminUserId)
      // 尝试获取钱包信息
      // walletInfo.value = await WalletApi.getWallet({ userId: adminUserId })
    }
  } catch (e) {
    console.error('获取会员信息失败，使用默认/配置数据', e)
  }
}

onMounted(() => {
  loadData()
})

/** 容器样式 */
const containerStyle = computed((): CSSProperties => {
  return {
    background: 'linear-gradient(to bottom, #e0fde0, #ffffff)',
    borderRadius: '12px',
    position: 'relative',
    overflow: 'hidden'
  }
})
</script>

<style scoped lang="scss">
.user-card-pro {
  padding: 20px;
  box-sizing: border-box;

  .top-right-menu {
    position: absolute;
    top: 15px;
    right: 15px;

    .menu-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid #eee;
      border-radius: 20px;
      padding: 4px 10px;

      .divider {
        width: 1px;
        height: 12px;
        background: #ddd;
      }
    }
  }

  .user-info-section {
    display: flex;
    align-items: center;
    margin-top: 10px;
    margin-bottom: 30px;
    position: relative;

    .avatar-wrap {
      margin-right: 15px;
      border: 2px solid #fff;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .info-content {
      flex: 1;

      .nickname {
        font-size: 20px;
        font-weight: 800;
        color: #000;
        margin-bottom: 4px;
        display: block;
      }

      .mobile {
        font-size: 14px;
        color: #666;
      }
    }

    .member-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      background: #d4f8d4;
      color: #52c41a;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      border: 1px solid #b7eb8f;
    }
  }

  .stats-section {
    display: flex;
    justify-content: space-around;

    .stat-item {
      text-align: center;
      flex: 1;

      .stat-value {
        font-size: 18px;
        font-weight: 800;
        color: #000;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 14px;
        color: #888;
      }
    }
  }
}
</style>
