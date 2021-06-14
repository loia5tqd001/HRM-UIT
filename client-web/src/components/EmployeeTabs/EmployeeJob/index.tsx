import { FormattedMessage, useIntl } from '@/.umi/plugin-locale/localeExports';
import { __DEV__ } from '@/global';
import { calcHours, convertFromBackend } from '@/pages/Admin/Job/WorkSchedule';
import { allEmploymentStatuses } from '@/services/admin.job.employmentStatus';
import { allJobTitles } from '@/services/admin.job.jobTitle';
import { allSchedules } from '@/services/admin.job.workSchedule';
import { allLocations } from '@/services/admin.organization.location';
import { allDepartments } from '@/services/admin.organization.structure';
import { allJobs, getSchedule, updateJob, updateSchedule } from '@/services/employee';
import { useAsyncData } from '@/utils/hooks/useAsyncData';
import { useEmployeeDetailAccess } from '@/utils/hooks/useEmployeeDetailType';
import ProForm, {
  ModalForm,
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, Card, Form, message, Space, TimePicker, TreeSelect, Typography } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import faker from 'faker';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { Access } from 'umi';
import type { EmployeeTabProps } from '..';

const jobEvents: API.JobEvent[] = [
  // 'Joined',
  // 'Terminated',
  'Error Correction',
  'Location Changed',
  'Promoted',
  'Other',
];

