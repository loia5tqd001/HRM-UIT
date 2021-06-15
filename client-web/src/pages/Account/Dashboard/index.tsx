import { allAttendances, allPeriods, attendanceHelper } from '@/services/attendance';
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
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Avatar, Badge, Button, Card, Progress, Space, Tooltip } from 'antd';
import { countBy, groupBy, mapValues, sumBy } from 'lodash';
import moment from 'moment';
import React from 'react';
import { Access, FormattedMessage, history, Link, useAccess, useIntl } from 'umi';

const CustomButton = ({ icon: Icon, text, ...props }) => {
  return (
    <Button
      {...props}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '200%',
        fontSize: '1.35em',
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

const attendanceColumns: ProColumns<any>[] = [
  {
    title: <FormattedMessage id="property.employee" defaultMessage="Employee" />,
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
    title: (
      <FormattedMessage id="property.actualWorkSchedule" defaultMessage="Actual/work schedule" />
    ),
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
    title: <FormattedMessage id="property.status" defaultMessage="Status" />,
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

const empColumns: ProColumns<any>[] = [
  {
    title: <FormattedMessage id="property.full_name" defaultMessage="Full name" />,
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
    title: <FormattedMessage id="property.role" defaultMessage="Role" />,

    key: 'role',
    dataIndex: 'role',
  },
  {
    title: <FormattedMessage id="property.gender" defaultMessage="Gender" />,
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
        text: <FormattedMessage id="property.gender.other" defaultMessage="Other" />,
      },
    },
  },
  {
    title: <FormattedMessage id="property.email" defaultMessage="Email address" />,

    key: 'email',
    dataIndex: 'email',
  },
  {
    title: <FormattedMessage id="property.marital_status" defaultMessage="Marital status" />,
    key: 'marital_status',
    dataIndex: 'marital_status',
    valueEnum: {
      Single: {
        text: <FormattedMessage id="property.marital_status.single" defaultMessage="Single" />,
      },
      Married: {
        text: <FormattedMessage id="property.marital_status.married" defaultMessage="Married" />,
      },
      Divorced: {
        text: <FormattedMessage id="property.marital_status.divorced" defaultMessage="Divorced" />,
      },
      Seperated: {
        text: (
          <FormattedMessage id="property.marital_status.seperated" defaultMessage="Seperated" />
        ),
      },
      Widowed: {
        text: <FormattedMessage id="property.marital_status.widowed" defaultMessage="Widowed" />,
      },
      Other: {
        text: <FormattedMessage id="property.marital_status.other" defaultMessage="Other" />,
      },
    },
  },
  {
    title: <FormattedMessage id="property.date_of_birth" defaultMessage="DoB (YYYY-MM-DD)" />,
    key: 'date_of_birth',
    dataIndex: 'date_of_birth',
    valueType: 'date',
  },
  {
    title: <FormattedMessage id="property.personal_tax_id" defaultMessage="Personal tax id" />,
    key: 'personal_tax_id',
    dataIndex: 'personal_tax_id',
  },
  {
    title: <FormattedMessage id="property.nationality" defaultMessage="Nationality" />,
    key: 'nationality',
    dataIndex: 'nationality',
  },
  {
    title: <FormattedMessage id="property.phone" defaultMessage="Phone" />,
    key: 'phone',
    dataIndex: 'phone',
  },
  {
    title: <FormattedMessage id="property.social_insurance" defaultMessage="Social insurance" />,
    key: 'social_insurance',
    dataIndex: 'social_insurance',
  },
  {
    title: <FormattedMessage id="property.health_insurance" defaultMessage="Health insurance" />,
    key: 'health_insurance',
    dataIndex: 'health_insurance',
  },
  {
    title: <FormattedMessage id="property.actions" defaultMessage="Actions" />,
    width: 'min-width',
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
  const intl = useIntl();

  return (
    <PageContainer title={false}>
      <div style={{ display: 'grid', gap: 24 }}>
        <Card
          title={intl.formatMessage({
            id: 'pages.dashboard.quickActions',
            defaultMessage: 'Quick Actions',
          })}
          className="card-shadow header-capitalize"
          loading={attendanceInfo.isLoading}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
            <CustomButton
              icon={HistoryOutlined}
              type="primary"
              text={intl.formatMessage({
                id: 'menu.attendance.clockInOut',
                defaultMessage: 'Clock In/ Out',
              })}
              onClick={() => history.push('/attendance/me?action=nextStep')}
            />
            <CustomButton
              icon={MehOutlined}
              text={intl.formatMessage({
                id: 'menu.timeOff.new',
                defaultMessage: 'Request Time Off',
              })}
              onClick={() => history.push('/timeOff/me?action=new')}
            />
            <CustomButton
              icon={ScheduleOutlined}
              text={intl.formatMessage({
                id: 'menu.attendance.me',
                defaultMessage: 'My Attendance',
              })}
              onClick={() => history.push('/attendance/me')}
            />
            <CustomButton
              icon={TableOutlined}
              text={intl.formatMessage({
                id: 'menu.timeOff.me',
                defaultMessage: 'My Time Off Requests',
              })}
              onClick={() => history.push('/timeOff/me')}
            />
            <CustomButton
              icon={CommentOutlined}
              text={intl.formatMessage({
                id: 'menu.message',
                defaultMessage: 'Messages',
              })}
              onClick={() => history.push('/message')}
            />
          </div>
        </Card>
        <div style={{ display: 'flex', gap: 24 }}>
          <Access accessible={access['view_timeoff']}>
            <div style={{ flex: 1 }}>
              <ProTable<any>
                className="card-shadow header-capitalize"
                headerTitle={intl.formatMessage({
                  id: 'pages.dashboard.pendingTimeOffRequest',
                  defaultMessage: 'Pending Timeoff Requests',
                })}
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
                  <Button
                    className="primary-outlined-button primary-hover-button"
                    onClick={() => history.push('/timeOff/list')}
                  >
                    <FormattedMessage id="component.button.viewAll" defaultMessage="View all" />
                  </Button>,
                ]}
                columns={[
                  {
                    title: <FormattedMessage id="property.employee" defaultMessage="Employee" />,
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
                    title: (
                      <FormattedMessage
                        id="property.time_off_type"
                        defaultMessage="Time Off Type"
                      />
                    ),
                    dataIndex: 'time_off_type',
                  },
                  {
                    title: (
                      <FormattedMessage id="property.start_date" defaultMessage="Start date" />
                    ),
                    dataIndex: 'start_date',
                    valueType: 'date',
                  },
                  {
                    title: <FormattedMessage id="property.end_date" defaultMessage="End date" />,
                    dataIndex: 'end_date',
                    valueType: 'date',
                  },
                ]}
                pagination={{ pageSize: 5, simple: true }}
              />
            </div>
          </Access>
          <Access accessible={access['view_employeeschedule']}>
            <div style={{ flex: 1 }}>
              <ProTable<any>
                className="card-shadow header-capitalize"
                headerTitle={intl.formatMessage({
                  id: 'pages.dashboard.pendingAttendanceRequest',
                  defaultMessage: 'Pending Attendance Requests',
                })}
                rowKey="id"
                search={false}
                request={async () => {
                  const selectedPeriod = await allPeriods()
                    .then((fetchData) => fetchData.reverse())
                    .then((fetchData) => fetchData[0]?.id);
                  let data = await allAttendances({
                    params: { period_id: selectedPeriod },
                  });

                  data = data.map((it) => {
                    return {
                      ...it,
                      status: {
                        Pending: countBy(it.attendance, (x) => x.status === 'Pending').true,
                        Approved: countBy(it.attendance, (x) => x.status === 'Approved').true,
                        Rejected: countBy(it.attendance, (x) => x.status === 'Rejected').true,
                        Confirmed: countBy(it.attendance, (x) => x.status === 'Confirmed').true,
                      },
                      actual: sumBy(it.attendance, (x) => x.actual_work_hours) * 3600,
                      work_schedule: it.schedule_hours * 3600,
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
                  <Button
                    className="primary-outlined-button primary-hover-button"
                    onClick={() => history.push('/attendance/list')}
                  >
                    <FormattedMessage id="component.button.viewAll" defaultMessage="View all" />
                  </Button>,
                ]}
                columns={attendanceColumns}
                pagination={{ pageSize: 5, simple: true }}
              />
            </div>
          </Access>
        </div>
        <Access accessible={access['view_employee']}>
          <ProTable<any, API.PageParams>
            headerTitle={intl.formatMessage({
              id: 'pages.dashboard.newHires',
              defaultMessage: 'New Hires',
            })}
            className="card-shadow header-capitalize"
            rowKey="id"
            scroll={{ x: 'max-content' }}
            toolBarRender={() => [
              <Button
                className="primary-outlined-button primary-hover-button"
                onClick={() => history.push('/employee/list')}
              >
                <FormattedMessage id="component.button.viewAll" defaultMessage="View all" />
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
