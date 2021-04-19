import { allEmployees } from '@/services/employee';
import {
  EditOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  HistoryOutlined,
  ManOutlined,
  MessageOutlined,
  PlusOutlined,
  WomanOutlined,
} from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Space, Tag, Tooltip } from 'antd';
import React from 'react';
import { FormattedMessage, Link, useIntl, useModel } from 'umi';
import { CrudModal } from './components/CrudModal';
import { PageContainer } from '@ant-design/pro-layout';
import moment from 'moment';

type RecordType = API.AttendanceRecord;

const MyAttendance: React.FC = () => {
  const intl = useIntl();
  const { actionRef, setCrudModalVisible, setSelectedRecord } = useModel('employee');

  const columns: ProColumns<RecordType>[] = [
    {
      title: 'Date',
      key: 'date',
      dataIndex: 'date',
      renderText: (date) => (date ? moment(date).format('ddd - DD MMM yyyy') : ' '),
    },
    {
      title: 'Clock in',
      key: 'clock_in',
      dataIndex: 'clock_in',
      renderText: (_, record) => {
        const renderLocation = (clock_in_location = record.clock_in_location) => {
          if (clock_in_location === 'Outside')
            return (
              <Tooltip title="Clock in outside of office">
                <Tag icon={<ExclamationCircleOutlined />} color="error">
                  {clock_in_location}
                </Tag>
              </Tooltip>
            );
          if (clock_in_location)
            return <Tag icon={<EnvironmentOutlined />}>{clock_in_location}</Tag>;
          return '-';
        };

        return (
          <>
            <Tooltip title={record.clock_in_note}>
              <Tag icon={record.clock_in_note ? <MessageOutlined /> : null}>
                {moment(record.clock_in, 'HH:mm').format('HH:mm')}
              </Tag>
            </Tooltip>
            {renderLocation(record.clock_in_location)}
          </>
        );
      },
    },
    {
      title: 'Clock out',
      key: 'clock_out',
      dataIndex: 'clock_out',
      renderText: (_, record) => {
        const renderLocation = (clock_out_location = record.clock_out_location) => {
          if (clock_out_location === 'Outside')
            return (
              <Tooltip title="Clock out outside of office">
                <Tag icon={<ExclamationCircleOutlined />} color="error">
                  {clock_out_location}
                </Tag>
              </Tooltip>
            );
          if (clock_out_location)
            return <Tag icon={<EnvironmentOutlined />}>{clock_out_location}</Tag>;
          return '-';
        };

        return (
          <>
            <Tooltip title={record.clock_out_note}>
              <Tag icon={record.clock_out_note ? <MessageOutlined /> : null}>
                {moment(record.clock_out, 'HH:mm').format('HH:mm')}
              </Tag>
            </Tooltip>
            {renderLocation(record.clock_out_location)}
          </>
        );
      },
    },
    {
      title: 'Overtime',
      key: 'overtime',
      dataIndex: 'overtime',
    },
    {
      title: 'Work schedule',
      key: 'hours_work_by_schedule',
      dataIndex: 'hours_work_by_schedule',
      renderText: (hours_work_by_schedule) => hours_work_by_schedule || ' ',
    },
    {
      title: 'Actual',
      key: 'actual',
      dataIndex: 'actual',
      renderText: (_, record) => {
        if (record.edited_to) {
          return (
            <Tooltip title={`Edited by ${record.edited_by} at ${record.edited_when}`}>
              <Tag icon={<EditOutlined />}>{record.edited_to}</Tag>
            </Tooltip>
          );
        }
        if (record.actual) {
          return record.actual;
        }
        return ' ';
      },
    },
    {
      title: 'Decifit',
      key: 'actual',
      dataIndex: 'decifit',
      renderText: (decifit) => decifit === undefined ? ' ' : decifit,
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
      title: 'Note',
      key: 'edited_by',
      dataIndex: 'edited_by',
      renderText: (_, record) => (record.edited_by ? 'hello' : null),
    },
    {
      title: 'Actions',
      key: 'action',
      fixed: 'right',
      align: 'center',
      search: false,
      render: (dom, record) =>
        record.type === 'AttendanceDay' ? (
          <Space size="small">
            <Button
              title="Edit actual"
              size="small"
              onClick={() => {
                setCrudModalVisible('update');
                // setSelectedRecord(record);
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
        ) : null,
    },
  ];

  return (
    <PageContainer title={false}>
      <ProTable<RecordType, API.PageParams>
        headerTitle="My attendance"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        scroll={{ x: 'max-content' }}
        toolBarRender={() => [
          <Tag>First clock in 15:01</Tag>,
          <Tag>Last clock out 15:01</Tag>,
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setCrudModalVisible('create');
              setSelectedRecord(undefined);
            }}
          >
            <Space>
              <HistoryOutlined />
              <FormattedMessage
                id="pages.attendance.myAttendance.list.table.clockIn"
                defaultMessage="Clock in"
              />
            </Space>
          </Button>,
        ]}
        // @ts-ignore
        request={async () => {
          const fetchData = [
            {
              id: 1,
              type: 'AttendanceDay',
              date: moment('08:00', 'hh:mm'),
              clock_in: moment('08:00', 'hh:mm'),
              clock_in_note: 'Em di som',
              clock_in_location: 'Hawaii',
              clock_out: moment('20:00', 'hh:mm'),
              clock_out_note: 'Em OT',
              clock_out_location: 'Outside',
              hours_work_by_schedule: '8h',
              actual: '8h',
              decifit: 0,
              overtime: '1h30m',
              status: 'Approved',
              edited_by: 1,
              edited_when: moment(),
              edited_to: '10h',
              children: [
                {
                  id: 2,
                  date: undefined,
                  clock_in: moment('08:00', 'hh:mm'),
                  clock_in_note: 'Em di som',
                  clock_in_location: 'Hawaii',
                  clock_out: moment('12:00', 'hh:mm'),
                  clock_out_note: undefined,
                  clock_out_location: 'Outside',
                  hours_work_by_schedule: undefined,
                  actual: undefined,
                  overtime: undefined,
                  status: undefined,
                  edited_by: undefined,
                  edited_when: undefined,
                  edited_to: undefined,
                },
                {
                  id: 2,
                  date: undefined,
                  clock_in: moment('13:00', 'hh:mm'),
                  clock_in_note: undefined,
                  clock_in_location: 'Outside',
                  clock_out: moment('17:00', 'hh:mm'),
                  clock_out_note: undefined,
                  clock_out_location: 'Outside',
                  hours_work_by_schedule: undefined,
                  actual: undefined,
                  overtime: undefined,
                  status: undefined,
                  edited_by: undefined,
                  edited_when: undefined,
                  edited_to: undefined,
                },
                {
                  id: 2,
                  date: undefined,
                  clock_in: moment('18:30', 'hh:mm'),
                  clock_in_note: undefined,
                  clock_in_location: 'Outside',
                  clock_out: moment('20:00', 'hh:mm'),
                  clock_out_note: undefined,
                  clock_out_location: 'Outside',
                  hours_work_by_schedule: undefined,
                  actual: undefined,
                  overtime: 'OT ngoài giờ',
                  status: undefined,
                  edited_by: undefined,
                  edited_when: undefined,
                  edited_to: undefined,
                },
              ],
            },
            {
              id: 3,
              type: 'AttendanceDay',
              date: moment('08:00', 'hh:mm'),
              clock_in: moment('08:00', 'hh:mm'),
              clock_in_note: 'Em di som',
              clock_in_location: 'Hawaii',
              clock_out: moment('20:00', 'hh:mm'),
              clock_out_note: 'Em OT',
              clock_out_location: 'Outside',
              hours_work_by_schedule: '8h',
              actual: '8h',
              decifit: 0,
              overtime: '1h30m',
              status: 'Pending',
              edited_by: 1,
              edited_when: moment(),
              edited_to: '10h',
              children: [
                {
                  id: 2,
                  date: undefined,
                  clock_in: moment('08:00', 'hh:mm'),
                  clock_in_note: 'Em di som',
                  clock_in_location: 'Hawaii',
                  clock_out: moment('12:00', 'hh:mm'),
                  clock_out_note: undefined,
                  clock_out_location: 'Outside',
                  hours_work_by_schedule: undefined,
                  actual: undefined,
                  overtime: undefined,
                  status: undefined,
                  edited_by: undefined,
                  edited_when: undefined,
                  edited_to: undefined,
                },
              ],
            },
          ];

          return {
            success: true,
            data: fetchData,
            total: fetchData.length,
          };
        }}
        columns={columns}
      />
      <CrudModal />
    </PageContainer>
  );
};

export default MyAttendance;
