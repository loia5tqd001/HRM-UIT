import { allAttendances, attendanceHelper } from '@/services/attendance';
import { allEmployees, getSchedule } from '@/services/employee';
import { allTimeoffs } from '@/services/timeOff';
import { useAsyncData } from '@/utils/hooks/useAsyncData';
import {
  CommentOutlined,
  EyeOutlined,
  HistoryOutlined,
  LockOutlined,
  ManOutlined,
  MehOutlined,
  ScheduleOutlined,
  TableOutlined,
  WomanOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import { Avatar, Badge, Button, Card, Progress, Space, Tooltip } from 'antd';
import { countBy, groupBy, mapValues, sumBy } from 'lodash';
import moment from 'moment';
import React from 'react';
import { Access, FormattedMessage, history, Link, useAccess } from 'umi';

const CustomButton = ({ icon: Icon, text, ...props }) => {
  return (
    <Button
      {...props}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '200%',
        fontSize: '1.5em',
        marginRight: 24,
        marginBottom: 24,
        ...props.style,
      }}
    >
      <Icon style={{ fontSize: '1.5em', marginTop: '0.3em' }} />
      <span style={{ marginRight: '0.3em', fontWeight: 100, marginBottom: '0.2em' }}>{text}</span>
    </Button>
  );
};

const formatDuration = (seconds: number) => {
  const duration = moment.duration(seconds, 'seconds');
  return `${Math.floor(duration.asHours())}h${duration.minutes() ? `${duration.minutes()}m` : ''}`;
};

const columns: ProColumns<any>[] = [
  {
    title: 'Employee',
    fixed: 'left',
    key: 'employee',
    dataIndex: 'avatar',
    valueType: 'avatar',
    render: (avatar, record) => (
      <Space>
        <span>{avatar}</span>
        <Link to={`/attendance/list/${record.id}`}>
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
    key: 'status',
    width: 'max-content',
    renderText: (status) => {
      const symbols = {
        Pending: <Badge status="warning" />,
        Approved: <Badge status="success" />,
        Rejected: <Badge status="error" />,
        Confirmed: <LockOutlined style={{ color: '#52c41a' }} />,
      };
      return (
        <Space size="small">
          {Object.entries(status)
            .filter((it) => it[1])
            .map(([key, val]) => (
              <Tooltip title={`${val} ${key}`}>
                <span style={{ display: 'inline-flex' }}>
                  {val}
                  <span style={{ marginLeft: 2 }}>{symbols[key]}</span>
                </span>
              </Tooltip>
            ))}
        </Space>
      );
    },
  },
];

const calcHours = ({
  morning_from,
  morning_to,
  afternoon_from,
  afternoon_to,
}: API.Schedule['workdays'][0]) => {
  let hours = 0;
  if (morning_from && morning_to)
    hours += moment.duration(moment(morning_to).diff(moment(morning_from))).asHours() % 24;
  if (afternoon_from && afternoon_to)
    hours += moment.duration(moment(afternoon_to).diff(moment(afternoon_from))).asHours() % 24;
  return Number(hours.toFixed(1));
};

const empColumns: ProColumns<any>[] = [
  {
    title: (
      <FormattedMessage id="pages.employee.list.column.full_name" defaultMessage="Full name" />
    ),
    key: 'full_name',
    dataIndex: 'avatar',
    valueType: 'avatar',
    render: (avatar, record) => (
      <Space>
        <span>{avatar}</span>
        <Link to={`/employee/list/${record.id}`}>
          {record.first_name} {record.last_name}
        </Link>
      </Space>
    ),
    fixed: 'left',
  },
  {
    title: <FormattedMessage id="pages.employee.list.column.role" defaultMessage="Role" />,

    key: 'role',
    dataIndex: 'role',
  },
  {
    title: <FormattedMessage id="pages.employee.list.column.gender" defaultMessage="Gender" />,
    key: 'gender',
    dataIndex: 'gender',
    valueEnum: {
      Male: {
        text: <ManOutlined style={{ color: '#3C79CF' }} />,
      },
      Female: {
        text: <WomanOutlined style={{ color: '#F23A87' }} />,
      },
      Other: {
        text: 'Other',
      },
    },
  },
  {
    title: (
      <FormattedMessage id="pages.employee.list.column.email" defaultMessage="Email address" />
    ),

    key: 'email',
    dataIndex: 'email',
  },
  {
    title: (
      <FormattedMessage
        id="pages.employee.list.column.marital_status"
        defaultMessage="Marital status"
      />
    ),
    key: 'marital_status',
    dataIndex: 'marital_status',
  },
  {
    title: (
      <FormattedMessage
        id="pages.employee.list.column.date_of_birth"
        defaultMessage="DoB (YYYY-MM-DD)"
      />
    ),
    key: 'date_of_birth',
    dataIndex: 'date_of_birth',
    valueType: 'date',
  },
  {
    title: (
      <FormattedMessage
        id="pages.employee.list.column.personal_tax_id"
        defaultMessage="Personal tax id"
      />
    ),
    key: 'personal_tax_id',
    dataIndex: 'personal_tax_id',
  },
  {
    title: (
      <FormattedMessage id="pages.employee.list.column.nationality" defaultMessage="Nationality" />
    ),
    key: 'nationality',
    dataIndex: 'nationality',
  },
  {
    title: <FormattedMessage id="pages.employee.list.column.phone" defaultMessage="Phone" />,
    key: 'phone',
    dataIndex: 'phone',
  },
  {
    title: (
      <FormattedMessage
        id="pages.employee.list.column.social_insurance"
        defaultMessage="Social insurance"
      />
    ),
    key: 'social_insurance',
    dataIndex: 'social_insurance',
  },
  {
    title: (
      <FormattedMessage
        id="pages.employee.list.column.health_insurance"
        defaultMessage="Health insurance"
      />
    ),
    key: 'health_insurance',
    dataIndex: 'health_insurance',
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
          title="Follow up"
          size="small"
          className="primary-outlined-button"
          onClick={() => {
            history.push(`/employee/list/${record.id}`);
          }}
        >
          <EyeOutlined />
        </Button>
      </Space>
    ),
  },
];

