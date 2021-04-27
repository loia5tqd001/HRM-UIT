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

type RecordType = API.AttendanceEmployee;

const EmployeeAttendance: React.FC = () => {
  const intl = useIntl();
  const { actionRef } = useModel('employee');
  const [clockModalVisible, setClockModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [seletectedRecord, setSelectedRecord] = useState<RecordType | undefined>();
  const [editedTime, setEditedTime] = useState();
  const [selectedRowsState, setSelectedRows] = useState<RecordType[]>([]);

  const attendanceKeys = [
    'Mar 31',
    'Apr 1',
    'Apr 2',
    'Apr 3',
    'Apr 4',
    'Apr 5',
    'Apr 6',
    'Apr 7',
    'Apr 8',
    'Apr 9',
    'Apr 10',
    'Apr 11',
    'Apr 12',
    'Apr 13',
    'Apr 14',
    'Apr 15',
    'Apr 16',
    'Apr 17',
    'Apr 18',
    'Apr 19',
  ];

  const formatDuration = (seconds: number) => {
    const duration = moment.duration(seconds, 'seconds');
    return `${Math.floor(duration.asHours())}h${
      duration.minutes() ? `${duration.minutes()}m` : ''
    }`;
  };

  const columns: ProColumns<RecordType>[] = [
    {
      title: 'Name',
      key: 'employee',
      dataIndex: ['employee', 'avatar'],
      valueType: 'avatar',
      render: (avatar, record) => (
        <Space>
          <span>{avatar}</span>
          <Link to={`/employee/edit/${record.employee.id}`}>
            {record.employee.first_name} {record.employee.last_name}
          </Link>
        </Space>
      ),
    },
    {
      title: 'Creator',
      key: 'employee',
      dataIndex: ['employee', 'avatar'],
      valueType: 'avatar',
      render: (avatar, record) => (
        <Space>
          <span>{avatar}</span>
          <Link to={`/employee/edit/${record.employee.id}`}>
            {record.employee.first_name} {record.employee.last_name}
          </Link>
        </Space>
      ),
    },
    {
      title: 'Workflow',
      key: 'employee',
      dataIndex: ['employee', 'avatar'],
      valueType: 'avatar',
      render: (avatar, record) => (
        <Space>
          <span>{avatar}</span>
          <Link to={`/employee/edit/${record.employee.id}`}>
            {record.employee.first_name} {record.employee.last_name}
          </Link>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 100,
      renderText: (status) => {
        const title = Object.entries(status)
          .map((it) => (it[1] ? `${it[1]} ${it[0]}` : ''))
          .filter((it) => it !== '')
          .join(', ');

        const commonDotStyle = {
          width: 10,
          height: 10,
          display: 'inline-block',
          borderRadius: '50%',
          marginRight: 5,
        };

        return (
          <Tooltip title={title}>
            {status.pending ? (
              <>
                {status.pending}{' '}
                <span
                  style={{
                    ...commonDotStyle,
                    background: 'rgb(242, 145, 50)',
                  }}
                />
              </>
            ) : null}
            {status.approved ? (
              <>
                {status.approved}{' '}
                <span
                  style={{
                    ...commonDotStyle,
                    background: '#2ad25f',
                  }}
                />
              </>
            ) : null}
            {status.confirmed ? (
              <>
                {status.confirmed}{' '}
                <span
                  style={{
                    ...commonDotStyle,
                    background: '#2ad25f',
                    border: '1px solid white',
                    boxShadow: '0 0 0 1px #2ad25f',
                  }}
                />
              </>
            ) : null}
          </Tooltip>
        );
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
        toolBarRender={() => [
          <Button
            type="primary"
            onClick={() => {
              setClockModalVisible(true);
            }}
          >
            <Space>
              <PlusOutlined />
              <FormattedMessage
                id="pages.attendance.myAttendance.list.table.clockIn"
                defaultMessage="New"
              />
            </Space>
          </Button>,
        ]}
        request={async () => {
          const fetchData: any[] = [

          ];

          return {
            success: true,
            data: fetchData,
            total: fetchData.length,
          };
        }}
        columns={columns}
      />
    </PageContainer>
  );
};

export default EmployeeAttendance;
