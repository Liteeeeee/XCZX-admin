<template>
  <doc-alert title="【交易】分销返佣" url="https://doc.iocoder.cn/mall/trade-brokerage/" />

  <ContentWrap>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="分销申请" name="apply">
        <el-form
          class="-mb-15px"
          :model="applyQueryParams"
          ref="applyQueryFormRef"
          :inline="true"
          label-width="68px"
        >
          <el-form-item label="状态" prop="status">
            <el-select v-model="applyQueryParams.status" placeholder="请选择状态" clearable class="!w-240px">
              <el-option v-for="item in applyStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="省份ID" prop="provinceId">
            <el-input
              v-model="applyQueryParams.provinceId"
              placeholder="请输入省份ID"
              clearable
              @keyup.enter="handleApplyQuery"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item label="城市ID" prop="cityId">
            <el-input
              v-model="applyQueryParams.cityId"
              placeholder="请输入城市ID"
              clearable
              @keyup.enter="handleApplyQuery"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item label="负责人" prop="leaderName">
            <el-input
              v-model="applyQueryParams.leaderName"
              placeholder="请输入负责人名称"
              clearable
              @keyup.enter="handleApplyQuery"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item label="创建时间" prop="createTime">
            <el-date-picker
              v-model="applyQueryParams.createTime"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="daterange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item>
            <el-button @click="handleApplyQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
            <el-button @click="resetApplyQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="applyLoading" :data="applyList" :stripe="true" :show-overflow-tooltip="true">
          <el-table-column label="编号" align="left" prop="id" min-width="80px" />
          <el-table-column label="申请人编号" align="left" prop="userId" min-width="100px" />
          <el-table-column label="省份ID" align="left" prop="provinceId" min-width="90px" />
          <el-table-column label="城市ID" align="left" prop="cityId" min-width="90px" />
          <el-table-column label="职业" align="left" prop="occupation" min-width="120px" />
          <el-table-column label="补充信息" align="left" prop="additionalInfo" min-width="140px" />
          <el-table-column label="重提次数" align="left" prop="resubmitCount" min-width="80px" />
          <el-table-column label="状态" align="left" prop="status" min-width="80px">
            <template #default="scope">
              <el-tag :type="getApplyStatusTagType(scope.row.status)">
                {{ getApplyStatusLabel(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="审核人" align="left" prop="auditUserName" min-width="100px" />
          <el-table-column label="审核时间" align="left" prop="auditTime" min-width="160px" />
          <el-table-column label="拒绝原因" align="left" prop="refuseReason" min-width="160px" />
          <el-table-column label="创建时间" align="left" prop="createTime" min-width="160px" />
          <el-table-column label="操作" align="center" min-width="160px">
            <template #default="scope">
              <el-button link type="primary" @click="openDetail(scope.row.id)">详情</el-button>
              <el-button
                v-if="scope.row.status === 0"
                link
                type="success"
                @click="handleApprove(scope.row.id)"
                v-hasPermi="['trade:brokerage-apply:audit']"
              >
                通过
              </el-button>
              <el-button
                v-if="scope.row.status === 0"
                link
                type="danger"
                @click="openRejectForm(scope.row.id)"
                v-hasPermi="['trade:brokerage-apply:audit']"
              >
                驳回
              </el-button>
              <el-button v-if="scope.row.status === 2" link type="warning" @click="openResubmitForm(scope.row.id)">
                重新审批
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <Pagination
          :total="applyTotal"
          v-model:page="applyQueryParams.pageNo"
          v-model:limit="applyQueryParams.pageSize"
          @pagination="getApplyList"
        />
      </el-tab-pane>

      <el-tab-pane label="审核记录" name="record">
        <el-form
          class="-mb-15px"
          :model="recordQueryParams"
          ref="recordQueryFormRef"
          :inline="true"
          label-width="68px"
        >
          <el-form-item label="申请人" prop="userId">
            <el-input
              v-model="recordQueryParams.userId"
              placeholder="请输入申请人编号"
              clearable
              @keyup.enter="handleRecordQuery"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item label="申请编号" prop="applyId">
            <el-input
              v-model="recordQueryParams.applyId"
              placeholder="请输入申请编号"
              clearable
              @keyup.enter="handleRecordQuery"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item label="审核结果" prop="status">
            <el-select v-model="recordQueryParams.status" placeholder="请选择审核结果" clearable class="!w-240px">
              <el-option v-for="item in auditResultOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="审核人" prop="auditUserId">
            <el-input
              v-model="recordQueryParams.auditUserId"
              placeholder="请输入审核人编号"
              clearable
              @keyup.enter="handleRecordQuery"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item label="审核时间" prop="auditTime">
            <el-date-picker
              v-model="recordQueryParams.auditTime"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="daterange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
              class="!w-240px"
            />
          </el-form-item>
          <el-form-item>
            <el-button @click="handleRecordQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
            <el-button @click="resetRecordQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="recordLoading" :data="recordList" :stripe="true" :show-overflow-tooltip="true">
          <el-table-column label="编号" align="left" prop="id" min-width="80px" />
          <el-table-column label="申请人编号" align="left" prop="userId" min-width="100px" />
          <el-table-column label="申请编号" align="left" prop="applyId" min-width="100px" />
          <el-table-column label="审核结果" align="left" prop="status" min-width="100px">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                {{ scope.row.status === 1 ? '通过' : '拒绝' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="审核人" align="left" prop="auditUserName" min-width="120px" />
          <el-table-column label="审核时间" align="left" prop="auditTime" min-width="160px" />
          <el-table-column label="审核原因" align="left" prop="auditReason" min-width="200px" />
        </el-table>
        <Pagination
          :total="recordTotal"
          v-model:page="recordQueryParams.pageNo"
          v-model:limit="recordQueryParams.pageSize"
          @pagination="getRecordList"
        />
      </el-tab-pane>
    </el-tabs>
  </ContentWrap>

  <Dialog title="申请详情" v-model="detailVisible" width="800px">
    <el-descriptions :column="2" border v-loading="detailLoading">
      <el-descriptions-item label="申请编号">{{ detailData?.id }}</el-descriptions-item>
      <el-descriptions-item label="申请人编号">{{ detailData?.userId }}</el-descriptions-item>
      <el-descriptions-item label="省份ID">{{ detailData?.provinceId }}</el-descriptions-item>
      <el-descriptions-item label="城市ID">{{ detailData?.cityId }}</el-descriptions-item>
      <el-descriptions-item label="职业">{{ detailData?.occupation }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag v-if="detailData" :type="getApplyStatusTagType(detailData.status)">
          {{ getApplyStatusLabel(detailData.status) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="身份证号">{{ detailData?.idCardNo }}</el-descriptions-item>
      <el-descriptions-item label="补充信息">{{ detailData?.additionalInfo }}</el-descriptions-item>
      <el-descriptions-item label="身份证正面">
        <el-image
          v-if="detailData?.idCardFrontUrl"
          style="width: 120px; height: 80px"
          :src="detailData.idCardFrontUrl"
          :preview-src-list="[detailData.idCardFrontUrl]"
          fit="cover"
        />
      </el-descriptions-item>
      <el-descriptions-item label="身份证反面">
        <el-image
          v-if="detailData?.idCardBackUrl"
          style="width: 120px; height: 80px"
          :src="detailData.idCardBackUrl"
          :preview-src-list="[detailData.idCardBackUrl]"
          fit="cover"
        />
      </el-descriptions-item>
      <el-descriptions-item label="拒绝原因">{{ detailData?.refuseReason }}</el-descriptions-item>
      <el-descriptions-item label="审核人">{{ detailData?.auditUserName }}</el-descriptions-item>
      <el-descriptions-item label="审核时间">{{ detailData?.auditTime }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ detailData?.createTime }}</el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="detailVisible = false">关 闭</el-button>
    </template>
  </Dialog>

  <BrokerageApplyRejectForm ref="rejectFormRef" @success="getApplyList" />
  <BrokerageApplyResubmitForm ref="resubmitFormRef" @success="getApplyList" />
</template>

<script setup lang="ts">
import * as BrokerageApplyApi from '@/api/mall/trade/brokerage/approval'
import BrokerageApplyRejectForm from './components/BrokerageApplyRejectForm.vue'
import BrokerageApplyResubmitForm from './components/BrokerageApplyResubmitForm.vue'

defineOptions({ name: 'TradeBrokerageApproval' })

const message = useMessage()
const { t } = useI18n()

const activeTab = ref('apply')

const applyLoading = ref(true)
const applyList = ref([])
const applyTotal = ref(0)
const applyQueryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  status: undefined,
  provinceId: undefined,
  cityId: undefined,
  leaderName: undefined,
  createTime: undefined
})
const applyQueryFormRef = ref()
const applyStatusOptions = [
  { label: '待审核', value: 0 },
  { label: '通过', value: 1 },
  { label: '拒绝', value: 2 }
]

const getApplyStatusLabel = (status: number) => {
  return applyStatusOptions.find((item) => item.value === status)?.label || '未知'
}
const getApplyStatusTagType = (status: number) => {
  if (status === 0) return 'warning'
  if (status === 1) return 'success'
  if (status === 2) return 'danger'
  return 'info'
}

const getApplyList = async () => {
  applyLoading.value = true
  try {
    const data = await BrokerageApplyApi.getBrokerageApplyPage(applyQueryParams)
    applyList.value = data.list
    applyTotal.value = data.total
  } finally {
    applyLoading.value = false
  }
}

const handleApplyQuery = () => {
  applyQueryParams.pageNo = 1
  getApplyList()
}

const resetApplyQuery = () => {
  applyQueryFormRef.value.resetFields()
  handleApplyQuery()
}

const handleApprove = async (id: number) => {
  try {
    await message.confirm('确认通过该分销申请？')
    await BrokerageApplyApi.auditBrokerageApply({ id, status: 1 })
    message.success(t('common.updateSuccess'))
    await getApplyList()
  } catch {}
}

const rejectFormRef = ref()
const openRejectForm = (id: number) => {
  rejectFormRef.value.open(id)
}

const resubmitFormRef = ref()
const openResubmitForm = (id: number) => {
  resubmitFormRef.value.open(id)
}

const detailVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref<BrokerageApplyApi.BrokerageApplyVO>()
const openDetail = async (id: number) => {
  detailVisible.value = true
  detailLoading.value = true
  try {
    detailData.value = await BrokerageApplyApi.getBrokerageApply(id)
  } finally {
    detailLoading.value = false
  }
}

const recordLoading = ref(true)
const recordList = ref([])
const recordTotal = ref(0)
const recordQueryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: undefined,
  applyId: undefined,
  status: undefined,
  auditUserId: undefined,
  auditTime: undefined
})
const recordQueryFormRef = ref()
const auditResultOptions = [
  { label: '通过', value: 1 },
  { label: '拒绝', value: 2 }
]

const getRecordList = async () => {
  recordLoading.value = true
  try {
    const data = await BrokerageApplyApi.getBrokerageApplyAuditRecordPage(recordQueryParams)
    recordList.value = data.list
    recordTotal.value = data.total
  } finally {
    recordLoading.value = false
  }
}

const handleRecordQuery = () => {
  recordQueryParams.pageNo = 1
  getRecordList()
}

const resetRecordQuery = () => {
  recordQueryFormRef.value.resetFields()
  handleRecordQuery()
}

watch(
  activeTab,
  () => {
    if (activeTab.value === 'record') {
      getRecordList()
      return
    }
    getApplyList()
  },
  { immediate: true }
)
</script>
