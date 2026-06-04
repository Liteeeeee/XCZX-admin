<template>
  <ContentWrap>
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="兑换模板" name="template" />
      <el-tab-pane label="兑换流水" name="record" />
    </el-tabs>
  </ContentWrap>

  <PointCouponExchangeTemplateList v-if="activeTab === 'template'" />
  <PointCouponExchangeRecordList v-else />
</template>

<script setup lang="ts">
import PointCouponExchangeTemplateList from './PointCouponExchangeTemplateList.vue'
import PointCouponExchangeRecordList from './PointCouponExchangeRecordList.vue'

const activeTab = ref<'template' | 'record'>('template')
</script>
