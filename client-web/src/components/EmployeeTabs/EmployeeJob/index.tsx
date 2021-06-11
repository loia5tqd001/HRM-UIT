import { FormattedMessage } from '@/.umi/plugin-locale/localeExports';
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
  'Error Correction',
  'Location Changed',
  'Promoted',
  // 'Terminated',
  'Other',
];

export const EmployeeJob: React.FC<EmployeeTabProps> = (props) => {
  const { employeeId, isActive, onChange } = props;

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
        message.success('Updated successfully!');
      } catch {
        message.error('Updated unsuccessfully!');
      }
    },
    [employeeId, jobs, onChange, isActive],
  );

  const columns: ProColumns<API.EmployeeJob>[] = [
    {
      title: <FormattedMessage id="pages.admin.job.column.timestamp" defaultMessage="Timestamp" />,
      dataIndex: 'timestamp',
      renderText: (it) => moment(it).format('YYYY-MM-DD hh:mm:ss'),
    },
    {
      title: (
        <FormattedMessage id="pages.admin.job.column.department" defaultMessage="Department" />
      ),
      dataIndex: 'department',
    },
    {
      title: <FormattedMessage id="pages.admin.job.column.jobTitle" defaultMessage="Job title" />,
      dataIndex: 'job_title',
    },
    {
      title: <FormattedMessage id="pages.admin.job.column.location" defaultMessage="Location" />,
      dataIndex: 'location',
    },
    {
      title: (
        <FormattedMessage
          id="pages.admin.job.column.employmentStatus"
          defaultMessage="Employment status"
        />
      ),
      dataIndex: 'employment_status',
    },
    {
      title: (
        <FormattedMessage
          id="pages.admin.job.column.probationStartDate"
          defaultMessage="Probation start date"
        />
      ),
      dataIndex: 'probation_start_date',
    },
    {
      title: (
        <FormattedMessage
          id="pages.admin.job.column.probationEndDate"
          defaultMessage="Probation end date"
        />
      ),
      dataIndex: 'probation_end_date',
    },
    {
      title: (
        <FormattedMessage
          id="pages.admin.job.column.contractStartDate"
          defaultMessage="Contract start date"
        />
      ),
      dataIndex: 'contract_start_date',
    },
    {
      title: (
        <FormattedMessage
          id="pages.admin.job.column.contractEndDate"
          defaultMessage="Contract end date"
        />
      ),
      dataIndex: 'contract_end_date',
    },
    {
      title: <FormattedMessage id="pages.admin.job.column.event" defaultMessage="Event" />,
      dataIndex: 'event',
      fixed: 'right',
      width: 'max-content',
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
          title={isActive ? 'Job info' : 'Job Terminated'}
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
                  width="md"
                  label="Employment status"
                  options={employmentStatuses?.map((it) => ({ value: it.name, label: it.name }))}
                  hasFeedback={!employmentStatuses}
                  rules={[{ required: true }]}
                />
                <ProFormSelect
                  name="job_title"
                  width="md"
                  label="Job title"
                  options={jobTitles?.map((it) => ({ value: it.name, label: it.name }))}
                  hasFeedback={!jobTitles}
                  rules={[{ required: true }]}
                />
                <Form.Item name="department" label="Department" rules={[{ required: true }]}>
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
                  name="location"
                  width="md"
                  label="Location"
                  options={locations?.map((it) => ({ value: it.name, label: it.name }))}
                  hasFeedback={!locations}
                  rules={[{ required: true }]}
                />
                <ProFormDatePicker
                  width="md"
                  name="probation_start_date"
                  label="Probation start date"
                />
                <ProFormDatePicker
                  width="md"
                  name="probation_end_date"
                  label="Probation end date"
                />
                <ProFormDatePicker
                  width="md"
                  name="contract_start_date"
                  label="Contract start date"
                />
                <ProFormDatePicker width="md" name="contract_end_date" label="Contract end date" />
                {jobs.data?.[0] !== undefined && (
                  <ProFormSelect
                    name="event"
                    width="md"
                    label="Job event"
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
                      title="Rejoin"
                      width="780px"
                      form={rejoinForm}
                      trigger={
                        <Button key="rejoin" type="primary">
                          Rejoin
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
                          name="employment_status"
                          width="md"
                          label="Employment status"
                          options={employmentStatuses?.map((it) => ({
                            value: it.name,
                            label: it.name,
                          }))}
                          hasFeedback={!employmentStatuses}
                          rules={[{ required: true }]}
                        />
                        <ProFormSelect
                          name="job_title"
                          width="md"
                          label="Job title"
                          options={jobTitles?.map((it) => ({ value: it.name, label: it.name }))}
                          hasFeedback={!jobTitles}
                          rules={[{ required: true }]}
                        />
                        <Form.Item
                          name="department"
                          label="Department"
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
                          name="location"
                          width="md"
                          label="Location"
                          options={locations?.map((it) => ({ value: it.name, label: it.name }))}
                          hasFeedback={!locations}
                          rules={[{ required: true }]}
                        />
                        <ProFormDatePicker
                          width="md"
                          name="probation_start_date"
                          label="Probation start date"
                        />
                        <ProFormDatePicker
                          width="md"
                          name="probation_end_date"
                          label="Probation end date"
                        />
                        <ProFormDatePicker
                          width="md"
                          name="contract_start_date"
                          label="Contract start date"
                        />
                        <ProFormDatePicker
                          width="md"
                          name="contract_end_date"
                          label="Contract end date"
                        />
                      </ProForm.Group>
                    </ModalForm>,
                  ];
                },
              }}
            >
              <ProForm.Group>
                <ProFormText width="md" name="reason" label="Reason" disabled />
                <ProFormDatePicker
                  width="md"
                  name="date"
                  label="Date"
                  initialValue={moment()}
                  disabled
                />
              </ProForm.Group>
              <ProFormTextArea width="md" name="note" label="Note" disabled />
            </ProForm>
          )}
        </Card>
      </Access>

      <Access accessible={canViewSchedule}>
        <Card
          loading={schedules === undefined || schedule.isLoading}
          title={`Work schedule`}
          className="card-shadow"
        >
          <ProForm<API.EmployeeSchedule>
            onFinish={async (value) => {
              try {
                value.schedule = (value.schedule as API.Schedule).name;
                value.owner = employeeId;
                await updateSchedule(employeeId, value);
                // onChange?.();
                message.success('Updated successfully!');
              } catch {
                message.error('Updated unsuccessfully!');
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
              label={`Work schedule  (${scheduleDays?.reduce(
                (acc, cur) => acc + calcHours(cur),
                0,
              )} hrs)`}
              options={schedules?.map((it) => ({ value: it.name, label: it.name }))}
              disabled={!isActive}
            />
            {isActive && (
              <>
                <Typography style={{ marginBottom: 24, fontSize: '1.1em' }}>
                  <b>Preview</b>{' '}
                  <small>
                    <i>
                      (below is readonly for previewing purpose,{' '}
                      <b style={{ textTransform: 'uppercase' }}>please select above</b>):
                    </i>
                  </small>
                </Typography>
                {scheduleDays.map((it) => (
                  <Form.Item
                    name={it.day}
                    label={`${it.day} (${calcHours(it)}hrs)`}
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
          headerTitle="Job history"
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
