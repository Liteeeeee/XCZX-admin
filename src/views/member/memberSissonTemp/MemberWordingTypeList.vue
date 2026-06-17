<template>
  <ContentWrap>
    <div class="mb-12px flex items-center justify-between">
      <div class="text-14px text-[var(--el-text-color-regular)]">
        话术类型来自后端功能常量列表，用于展示后端定义好的可用选项。
      </div>
      <el-button @click="getList">
        <Icon icon="ep:refresh" class="mr-5px" />
        刷新
      </el-button>
    </div>

    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <template v-if="columns.length > 0">
        <el-table-column
          v-for="column in columns"
          :key="column"
          :label="columnLabelMap[column] || column"
          :prop="column"
          :min-width="columnWidthMap[column] || 140"
          align="center"
        />
      </template>
      <el-table-column v-else label="暂无数据" min-width="200" align="center">
        <template #default>
          <el-empty description="暂无话术类型数据" />
        </template>
      </el-table-column>
    </el-table>
  </ContentWrap>
</template>

<script setup lang="ts">
import * as WordingApi from '@/api/member/wording'

defineOptions({ name: 'MemberWordingTypeList' })

type GenericRecord = Record<string, any>

const loading = ref(false)
const list = ref<GenericRecord[]>([])

const columnPriority = [
  'groupName',
  'groupKey',
  'categoryCode',
  'typeCode',
  'code',
  'name',
  'label',
  'value',
  'description',
  'desc',
  'remark',
  'sort',
  'status'
]

const columnLabelMap: Record<string, string> = {
  groupName: '分组名称',
  groupKey: '分组编码',
  categoryCode: '分类编码',
  typeCode: '类型编码',
  code: '编码',
  name: '名称',
  label: '显示名称',
  value: '值',
  description: '描述',
  desc: '描述',
  remark: '备注',
  sort: '排序',
  status: '状态'
}

const columnWidthMap: Record<string, number> = {
  description: 220,
  desc: 220,
  remark: 220
}

const isPlainObject = (value: unknown): value is GenericRecord => {
  return Object.prototype.toString.call(value) === '[object Object]'
}

const appendRow = (
  rows: GenericRecord[],
  item: unknown,
  extra: GenericRecord = {}
) => {
  if (isPlainObject(item)) {
    rows.push({ ...extra, ...item })
    return
  }
  rows.push({ ...extra, value: item })
}

const normalizeConstantList = (data: unknown): GenericRecord[] => {
  if (Array.isArray(data)) {
    return data.map((item) => (isPlainObject(item) ? item : { value: item }))
  }
  if (!isPlainObject(data)) {
    return []
  }

  if (Array.isArray(data.list)) {
    return data.list.map((item: unknown) => (isPlainObject(item) ? item : { value: item }))
  }

  const rows: GenericRecord[] = []
  Object.entries(data).forEach(([groupKey, groupValue]) => {
    if (Array.isArray(groupValue)) {
      groupValue.forEach((item) => appendRow(rows, item, { groupKey }))
      return
    }
    if (isPlainObject(groupValue)) {
      Object.entries(groupValue).forEach(([innerKey, innerValue]) => {
        if (Array.isArray(innerValue)) {
          innerValue.forEach((item) => appendRow(rows, item, { groupKey, groupName: innerKey }))
          return
        }
        if (isPlainObject(innerValue)) {
          rows.push({ groupKey, groupName: innerKey, ...innerValue })
          return
        }
        rows.push({ groupKey, name: innerKey, value: innerValue })
      })
      return
    }
    rows.push({ groupKey, value: groupValue })
  })
  return rows
}

const columns = computed(() => {
  const keySet = new Set<string>()
  list.value.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (item[key] !== undefined && item[key] !== null && item[key] !== '') {
        keySet.add(key)
      }
    })
  })
  const keys = Array.from(keySet)
  return keys.sort((a, b) => {
    const aIndex = columnPriority.indexOf(a)
    const bIndex = columnPriority.indexOf(b)
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })
})

const getList = async () => {
  loading.value = true
  try {
    const data = await WordingApi.getMemberWordingConstantList()
    list.value = normalizeConstantList(data)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getList()
})
</script>
