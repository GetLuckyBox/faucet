<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { TabsPaneContext } from 'element-plus'
defineProps({
  msg: String,
})

const activeName = ref('first')
const value1 = ref(true)
const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}
const tableData = [
  {
    port: '6379',
    type: 'redis',
    env: '测试',
    remark: '测试环境01',
  },
  {
    port: '3306',
    type: 'mysql',
    env: '正式',
    remark: '测试环境02',
  },
  {
    port: '27017',
    type: 'mongodb',
    env: '测试',
    remark: 'No. 18',
  },
  {
    port: '6379',
    type: 'redis',
    env: '测试',
    remark: 'No. 189',
  },
]
const tableData1 = [
  {
    port: '27017',
    type: 'mongodb',
    env: '测试',
    remark: 'No. 18',
  },
  {
    port: '6379',
    type: 'redis',
    env: '测试',
    remark: 'No. 189',
  },
  {
    port: '6379',
    type: 'redis',
    env: '测试',
    remark: '国内测试01',
  },
  {
    port: '3306',
    type: 'mysql',
    env: '正式',
    remark: '测试环境02',
  },
]
const dialogFormVisible = ref(false)
const formLabelWidth = '110px'
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
  <el-tabs v-model="activeName" style="width: 700px" @tab-click="handleClick">
    <el-tab-pane label="国内" name="first">
      <el-card class="box-card">
        <el-table :data="tableData1" style="width: 100%">
          <el-table-column prop="env" label="环境" />
          <el-table-column prop="type" label="类型" />
          <el-table-column prop="port" label="端口"  />
          <el-table-column prop="remark" label="备注" />
          <el-table-column fixed="right" label="Operations" width="200px">
            <template #default>
              <el-switch
                  v-model="value1"
                  size="small"
                  active-text="开"
                  inactive-text="关"
              />
              <el-button type="danger" size="small" style="margin-left: 20px" @click="handleClick">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-tab-pane>
    <el-tab-pane label="海外" name="second">
      <el-card class="box-card">
        <el-table :data="tableData" style="width: 100%">
          <el-table-column prop="env" label="环境" />
          <el-table-column prop="type" label="类型" />
          <el-table-column prop="port" label="本地端口"  />
          <el-table-column prop="remark" label="备注" />
          <el-table-column fixed="right" label="Operations" width="200px">
            <template #default>
              <el-switch
                  v-model="value1"
                  size="small"
                  active-text="开"
                  inactive-text="关"
              />
              <el-button type="danger" size="small" style="margin-left: 20px" @click="handleClick">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-tab-pane>
    <div class="example-pagination-block">
      <el-pagination layout="prev, pager, next" :total="50" />
    </div>
  </el-tabs>
  <el-dialog v-model="dialogFormVisible" title="新增隧道">
    <el-form :model="form">
      <el-form-item label="本地端口" :label-width="formLabelWidth">
        <el-input v-model="form.localPort" autocomplete="off" />
      </el-form-item>
      <el-form-item label="远程地址:端口" :label-width="formLabelWidth">
        <el-input v-model="form.remoteAddress" autocomplete="off" />
      </el-form-item>
      <el-form-item label="跳板用户@地址" :label-width="formLabelWidth">
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
      <el-form-item label="区域" :label-width="formLabelWidth">
        <el-input v-model="form.area" autocomplete="off" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="dialogFormVisible = false">
          Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
