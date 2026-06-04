<template>
  <ContentWrap>
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
      label-width="100px"
    >
      <el-form-item label="展示名称" prop="name">
        <el-input
          v-model="queryParams.name"
          class="!w-240px"
          clearable
          placeholder="请输入展示名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="活动状态" prop="status">
        <el-select v-model="queryParams.status" class="!w-240px" clearable placeholder="全部">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
        <el-button
          v-hasPermi="['promotion:point-coupon-exchange:create']"
          plain
          type="primary"
          @click="openForm('create')"
        >
          <Icon class="mr-5px" icon="ep:plus" />
          新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="list" :show-overflow-tooltip="true" :stripe="true">
      <el-table-column label="编号" min-width="80" prop="id" />
      <el-table-column label="展示图片" min-width="80" prop="picUrl">
        <template #default="{ row }">
          <el-image
            v-if="row.picUrl"
            :preview-src-list="[row.picUrl]"
            :src="row.picUrl"
            class="h-40px w-40px"
            preview-teleported
          />
        </template>
      </el-table-column>
      <el-table-column label="展示名称" min-width="160" prop="name" />
      <el-table-column label="优惠券模板" min-width="160" prop="couponTemplateName" />
      <el-table-column align="center" label="所需积分" min-width="100" prop="point" />
      <el-table-column align="center" label="总次数" min-width="90" prop="totalCount" />
      <el-table-column align="center" label="已兑换" min-width="90" prop="exchangedCount" />
      <el-table-column align="center" label="每人上限" min-width="100" prop="takeLimitCount" />
      <el-table-column align="center" label="状态" min-width="90" prop="status">
        <template #default="scope">
          <el-switch
            v-hasPermi="['promotion:point-coupon-exchange:update-status']"
            v-model="scope.row.status"
            :active-value="0"
            :inactive-value="1"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column align="center" label="排序" min-width="80" prop="sort" />
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="创建时间"
        prop="createTime"
        width="180"
      />
      <el-table-column align="center" fixed="right" label="操作" width="140px">
        <template #default="scope">
          <el-button
            v-hasPermi="['promotion:point-coupon-exchange:update']"
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
          >
            修改
          </el-button>
          <el-button
            v-hasPermi="['promotion:point-coupon-exchange:delete']"
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
          >
            删除
          </el-button>
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

  <PointCouponExchangeForm ref="formRef" @success="getList" />
</template>

<script lang="ts" setup>
import { CommonStatusEnum } from '@/utils/constants'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import { PointCouponExchangeApi } from '@/api/mall/promotion/point'
import PointCouponExchangeForm from './PointCouponExchangeForm.vue'

defineOptions({ name: 'PointCouponExchangeTemplateList' })

const message = useMessage()
const { t } = useI18n()

const loading = ref(true)
const total = ref(0)
const list = ref([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: null,
  status: null,
  couponTemplateId: null,
  createTime: []
})
const queryFormRef = ref()

const getList = async () => {
  loading.value = true
  try {
    const data = await PointCouponExchangeApi.getPointCouponExchangePage(queryParams)
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

const formRef = ref()
const openForm = (type: 'create' | 'update', id?: number) => {
  formRef.value.open(type, id)
}

const handleStatusChange = async (row: any) => {
  const text = row.status === CommonStatusEnum.ENABLE ? '启用' : '停用'
  try {
    await message.confirm('确认要"' + text + '""' + row.name + '"兑换模板吗?')
    await PointCouponExchangeApi.updatePointCouponExchangeStatus(row.id, row.status)
    message.success(text + '成功')
  } catch {
    row.status =
      row.status === CommonStatusEnum.ENABLE ? CommonStatusEnum.DISABLE : CommonStatusEnum.ENABLE
  }
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await PointCouponExchangeApi.deletePointCouponExchange(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

onMounted(() => {
  getList()
})
</script>