export const Edit: React.FC = () => {
  const attendanceInfo = useAsyncData<API.AttendanceHelper>(attendanceHelper);
  const access = useAccess();

  return (
    <PageContainer title={false}>
      <div style={{ display: 'grid', gap: 24 }}>
        <Card
          title="Quick Actions"
          className="card-shadow header-capitalize"
          loading={attendanceInfo.isLoading}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: -24 }}>
            <CustomButton
              icon={HistoryOutlined}
              type="primary"
              text="Clock In / Out"
              onClick={() => history.push('/attendance/me?action=nextStep')}
            />
            <CustomButton
              icon={MehOutlined}
              text="Request Time Off"
              onClick={() => history.push('/timeOff/me?action=new')}
            />
            <CustomButton
              icon={ScheduleOutlined}
              text="My Attendance"
              onClick={() => history.push('/attendance/me')}
            />
            <CustomButton
              icon={TableOutlined}
              text="My Time Off Requests"
              onClick={() => history.push('/timeOff/me')}
            />
            <CustomButton
              icon={CommentOutlined}
              text="Messages"
              onClick={() => history.push('/message/conversation')}
            />
          </div>
        </Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <Access accessible={access?.['timeoff.view_timeoff']}>
            <ProTable<any>
              className="card-shadow header-capitalize"
              headerTitle="Pending Timeoff Requests"
              rowKey="id"
              search={false}
              request={async () => {
                const data = await allTimeoffs();
                return {
                  data: data.filter((it) => it.status === 'Pending'),
                  success: true,
                };
              }}
              toolBarRender={() => [
                <Button type="primary" onClick={() => history.push('/timeOff/list')}>
                  View all
                </Button>,
              ]}
              columns={[
                {
                  title: 'Employee',
                  dataIndex: ['owner', 'id'],
                  render: (avatar, record) => (
                    <Space>
                      <span>
                        <Avatar src={record.owner.avatar} />
                      </span>
                      <span>
                        {record.owner.first_name} {record.owner.last_name}
                      </span>
                    </Space>
                  ),
                },
                {
                  title: 'Timeoff type',
                  dataIndex: 'time_off_type',
                },
                {
                  title: 'Start date',
                  dataIndex: 'start_date',
                  valueType: 'date',
                },
                {
                  title: 'End date',
                  dataIndex: 'end_date',
                  valueType: 'date',
                },
              ]}
              pagination={{ pageSize: 5, simple: true }}
            />
          </Access>
          <Access accessible={access?.['attendance.view_employeeschedule']}>
            <ProTable<any>
              className="card-shadow header-capitalize"
              headerTitle="Pending Attendance Requests"
              rowKey="id"
              search={false}
              request={async () => {
                let data = await allAttendances();
                const schedules = await Promise.all(
                  data
                    .filter((it) => it.attendance[0])
                    .map(async (it) => {
                      const employeeId = it.attendance[0].owner;
                      return getSchedule(employeeId);
                    }),
                );
                data = data
                  // .filter((it) => it.attendance.length)
                  .map((it) => {
                    let work_schedule = 0;
                    if (it.attendance[0]?.owner) {
                      work_schedule =
                        (schedules.find((x) => x.owner === it.attendance[0].owner)
                          ?.schedule as API.Schedule).workdays.reduce(
                          (acc, cur) => acc + calcHours(cur),
                          0,
                        ) * 3600;
                    }
                    return {
                      ...it,
                      status: {
                        Pending: countBy(it.attendance, (x) => x.status === 'Pending').true,
                        Approved: countBy(it.attendance, (x) => x.status === 'Approved').true,
                        Rejected: countBy(it.attendance, (x) => x.status === 'Rejected').true,
                        Confirmed: countBy(it.attendance, (x) => x.status === 'Confirmed').true,
                      },
                      actual: sumBy(it.attendance, (x) => x.actual_work_hours) * 3600,
                      work_schedule,
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
                return {
                  success: true,
                  data: data?.filter((it) => it.status.Pending),
                };
              }}
              toolBarRender={() => [
                <Button type="primary" onClick={() => history.push('/attendance/list')}>
                  View all
                </Button>,
              ]}
              columns={columns}
              pagination={{ pageSize: 5, simple: true }}
            />
          </Access>
        </div>
        <Access accessible={access?.['core.view_employee']}>
          <ProTable<any, API.PageParams>
            headerTitle="New Hires"
            className="card-shadow header-capitalize"
            rowKey="id"
            scroll={{ x: 'max-content' }}
            toolBarRender={() => [
              <Button type="primary" onClick={() => history.push('/employee/list')}>
                View All
              </Button>,
            ]}
            request={async (query) => {
              const fetchData = await allEmployees();
              return {
                success: true,
                data: fetchData.filter((it) => it.status === 'NewHired'),
              };
            }}
            search={false}
            columns={empColumns}
            pagination={{ pageSize: 5, simple: true }}
          />
        </Access>
      </div>
    </PageContainer>
  );
};

export default Edit;
