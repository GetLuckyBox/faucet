<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { TabsPaneContext } from 'element-plus'

defineProps({
  msg: String,
})

import { exec }  from 'child_process';
import {fa} from "element-plus/es/locale";
let dialogFormVisible = ref(false)
let dialogFormTitle = ref('新增隧道')
const activeName = ref('first')
const value1 = ref(true)
const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}

const handleEdit = (row: any) => {
  dialogFormTitle.value = '编辑隧道'
  form.area = row.area
  form.appType = row.appType
  form.env = row.env
  form.localPort = row.localPort
  form.jumpAddress = row.jumpAddress
  form.remoteAddress = row.remoteAddress
  form.remark = row.remark
  dialogFormVisible.value = true
}
const tableData = [
  {
    localPort: '63791',
    remoteAddress: 'sdk-db.cegrizwp1nwf.ap-southeast-1.rds.amazonaws.com:3306',
    jumpAddress: 'root@18.138.243.238',
    appType: 'mongoDb',
    env: '测试',
    area: '国内',
    remark: '手游',
    isClose: 0,
  },
  {
    localPort: '6379',
    remoteAddress: 'redis',
    jumpAddress: '测试',
    appType: 'mysql',
    env: '测试',
    area: '海外',
    remark: '推送',
    isClose: 1,
  },
  {
    localPort: '6379',
    remoteAddress: 'redis',
    jumpAddress: '测试',
    appType: 'redis',
    env: '测试',
    area: '国内',
    remark: '手游',
    isClose: 0,
  },
  {
    localPort: '6379',
    remoteAddress: 'redis',
    jumpAddress: '测试',
    appType: 'mysql',
    env: '测试',
    area: '海外',
    remark: '推送',
    isClose: 1,
  },
  {
    localPort: '6379',
    remoteAddress: 'redis',
    jumpAddress: '测试',
    appType: 'redis',
    env: '测试',
    area: '国内',
    remark: '手游',
    isClose: 0,
  },
  {
    localPort: '6379',
    remoteAddress: 'redis',
    jumpAddress: '测试',
    appType: 'mysql',
    env: '测试',
    area: '海外',
    remark: '推送',
    isClose: 1,
  },
  {
    localPort: '63791',
    remoteAddress: 'sdk-db.cegrizwp1nwf.ap-southeast-1.rds.amazonaws.com:3306',
    jumpAddress: 'root@18.138.243.238',
    appType: 'mongoDb',
    env: '测试',
    area: '国内',
    remark: '手游',
    isClose: 0,
  },
  {
    localPort: '6379',
    remoteAddress: 'redis',
    jumpAddress: '测试',
    appType: 'mysql',
    env: '测试',
    area: '海外',
    remark: '推送',
    isClose: 1,
  },
]

const formLabelWidth = '80px'
const form = reactive({
  localPort: '', // 必填项
  remoteAddress: '',// 必填项
  jumpAddress: '',// 必填项
  appType: '',// 筛选项
  env: '',// 筛选项
  area: '',// 筛选项
  remark: '',
})
</script>

<template>
  <el-button type="primary" @click="dialogFormVisible = true">新增隧道</el-button>
  <el-dialog v-model="dialogFormVisible" :title=dialogFormTitle>
    <el-form :model="form">
      <el-form-item label="本地端口" :label-width="formLabelWidth">
        <el-input v-model="form.localPort" autocomplete="off" />
      </el-form-item>
      <el-form-item label="远程地址" :label-width="formLabelWidth">
        <el-input v-model="form.remoteAddress" autocomplete="off" />
      </el-form-item>
      <el-form-item label="跳板地址" :label-width="formLabelWidth">
        <el-input v-model="form.jumpAddress" autocomplete="off" />
      </el-form-item>
      <el-form-item label="备注" :label-width="formLabelWidth">
        <el-input v-model="form.remark" autocomplete="off" />
      </el-form-item>
      <el-form-item label="应用类型" :label-width="formLabelWidth">
        <el-input v-model="form.appType" autocomplete="off" />
      </el-form-item>
      <el-form-item label="运行环境" :label-width="formLabelWidth">
        <el-input v-model="form.env" autocomplete="off" />
      </el-form-item>
      <el-form-item label="区域名称" :label-width="formLabelWidth">
        <el-input v-model="form.area" autocomplete="off" />
      </el-form-item>
    </el-form>
    <template #footer>
        <el-button @click="dialogFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="dialogFormVisible = false">
          Confirm
        </el-button>
    </template>
  </el-dialog>
  <el-tabs model-value="first">
    <el-tab-pane  label="隧道列表" name="first">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column type="expand">
          <template #default="props">
            <div>
              <el-row :gutter="24">
                <el-col :span="6"><p>本地端口: {{ props.row.localPort }}</p></el-col>
                <el-col :span="6"><p>应用: {{ props.row.appType }}</p></el-col>
                <el-col :span="6"><p>环境: {{ props.row.env }}</p></el-col>
                <el-col :span="6"><p>区域: {{ props.row.area }}</p></el-col>
                <el-col :span="24"><p>备注: {{ props.row.remark }}</p></el-col>
                <el-col :span="24"><p>远程地址: {{ props.row.remoteAddress }}</p></el-col>
                <el-col :span="24"><p>跳板地址: {{ props.row.jumpAddress }}</p></el-col>
              </el-row>
            </div>
            <el-button type="primary" size="small" @click="handleEdit(props)">编辑</el-button>
            <el-button type="danger" size="small" style="margin-left: 20px" @click="handleClick">删除</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="localPort" label="本地端口"  />
        <el-table-column prop="appType" width="100px" label="应用" />
        <el-table-column prop="env" label="环境" />
        <el-table-column prop="area" label="区域" />
        <el-table-column prop="remark" label="备注" />
        <el-table-column fixed="right" align="center" label="操作" width="200px">
          <template #default="props">
            <el-switch
                v-model="props.row.isClose"
                size="small"
                active-value="1"
                active-text="开"
                inactive-value="0"
                inactive-text="关"
            />
          </template>
        </el-table-column>
      </el-table>
      <div class="example-pagination-block" style="float: right;margin-top: 15px">
        <el-pagination layout="prev, pager, next" :total="50" />
      </div>
    </el-tab-pane>
  </el-tabs>

</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
