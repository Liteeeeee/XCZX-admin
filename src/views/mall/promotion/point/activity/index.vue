<template>
  <doc-alert title="【营销】积分商城活动" url="https://doc.iocoder.cn/mall/promotion-point/" />

  <ContentWrap>
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="积分商品" name="activity" />
      <el-tab-pane label="兑换优惠券" name="coupon" />
    </el-tabs>
  </ContentWrap>

  <PointActivityList v-if="activeTab === 'activity'" />
  <PointCouponExchange v-else />
</template>

<script lang="ts" setup>
import PointActivityList from './PointActivityList.vue'
import PointCouponExchange from './PointCouponExchange.vue'

defineOptions({ name: 'PointActivity' })

const activeTab = ref<'activity' | 'coupon'>('activity')
</script>