export const EmployeeJob: React.FC<EmployeeTabProps> = (props) => {
  const { employeeId, isActive, onChange } = props;
  const intl = useIntl();

  // == RBAC.BEGIN
  const { canViewJob, canChangeJob, canViewSchedule, canChangeSchedule } = useEmployeeDetailAccess({
    employeeId,
    isActive,
  });
  // == RBAC.END

  const [departments, setDepartments] = useState<API.DepartmentUnit[]>();
  const [jobTitles, setJobTitles] = useState<API.JobTitle[]>();
  const [schedules, setSchedules] = useState<API.Schedule[]>();
  const [locations, setLocations] = useState<API.Location[]>();
  const [employmentStatuses, setEmploymentStatuses] = useState<API.EmploymentStatus[]>();
  const [terminationForm] = useForm<API.TerminateContract>();
  const [scheduleForm] = useForm<API.EmployeeSchedule>();
  const [rejoinForm] = useForm<API.EmployeeJob>();
  const jobs = useAsyncData<API.EmployeeJob[]>(() => allJobs(employeeId), {
    callOnMount: canViewJob,
  });
  const schedule = useAsyncData<API.EmployeeSchedule>(() => getSchedule(employeeId), {
    callOnMount: canViewSchedule,
  });

  useEffect(() => {
    allDepartments().then((fetchData) => setDepartments(fetchData));
    allJobTitles().then((fetchData) => setJobTitles(fetchData));
    allLocations().then((fetchData) => setLocations(fetchData));
    allEmploymentStatuses().then((fetchData) => setEmploymentStatuses(fetchData));
    allSchedules().then((fetchData) => setSchedules(fetchData));
  }, []);

  const treeData = departments?.map((it) => ({
    id: it.id,
    pId: it.parent,
    value: it.name,
    title: it.name,
    key: it.id,
    isLeaf: !departments.some((x) => x.parent === it.id),
  }));

  const jobEventsMap = {
    Joined: { text: intl.formatMessage({ id: 'property.jobEvent.Joined' }) },
    Terminated: { text: intl.formatMessage({ id: 'property.jobEvent.Terminated' }) },
    'Error Correction': { text: intl.formatMessage({ id: 'property.jobEvent.ErrorCorrection' }) },
    'Location Changed': { text: intl.formatMessage({ id: 'property.jobEvent.LocationChanged' }) },
    Promoted: { text: intl.formatMessage({ id: 'property.jobEvent.Promoted' }) },
    Other: { text: intl.formatMessage({ id: 'property.jobEvent.Other' }) },
  };

  const onUpdateJob = useCallback(
    async (value: API.EmployeeJob) => {
      try {
        value.owner = employeeId;
        value.probation_start_date = moment(value.probation_start_date).format('YYYY-MM-DD');
        value.probation_end_date = moment(value.probation_end_date).format('YYYY-MM-DD');
        value.contract_start_date = moment(value.contract_start_date).format('YYYY-MM-DD');
        value.contract_end_date = moment(value.contract_end_date).format('YYYY-MM-DD');
        value.event = value.event || 'Joined'; // If it's a Join event, then it will not be shown on the Form, so we automatically assign to it
        await updateJob(employeeId, value);
        if (jobs.data) {
          jobs.setData([value, ...jobs.data]);
        }
        const firstJobEver = !jobs.data?.length;
        const rejoin = !isActive;
        if (firstJobEver || rejoin) {
          onChange?.status?.('Working');
          if (rejoin) {
            await jobs.fetchData();
          }
        }
        message.success(
          intl.formatMessage({
            id: 'error.updateSuccessfully',
            defaultMessage: 'Update successfully!',
          }),
        );
      } catch {
        message.success(
          intl.formatMessage({
            id: 'error.updateUnsuccessfully',
            defaultMessage: 'Update unsuccessfully!',
          }),
        );
      }
    },
    [employeeId, jobs, onChange, isActive],
  );

  const columns: ProColumns<API.EmployeeJob>[] = [
    {
      title: intl.formatMessage({
        id: 'property.timestamp',
      }),
      dataIndex: 'timestamp',
      renderText: (it) => moment(it).format('YYYY-MM-DD hh:mm:ss'),
    },
    {
      title: intl.formatMessage({
        id: 'property.department',
      }),
      dataIndex: 'department',
    },
    {
      title: intl.formatMessage({
        id: 'property.job_title',
      }),
      dataIndex: 'job_title',
    },
    {
      title: intl.formatMessage({
        id: 'property.location',
      }),
      dataIndex: 'location',
    },
    {
      title: intl.formatMessage({
        id: 'property.employment_status',
      }),
      dataIndex: 'employment_status',
    },
    {
      title: intl.formatMessage({
        id: 'property.probation_start_date',
      }),
      dataIndex: 'probation_start_date',
    },
    {
      title: intl.formatMessage({
        id: 'property.probation_end_date',
      }),
      dataIndex: 'probation_end_date',
    },
    {
      title: intl.formatMessage({
        id: 'property.contract_start_date',
      }),
      dataIndex: 'contract_start_date',
    },
    {
      title: intl.formatMessage({
        id: 'property.contract_end_date',
      }),
      dataIndex: 'contract_end_date',
    },
    {
      title: intl.formatMessage({
        id: 'property.event',
      }),
      dataIndex: 'event',
      fixed: 'right',
      width: 'max-content',
      valueEnum: jobEventsMap,
    },
  ];

  const scheduleDays = convertFromBackend(
    (schedule.data?.schedule as API.Schedule)?.workdays || [],
  );

  return (
    <>
      <Access accessible={canViewJob}>
        <Card
          loading={jobs.isLoading}
          title={
            isActive
              ? intl.formatMessage({
                  id: 'property.jobInfo',
                })
              : intl.formatMessage({
                  id: 'property.jobTerminated',
                })
          }
          className="card-shadow"
        >
          {isActive ? (
            <ProForm<API.EmployeeJob>
              onFinish={onUpdateJob}
              initialValues={{ ...jobs.data?.[0], event: undefined }}
              submitter={{
                render: ({ form }, defaultDoms) => {
                  return (
                    canChangeJob && [
                      ...defaultDoms,
                      __DEV__ && (
                        <Button
                          key="autoFill"
                          onClick={() => {
                            form?.setFieldsValue({
                              department: faker.helpers.randomize(
                                departments?.map((it) => it.name) || [],
                              ),
                              job_title: faker.helpers.randomize(
                                jobTitles?.map((it) => it.name) || [],
                              ),
                              location: faker.helpers.randomize(
                                locations?.map((it) => it.name) || [],
                              ),
                              employment_status: faker.helpers.randomize(
                                employmentStatuses?.map((it) => it.name) || [],
                              ),
                              probation_start_date: moment(faker.date.recent()),
                              probation_end_date: moment(faker.date.future()),
                              contract_start_date: moment(faker.date.future()),
                              contract_end_date: moment(faker.date.future()),
                              event: faker.helpers.randomize<API.JobEvent>(jobEvents),
                            });
                          }}
                        >
                          Auto fill
                        </Button>
                      ),
                    ]
                  );
                },
              }}
            >
              <ProForm.Group>
                <ProFormSelect
                  name="employment_status"
                  label={intl.formatMessage({ id: 'property.employment_status' })}
                  width="md"
                  options={employmentStatuses?.map((it) => ({ value: it.name, label: it.name }))}
                  hasFeedback={!employmentStatuses}
                  rules={[{ required: true }]}
                />
                <ProFormSelect
                  name="job_title"
                  label={intl.formatMessage({ id: 'property.job_title' })}
                  width="md"
                  options={jobTitles?.map((it) => ({ value: it.name, label: it.name }))}
                  hasFeedback={!jobTitles}
                  rules={[{ required: true }]}
                />
                <Form.Item
                  name="department"
                  label={intl.formatMessage({ id: 'property.department' })}
                  rules={[{ required: true }]}
                >
                  <TreeSelect
                    treeDataSimpleMode
                    style={{ width: '100%', minWidth: 328 }}
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    treeDefaultExpandAll
                    loading={!departments}
                    treeData={treeData}
                    placeholder="Please select"
                  />
                </Form.Item>
                <ProFormSelect
                  width="md"
                  name="location"
                  label={intl.formatMessage({ id: 'property.location' })}
                  options={locations?.map((it) => ({ value: it.name, label: it.name }))}
                  hasFeedback={!locations}
                  rules={[{ required: true }]}
                />
                <ProFormDatePicker
                  width="md"
                  name="probation_start_date"
                  label={intl.formatMessage({ id: 'property.probation_start_date' })}
                />
                <ProFormDatePicker
                  width="md"
                  name="probation_end_date"
                  label={intl.formatMessage({ id: 'property.probation_end_date' })}
                />
                <ProFormDatePicker
                  width="md"
                  name="contract_start_date"
                  label={intl.formatMessage({ id: 'property.contract_start_date' })}
                />
                <ProFormDatePicker
                  width="md"
                  name="contract_end_date"
                  label={intl.formatMessage({ id: 'property.contract_end_date' })}
                />
                {jobs.data?.[0] !== undefined && (
                  <ProFormSelect
                    name="event"
                    width="md"
                    label={intl.formatMessage({ id: 'property.jobEvent' })}
                    options={jobEvents.map((it) => ({ value: it, label: it }))}
                    rules={[{ required: true }]}
                  />
                )}
              </ProForm.Group>
            </ProForm>
          ) : (
            <ProForm<API.TerminateContract>
              form={terminationForm}
              initialValues={jobs.data?.[0]?.termination}
              submitter={{
                render: () => {
                  return [
                    <ModalForm<API.EmployeeJob>
                      title={intl.formatMessage({ id: 'property.actions.rejoin' })}
                      width="780px"
                      form={rejoinForm}
                      trigger={
                        <Button key="rejoin" type="primary">
                          {intl.formatMessage({ id: 'property.actions.rejoin' })}
                        </Button>
                      }
                      onVisibleChange={(visible) => {
                        if (visible && jobs.data?.[0]) {
                          rejoinForm?.setFieldsValue(jobs.data[0]);
                        }
                      }}
                      submitter={{
                        render: ({ form: innerForm }, innerDefaultDoms) => {
                          return [
                            ...innerDefaultDoms,
                            __DEV__ && (
                              <Button
                                key="autoFill"
                                onClick={() => {
                                  innerForm?.setFieldsValue({
                                    department: faker.helpers.randomize(
                                      departments?.map((it) => it.name) || [],
                                    ),
                                    job_title: faker.helpers.randomize(
                                      jobTitles?.map((it) => it.name) || [],
                                    ),
                                    location: faker.helpers.randomize(
                                      locations?.map((it) => it.name) || [],
                                    ),
                                    employment_status: faker.helpers.randomize(
                                      employmentStatuses?.map((it) => it.name) || [],
                                    ),
                                    probation_start_date: moment(faker.date.recent()),
                                    probation_end_date: moment(faker.date.future()),
                                    contract_start_date: moment(faker.date.future()),
                                    contract_end_date: moment(faker.date.future()),
                                    event: faker.helpers.randomize<API.JobEvent>(jobEvents),
                                  });
                                }}
                              >
                                Auto fill
                              </Button>
                            ),
                          ];
                        },
                      }}
                      onFinish={onUpdateJob}
                    >
                      <ProForm.Group>
                        <ProFormSelect
                          width="md"
                          name="employment_status"
                          label={intl.formatMessage({ id: 'property.employment_status' })}
                          options={employmentStatuses?.map((it) => ({
                            value: it.name,
                            label: it.name,
                          }))}
                          hasFeedback={!employmentStatuses}
                          rules={[{ required: true }]}
                        />
                        <ProFormSelect
                          width="md"
                          name="job_title"
                          label={intl.formatMessage({ id: 'property.job_title' })}
                          options={jobTitles?.map((it) => ({ value: it.name, label: it.name }))}
                          hasFeedback={!jobTitles}
                          rules={[{ required: true }]}
                        />
                        <Form.Item
                          name="department"
                          label={intl.formatMessage({ id: 'property.department' })}
                          rules={[{ required: true }]}
                        >
                          <TreeSelect
                            treeDataSimpleMode
                            style={{ width: '100%', minWidth: 328 }}
                            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                            treeDefaultExpandAll
                            loading={!departments}
                            treeData={treeData}
                            placeholder="Please select"
                          />
                        </Form.Item>
                        <ProFormSelect
                          width="md"
                          name="location"
                          label={intl.formatMessage({ id: 'property.location' })}
                          options={locations?.map((it) => ({ value: it.name, label: it.name }))}
                          hasFeedback={!locations}
                          rules={[{ required: true }]}
                        />
                        <ProFormDatePicker
                          width="md"
                          name="probation_start_date"
                          label={intl.formatMessage({ id: 'property.probation_start_date' })}
                        />
                        <ProFormDatePicker
                          width="md"
                          name="probation_end_date"
                          label={intl.formatMessage({ id: 'property.probation_end_date' })}
                        />
                        <ProFormDatePicker
                          width="md"
                          name="contract_start_date"
                          label={intl.formatMessage({ id: 'property.contract_start_date' })}
                        />
                        <ProFormDatePicker
                          width="md"
                          name="contract_end_date"
                          label={intl.formatMessage({ id: 'property.contract_end_date' })}
                        />
                      </ProForm.Group>
                    </ModalForm>,
                  ];
                },
              }}
            >
              <ProForm.Group>
                <ProFormText
                  width="md"
                  name="reason"
                  label={intl.formatMessage({ id: 'property.reason' })}
                  disabled
                />
                <ProFormDatePicker
                  width="md"
                  name="date"
                  label={intl.formatMessage({ id: 'property.date' })}
                  initialValue={moment()}
                  disabled
                />
              </ProForm.Group>
              <ProFormTextArea
                width="md"
                name="note"
                label={intl.formatMessage({ id: 'property.note' })}
                disabled
              />
            </ProForm>
          )}
        </Card>
      </Access>

      <Access accessible={canViewSchedule}>
        <Card
          loading={schedules === undefined || schedule.isLoading}
          title={intl.formatMessage({ id: 'property.workSchedule' })}
          className="card-shadow"
        >
          <ProForm<API.EmployeeSchedule>
            onFinish={async (value) => {
              try {
                value.schedule = (value.schedule as API.Schedule).name;
                value.owner = employeeId;
                await updateSchedule(employeeId, value);
                // onChange?.();
                message.success(
                  intl.formatMessage({
                    id: 'error.updateSuccessfully',
                    defaultMessage: 'Update successfully!',
                  }),
                );
              } catch {
                message.success(
                  intl.formatMessage({
                    id: 'error.updateUnsuccessfully',
                    defaultMessage: 'Update unsuccessfully!',
                  }),
                );
              }
            }}
            initialValues={schedule.data}
            submitter={canChangeSchedule ? undefined : false}
            form={scheduleForm}
            onValuesChange={(changedValues) => {
              if (changedValues.schedule?.name) {
                const updatedSchedule = schedules?.find(
                  (it) => it.name === changedValues.schedule?.name,
                );
                if (updatedSchedule)
                  schedule.setData({
                    ...schedule.data,
                    schedule: updatedSchedule,
                  });
              }
            }}
          >
            <ProFormSelect
              rules={[{ required: true }]}
              name={['schedule', 'name']}
              width="lg"
              label={`${intl.formatMessage({
                id: 'property.workSchedule',
              })}  (${scheduleDays?.reduce((acc, cur) => acc + calcHours(cur), 0)} hrs)`}
              options={schedules?.map((it) => ({ value: it.name, label: it.name }))}
              disabled={!isActive}
            />
            {isActive && (
              <>
                <Typography style={{ marginBottom: 24, fontSize: '1.1em' }}>
                  <b>{intl.formatMessage({ id: 'pages.employee.preview' })}:</b>{' '}
                  <small>
                    <i>
                      {intl.formatMessage({ id: 'pages.employee.belowIsReadonly' })},{' '}
                      <b style={{ textTransform: 'uppercase' }}>
                        {intl.formatMessage({ id: 'pages.employee.pleaseSelectBelow' })}
                      </b>
                      ):
                    </i>
                  </small>
                </Typography>
                {scheduleDays.map((it) => (
                  <Form.Item
                    name={it.day}
                    label={`${intl.formatMessage({
                      id: `property.workDays.${it.day}`,
                    })} (${calcHours(it)}hrs)`}
                    labelCol={{ span: 2 }}
                    wrapperCol={{ span: 20 }}
                    style={{ flexDirection: 'row' }}
                  >
                    <Space>
                      <TimePicker.RangePicker
                        format="HH:mm"
                        minuteStep={5}
                        style={{ width: '100%' }}
                        value={it.morning}
                        disabled={!it.morning_enabled}
                        open={false}
                        clearIcon={false}
                      />
                      <TimePicker.RangePicker
                        format="HH:mm"
                        minuteStep={5}
                        style={{ width: '100%' }}
                        value={it.afternoon}
                        disabled={!it.afternoon_enabled}
                        open={false}
                        clearIcon={false}
                      />
                      <p style={{ marginRight: 5 }}></p>
                    </Space>
                  </Form.Item>
                ))}
              </>
            )}
          </ProForm>
        </Card>
      </Access>

      <Access accessible={canViewJob}>
        <ProTable<API.EmployeeJob>
          headerTitle={intl.formatMessage({ id: 'property.jobHistory' })}
          rowKey="id"
          columns={columns}
          dataSource={jobs.data}
          loading={jobs.isLoading}
          search={false}
          style={{ width: '100%' }}
          scroll={{ x: 'max-content' }}
          className="card-shadow"
        />
      </Access>
    </>
  );
};
