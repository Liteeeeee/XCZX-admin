<template>
  <ContentWrap v-hasPermi="['promotion:point-coupon-exchange-record:page']">
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
      label-width="100px"
    >
      <el-form-item label="兑换配置编号" prop="exchangeId">
        <el-input
          v-model="queryParams.exchangeId"
          class="!w-240px"
          clearable
          placeholder="请输入兑换配置编号"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户编号" prop="userId">
        <el-input
          v-model="queryParams.userId"
          class="!w-240px"
          clearable
          placeholder="请输入用户编号"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="优惠券模板" prop="couponTemplateId">
        <el-input
          v-model="queryParams.couponTemplateId"
          class="!w-240px"
          clearable
          placeholder="请输入优惠券模板编号"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-input
          v-model="queryParams.status"
          class="!w-240px"
          clearable
          placeholder="请输入状态"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="幂等请求号" prop="requestNo">
        <el-input
          v-model="queryParams.requestNo"
          class="!w-240px"
          clearable
          placeholder="请输入幂等请求号"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
          end-placeholder="结束日期"
          start-placeholder="开始日期"
          type="daterange"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon class="mr-5px" icon="ep:search" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon class="mr-5px" icon="ep:refresh" />
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap v-hasPermi="['promotion:point-coupon-exchange-record:page']">
    <el-table v-loading="loading" :data="list" :show-overflow-tooltip="true" :stripe="true">
      <el-table-column label="流水编号" min-width="80" prop="id" />
      <el-table-column label="兑换配置" min-width="160" prop="exchangeName" />
      <el-table-column align="center" label="用户编号" min-width="100" prop="userId" />
      <el-table-column label="优惠券名称" min-width="160" prop="couponName" />
      <el-table-column align="center" label="消耗积分" min-width="90" prop="point" />
      <el-table-column align="center" label="状态" min-width="80" prop="status" />
      <el-table-column label="失败原因" min-width="160" prop="errorMsg" />
      <el-table-column label="幂等请求号" min-width="180" prop="requestNo" />
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="创建时间"
        prop="createTime"
        width="180"
      />
      <el-table-column
        v-hasPermi="['promotion:point-coupon-exchange-record:get']"
        align="center"
        fixed="right"
        label="操作"
        width="90px"
      >
        <template #default="scope">
          <el-button link type="primary" @click="openDetail(scope.row.id)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <Dialog v-model="detailVisible" title="兑换流水详情" width="700px">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="流水编号">{{ detailData?.id }}</el-descriptions-item>
      <el-descriptions-item label="兑换配置编号">{{ detailData?.exchangeId }}</el-descriptions-item>
      <el-descriptions-item label="兑换配置名称">{{ detailData?.exchangeName }}</el-descriptions-item>
      <el-descriptions-item label="用户编号">{{ detailData?.userId }}</el-descriptions-item>
      <el-descriptions-item label="优惠券模板编号">{{ detailData?.couponTemplateId }}</el-descriptions-item>
      <el-descriptions-item label="优惠券编号">{{ detailData?.couponId }}</el-descriptions-item>
      <el-descriptions-item label="优惠券名称">{{ detailData?.couponName }}</el-descriptions-item>
      <el-descriptions-item label="消耗积分">{{ detailData?.point }}</el-descriptions-item>
      <el-descriptions-item label="状态">{{ detailData?.status }}</el-descriptions-item>
      <el-descriptions-item label="幂等请求号" :span="2">{{ detailData?.requestNo }}</el-descriptions-item>
      <el-descriptions-item label="失败原因" :span="2">{{ detailData?.errorMsg }}</el-descriptions-item>
      <el-descriptions-item label="创建时间" :span="2">
        {{ formatDate(detailData?.createTime) }}
      </el-descriptions-item>
    </el-descriptions>
  </Dialog>
</template>

<script lang="ts" setup>
import { dateFormatter, formatDate } from '@/utils/formatTime'
import { PointCouponExchangeApi, type PointCouponExchangeRecordRespVO } from '@/api/mall/promotion/point'

defineOptions({ name: 'PointCouponExchangeRecordList' })

const loading = ref(true)
const total = ref(0)
const list = ref([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  exchangeId: null,
  userId: null,
  couponTemplateId: null,
  status: null,
  requestNo: null,
  createTime: []
})
const queryFormRef = ref()

const getList = async () => {
  loading.value = true
  try {
    const data = await PointCouponExchangeApi.getPointCouponExchangeRecordPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}

const detailVisible = ref(false)
const detailData = ref<PointCouponExchangeRecordRespVO>()
const openDetail = async (id: number) => {
  detailVisible.value = true
  detailData.value = undefined
  detailData.value = await PointCouponExchangeApi.getPointCouponExchangeRecord(id)
}

onMounted(() => {
  getList()
})
</script>
