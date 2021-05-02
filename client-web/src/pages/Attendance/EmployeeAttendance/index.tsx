import {
  allEmployees,
  approveEmployeeAttendance,
  cancelEmployeeAttendance,
  rejectEmployeeAttendance,
} from '@/services/employee';
import {
  CheckCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  EnterOutlined,
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
import {
  Button,
  DatePicker,
  Form,
  message,
  Popconfirm,
  Progress,
  Space,
  Tag,
  TimePicker,
  Tooltip,
} from 'antd';
import React, { useCallback, useState } from 'react';
import { FormattedMessage, Link, useIntl, useModel } from 'umi';
import { CrudModal } from './components/CrudModal';
import { PageContainer } from '@ant-design/pro-layout';
import moment from 'moment';
import { ClockInOutModal } from './components/ClockInOutModal';
import ProForm, {
  ModalForm,
  ProFormDatePicker,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import styles from './index.less';
import { allAttendances } from '@/services/attendance';
import { uniq, groupBy, countBy, sumBy, mapValues } from 'lodash';

type RecordType = API.AttendanceEmployee & {
  status?: {
    Pending: number;
    Approved: number;
    Confirmed: number;
  };
  actual?: number;
  work_schedule?: number;
  attendances?: Record<string, number>;
};

const EmployeeAttendance: React.FC = () => {
  const intl = useIntl();
  const { actionRef } = useModel('employee');
  const [clockModalVisible, setClockModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [seletectedRecord, setSelectedRecord] = useState<RecordType | undefined>();
  const [editedTime, setEditedTime] = useState();
  const [selectedRowsState, setSelectedRows] = useState<RecordType[]>([]);
  const [attendanceKeys, setAttendanceKeys] = useState<string[]>([]);

  const onCrudOperation = useCallback(
    async (cb: () => Promise<any>, successMessage: string, errorMessage: string) => {
      try {
        await cb();
        actionRef.current?.reload();
        message.success(successMessage);
      } catch (err) {
        message.error(errorMessage);
        throw err;
      }
    },
    [actionRef],
  );

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
      dataIndex: 'avatar',
      valueType: 'avatar',
      render: (avatar, record) => (
        <Space>
          <span>{avatar}</span>
          <Link to={`/attendance/detail/${record.id}`}>
            {record.first_name} {record.last_name}
          </Link>
        </Space>
      ),
    },
    {
      title: 'Actual/work schedule',
      fixed: 'left',
      key: 'actual',
      dataIndex: 'actual',
      renderText: (_, record) => {
        if (!record.actual || !record.work_schedule) return null;
        return (
          <div style={{ position: 'relative' }}>
            <Progress
              percent={(record.actual / record.work_schedule) * 100}
              showInfo={false}
              strokeWidth={20}
            />
            <div
              style={{
                position: 'absolute',
                left: 10,
                top: 2,
                color: '#151515',
                fontWeight: 600,
              }}
            >
              {formatDuration(record.actual)} / {formatDuration(record.work_schedule)}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Status',
      fixed: 'left',
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
            {status.Pending ? (
              <>
                {status.Pending}{' '}
                <span
                  style={{
                    ...commonDotStyle,
                    background: 'rgb(242, 145, 50)',
                  }}
                />
              </>
            ) : null}
            {status.Approved ? (
              <>
                {status.Approved}{' '}
                <span
                  style={{
                    ...commonDotStyle,
                    background: '#2ad25f',
                  }}
                />
              </>
            ) : null}
            {status.Confirmed ? (
              <>
                {status.Confirmed}{' '}
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
    ...attendanceKeys.map((it) => ({
      title: it,
      key: it,
      dataIndex: ['attendances', it],
      renderText: (seconds: number) => formatDuration(seconds),
    })),
    // {
    //   title: 'Actions',
    //   key: 'action',
    //   fixed: 'right',
    //   align: 'center',
    //   search: false,
    //   render: (dom, record) => (
    //     <Space size="small">
    //       <Popconfirm
    //         placement="right"
    //         title={'Approve this request?'}
    //         onConfirm={async () => {
    //           // await onCrudOperation(
    //           //   () => approveEmployeeAttendance(record.owner.id, record.id),
    //           //   'Approved successfully!',
    //           //   'Cannot approve this request!',
    //           // );
    //         }}
    //         // disabled={record.status !== 'Pending'}
    //       >
    //         <Button
    //           title="Approve this request"
    //           size="small"
    //           type="default"
    //           // disabled={record.status !== 'Pending'}
    //         >
    //           <CheckOutlined />
    //         </Button>
    //       </Popconfirm>
    //       <Popconfirm
    //         placement="right"
    //         title={'Reject this request?'}
    //         onConfirm={async () => {
    //           // await onCrudOperation(
    //           //   () => rejectEmployeeAttendance(record.owner.id, record.id),
    //           //   'Rejected successfully!',
    //           //   'Cannot reject this request!',
    //           // );
    //         }}
    //         // disabled={record.status !== 'Pending'}
    //       >
    //         <Button
    //           title="Reject this request"
    //           size="small"
    //           danger
    //           // disabled={record.status !== 'Pending'}
    //         >
    //           <CloseOutlined />
    //         </Button>
    //       </Popconfirm>
    //       <Popconfirm
    //         placement="right"
    //         title={'Cancel this request?'}
    //         onConfirm={async () => {
    //           // await onCrudOperation(
    //           //   () => cancelEmployeeAttendance(record.owner.id, record.id),
    //           //   'Canceled successfully!',
    //           //   'Cannot cancel this request!',
    //           // );
    //         }}
    //         // disabled={record.status !== 'Approved'}
    //       >
    //         <Button
    //           title="Cancel this request"
    //           size="small"
    //           danger
    //           // disabled={record.status !== 'Approved'}
    //         >
    //           <EnterOutlined />
    //         </Button>
    //       </Popconfirm>
    //     </Space>
    //   ),
    // },
  ];

  return (
    <PageContainer title={false}>
      <ProTable<RecordType, API.PageParams>
        headerTitle="Employee attendance"
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
            danger
          >
            <Space>
              <RollbackOutlined />
              <FormattedMessage
                id="pages.attendance.myAttendance.list.table.clockIn"
                defaultMessage="Revert"
              />
            </Space>
          </Button>,
          <Button
            onClick={() => {
              setClockModalVisible(true);
            }}
          >
            <Space>
              <CheckCircleOutlined />
              <FormattedMessage
                id="pages.attendance.myAttendance.list.table.clockIn"
                defaultMessage="Confirm"
              />
            </Space>
          </Button>,
        ]}
        request={async () => {
          let data: RecordType[] = await allAttendances();
          setAttendanceKeys(
            uniq(
              data.flatMap((it) => it.attendance.flatMap((x) => moment(x.date).format('DD MMM'))),
            ),
          );
          data = data.map((it) => {
            return {
              ...it,
              status: {
                Pending: countBy(it.attendance, (x) => x.status === 'Pending').true,
                Approved: countBy(it.attendance, (x) => x.status === 'Approved').true,
                Confirmed: countBy(it.attendance, (x) => x.status === 'Confirmed').true,
              },
              actual: sumBy(it.attendance, (x) => x.actual_work_hours) * 3600,
              work_schedule: 288000,
              attendances: mapValues(
                groupBy(
                  it.attendance.map((x) => ({
                    ...x,
                    date: moment(x.date).format('DD MMM'),
                    work_load: x.actual_work_hours * 3600,
                  })),
                  'date',
                ),
                (x) => x.reduce((acc, cur) => acc + cur.actual_work_hours * 3600, 0),
              ),
            };
          });

          // const fetchData = [
          //   {
          //     id: 1,
          //     employee: {
          //       id: 1,
          //       first_name: 'Nguyen',
          //       last_name: 'Huynh Loi',
          //       avatar: 'https://gw.alipayobjects.com/zos/rmsportal/ThXAXghbEsBCCSDihZxY.png',
          //     },
          //     actual: 250000,
          //     work_schedule: 288000,
          //     status: {
          //       pending: 5,
          //       approved: 6,
          //       confirmed: 0,
          //     },
          //     attendances: {
          //       'Apr 5': 28800,
          //       'Apr 6': 28800,
          //       'Apr 7': 28800,
          //       'Apr 8': 28800,
          //       'Apr 9': 28800,
          //       'Apr 10': 28800,
          //       'Apr 11': 28800,
          //       'Apr 12': 28800,
          //       'Apr 13': 28800,
          //       'Apr 14': 28800,
          //       'Apr 15': 28800,
          //       'Apr 16': 28800,
          //       'Apr 17': 28800,
          //       'Apr 18': 28800,
          //       'Apr 19': 28800,
          //     },
          //   },
          //   {
          //     id: 2,
          //     employee: {
          //       id: 2,
          //       first_name: 'Dao',
          //       last_name: 'Manh Dung',
          //       avatar: 'https://gw.alipayobjects.com/zos/rmsportal/ThXAXghbEsBCCSDihZxY.png',
          //     },
          //     actual: 280000,
          //     work_schedule: 288000,
          //     status: {
          //       pending: 1,
          //       approved: 6,
          //       confirmed: 2,
          //     },
          //     attendances: {
          //       'Apr 10': 28800,
          //       'Apr 11': 28800,
          //       'Apr 12': 28800,
          //       'Apr 13': 28800,
          //       'Apr 14': 25000,
          //       'Apr 15': 28800,
          //       'Apr 16': 28800,
          //       'Apr 17': 28800,
          //       'Apr 18': 28800,
          //       'Apr 19': 28800,
          //     },
          //   },
          // ];

          return {
            success: true,
            data,
            total: data.length,
          };
        }}
        columns={columns}
      />
      {/* <CrudModal />
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
      <ModalForm
        visible={editModalVisible}
        title={`Edit actual attendance`}
        width="400px"
        onFinish={() => setEditModalVisible(false)}
        onVisibleChange={(visible) => setEditModalVisible(visible)}
      >
        <ProForm.Group>
          <Form.Item>
            <DatePicker value={seletectedRecord?.date} disabled />
          </Form.Item>
          <Form.Item>
            <TimePicker format="HH:mm" minuteStep={5} />
          </Form.Item>
        </ProForm.Group>
        <ProFormTextArea width="md" rules={[{ required: true }]} name="note" label="Note" />
      </ModalForm> */}
    </PageContainer>
  );
};

export default EmployeeAttendance;
