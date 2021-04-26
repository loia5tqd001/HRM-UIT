import { allEmployees } from '@/services/employee';
import {
  CheckOutlined,
  EditOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  HistoryOutlined,
  ManOutlined,
  MessageOutlined,
  PlusOutlined,
  RollbackOutlined,
  WomanOutlined,
} from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, DatePicker, Form, Progress, Space, Tag, TimePicker, Tooltip } from 'antd';
import React, { useState } from 'react';
import { FormattedMessage, Link, useIntl, useModel } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import moment from 'moment';
import ProForm, {
  ModalForm,
  ProFormDatePicker,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { allTimeoffs } from '@/services/timeOff';

type RecordType = API.TimeoffRequest;

const EmployeeAttendance: React.FC = () => {
  const intl = useIntl();
  const { actionRef } = useModel('employee');
  const [clockModalVisible, setClockModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [seletectedRecord, setSelectedRecord] = useState<RecordType | undefined>();
  const [editedTime, setEditedTime] = useState();
  const [selectedRowsState, setSelectedRows] = useState<RecordType[]>([]);

  const formatDuration = (seconds: number) => {
    const duration = moment.duration(seconds, 'seconds');
    return `${Math.floor(duration.asHours())}h${
      duration.minutes() ? `${duration.minutes()}m` : ''
    }`;
  };

  const columns: ProColumns<RecordType>[] = [
    {
      title: 'Employee',
      fixed: 'left',
      key: 'employee',
      dataIndex: ['owner', 'avatar'],
      valueType: 'avatar',
      render: (avatar, record) => (
        <Space>
          <span>{avatar}</span>
          <span>
            {record.owner.first_name} {record.owner.last_name}
          </span>
        </Space>
      ),
    },
    {
      title: 'From',
      key: 'start_date',
      dataIndex: 'start_date',
      valueType: 'date',
    },
    {
      title: 'To',
      key: 'end_date',
      dataIndex: 'end_date',
      valueType: 'date',
    },
    {
      title: 'Number of days',
      key: 'start_date',
      dataIndex: 'start_date',
    },
    {
      title: 'Type',
      key: 'time_off_type',
      dataIndex: 'time_off_type',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      hideInForm: true,
      valueEnum: {
        Approved: {
          text: 'Approved',
          status: 'Success',
        },
        Pending: {
          text: 'Pending',
          status: 'Warning',
        },
      },
    },
    {
      title: 'Actions',
      key: 'action',
      fixed: 'right',
      align: 'center',
      search: false,
      render: (dom, record) => (
        <Space size="small">
          <Button
            title="Edit actual"
            size="small"
            onClick={() => {
              setEditModalVisible(true);
              setSelectedRecord(record);
            }}
          >
            <EditOutlined />
          </Button>
          {/* Delete button: might need in the future */}
          {/* <Popconfirm
            placement="right"
            title={'Delete this employee?'}
            onConfirm={async () => {
              await onCrudOperation(() => deleteEmployee(record.id), 'Cannot delete employee!');
            }}
          >
            <Button title="Delete this employee" size="small" danger>
              <DeleteOutlined />
            </Button>
          </Popconfirm> */}
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title={false}>
      <ProTable<RecordType, API.PageParams>
        headerTitle="My attendance"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        scroll={{ x: 'max-content' }}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            onClick={() => {
              setClockModalVisible(true);
            }}
          >
            <Space>
              <HistoryOutlined />
              <FormattedMessage
                id="pages.attendance.myAttendance.list.table.clockIn"
                defaultMessage="Confirm"
              />
            </Space>
          </Button>,
          <Button
            type="primary"
            onClick={() => {
              setClockModalVisible(true);
            }}
          >
            <Space>
              <CheckOutlined />
              <FormattedMessage
                id="pages.attendance.myAttendance.list.table.clockIn"
                defaultMessage="Approve"
              />
            </Space>
          </Button>,
          <Button
            onClick={() => {
              setClockModalVisible(true);
            }}
          >
            <Space>
              <RollbackOutlined />
              <FormattedMessage
                id="pages.attendance.myAttendance.list.table.clockIn"
                defaultMessage="Revert"
              />
            </Space>
          </Button>,
        ]}
        request={async () => {
          const fetchData = await allTimeoffs();

          return {
            success: true,
            data: fetchData,
            total: fetchData.length,
          };
        }}
        columns={columns}
      />
      <ModalForm
        visible={clockModalVisible}
        title={`Clock in at ${moment().format('HH:mm:ss')}`}
        width="400px"
        onFinish={() => setClockModalVisible(false)}
        onVisibleChange={(visible) => setClockModalVisible(visible)}
      >
        <Space style={{ marginBottom: 20 }}>
          <EnvironmentOutlined />
          Outside the designated area
        </Space>
        <ProFormTextArea width="md" rules={[{ required: true }]} name="note" label="Note" />
      </ModalForm>
    </PageContainer>
  );
};

export default EmployeeAttendance;
