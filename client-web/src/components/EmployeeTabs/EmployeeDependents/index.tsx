import { __DEV__ } from '@/global';
import { allCountries } from '@/services';
import {
  allDependents,
  createDependent,
  deleteDependent,
  updateDependent
} from '@/services/employee';
import { useEmployeeDetailAccess } from '@/utils/hooks/useEmployeeDetailType';
import {
  DeleteOutlined,
  EditOutlined,
  ManOutlined,
  PlusOutlined,
  WomanOutlined
} from '@ant-design/icons';
import ProForm, {
  ModalForm,
  ProFormDatePicker,
  ProFormSelect,
  ProFormText
} from '@ant-design/pro-form';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, message, Popconfirm, Space } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import faker from 'faker';
import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Access, FormattedMessage, useIntl } from 'umi';
import type { EmployeeTabProps } from '..';

type RecordType = API.EmployeeDependent;

export const EmployeeDependent: React.FC<EmployeeTabProps> = (props) => {
  const { employeeId, isActive, onChange } = props;

  // == RBAC.BEGIN
  const {
    canViewDependent,
    canAddDependent,
    canChangeDependent,
    canDeleteDependent,
  } = useEmployeeDetailAccess({ employeeId, isActive });
  // == RBAC.END

  const actionRef = useRef<ActionType>();
  const [crudModalVisible, setCrudModalVisible] = useState<'hidden' | 'create' | 'update'>(
    'hidden',
  );
  const [selectedRecord, setSelectedRecord] = useState<RecordType>();
  const [form] = useForm<RecordType>();
  const intl = useIntl();
  const [countries, setCountries] = useState<API.Country[]>([]);

  useEffect(() => {
    allCountries().then((fetchData) => setCountries(fetchData));
  }, []);

  const onCrudOperation = useCallback(
    async (cb: () => Promise<any>, successMessage: string, errorMessage: string) => {
      try {
        await cb();
        actionRef.current?.reload();
        // onChange?.();
        message.success(successMessage);
      } catch (err) {
        message.error(errorMessage);
        throw err;
      }
    },
    [],
  );

  const columns: ProColumns<RecordType>[] = [
    { title: 'First name', dataIndex: 'first_name' },
    { title: 'Last name', dataIndex: 'last_name' },
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
          text: 'Other',
        },
      },
    },
    {
      title: (
        <FormattedMessage
          id="property.date_of_birth"
          defaultMessage="Date of birth"
        />
      ),
      key: 'date_of_birth',
      dataIndex: 'date_of_birth',
      renderText: (it) => moment(it).format('DD MMM YYYY'),
    },
    { title: 'Relationship', dataIndex: 'relationship' },
    {
      title: 'Nationality',
      dataIndex: 'nationality',
      renderText: (it) => countries.find((x) => x.id === it)?.name,
    },
    { title: 'Province', dataIndex: 'province' },
    { title: 'City', dataIndex: 'city' },
    { title: 'Peronal tax id', dataIndex: 'personal_tax_id' },
    { title: 'Personal id', dataIndex: 'personal_id' },
    {
      title: 'Effective',
      dataIndex: 'effective_start_date',
      renderText: (_, record) =>
        `${
          record.effective_start_date
            ? moment(record.effective_start_date).format('DD MMM YYYY')
            : '...'
        } → ${
          record.effective_end_date
            ? moment(record.effective_end_date).format('DD MMM YYYY')
            : '...'
        }`,
    },
    (canChangeDependent || canDeleteDependent) && {
      title: <FormattedMessage id="property.actions" defaultMessage="Actions" />,
      key: 'action',
      fixed: 'right',
      align: 'center',
      search: false,
      render: (dom, record) => (
        <Space size="small">
          <Access accessible={canChangeDependent}>
            <Button
              title={`${intl.formatMessage({
                id: 'property.actions.update',
                defaultMessage: 'Update',
              })} ${localeFeature}`}
              size="small"
              onClick={() => {
                setCrudModalVisible('update');
                setSelectedRecord(record);
              }}
            >
              <EditOutlined />
            </Button>
          </Access>
          <Access accessible={canDeleteDependent}>
            <Popconfirm
              placement="right"
                            title={`${intl.formatMessage({
                id: 'property.actions.delete',
                defaultMessage: 'Delete',
              })} ${localeFeature}?`}
              onConfirm={async () => {
                await onCrudOperation(
                  () => deleteDependent(employeeId, record.id),
                  intl.formatMessage({
                    id: 'error.deleteSuccessfully',
                    defaultMessage: 'Delete successfully!',
                  }),
                  intl.formatMessage({
                    id: 'error.deleteUnsuccessfully',
                    defaultMessage: 'Delete unsuccessfully!',
                  }),
                );
              }}
            >
              <Button title="Delete this dependent" size="small" danger>
                <DeleteOutlined />
              </Button>
            </Popconfirm>
          </Access>
        </Space>
      ),
    },
  ];

  const dict = {
    title: {
      create: 'Add dependent',
      update: 'Update dependent',
    },
  };

  return (
    <Access accessible={canViewDependent}>
      <ProTable<RecordType>
        headerTitle={intl.formatMessage({
          id: 'pages.admin.job.Dependent.list.title',
          defaultMessage: 'Dependents',
        })}
        className="card-shadow"
        actionRef={actionRef}
        scroll={{ x: 'max-content' }}
        rowKey="id"
        search={false}
        locale={{ emptyText: 'No dependents' }}
        toolBarRender={() => [
          <Access accessible={canAddDependent}>
            <Button
              type="primary"
              key="primary"
              onClick={() => {
                setCrudModalVisible('create');
              }}
            >
              <PlusOutlined /> <FormattedMessage id="property.actions.create" defaultMessage="New" />
            </Button>
          </Access>,
        ]}
        request={async () => {
          const data = await allDependents(employeeId);
          return {
            data,
            success: true,
          };
        }}
        columns={columns}
      />
      <ModalForm<RecordType>
        title={dict.title[crudModalVisible]}
        width="800px"
        visible={crudModalVisible !== 'hidden'}
        form={form}
        onVisibleChange={(visible) => {
          if (!visible) {
            setCrudModalVisible('hidden');
            form.resetFields();
            return;
          }
          if (!selectedRecord) return;
          if (crudModalVisible === 'update') {
            form.setFieldsValue({
              ...selectedRecord,
            });
          } else if (crudModalVisible === 'create') {
            form.setFieldsValue({});
          }
        }}
        onFinish={async (value) => {
          const record = {
            ...selectedRecord,
            ...value,
            date_of_birth: value.date_of_birth && moment(value.date_of_birth),
            effective_start_date: value.effective_start_date && moment(value.effective_start_date),
            effective_end_date: value.effective_end_date && moment(value.effective_end_date),
            owner: employeeId,
          };
          if (crudModalVisible === 'create') {
            await onCrudOperation(
              () => createDependent(employeeId, record),
              intl.formatMessage({
                id: 'error.createSuccessfully',
                defaultMessage: 'Create successfully!',
              }),
              intl.formatMessage({
                id: 'error.createUnsuccessfully',
                defaultMessage: 'Create unsuccessfully!',
              }),
            );
          } else if (crudModalVisible === 'update') {
            await onCrudOperation(
              () => updateDependent(employeeId, record.id, record),
              intl.formatMessage({
                id: 'error.updateSuccessfully',
                defaultMessage: 'Update successfully!',
              }),
              intl.formatMessage({
                id: 'error.updateUnsuccessfully',
                defaultMessage: 'Update unsuccessfully!',
              }),
            );
          }
          setCrudModalVisible('hidden');
          form.resetFields();
        }}
        submitter={{
          render: (_props, defaultDoms) => {
            return [
              __DEV__ && (
                <Button
                  key="autoFill"
                  onClick={() => {
                    _props.form?.setFieldsValue({
                      first_name: faker.name.firstName(),
                      last_name: faker.name.lastName(),
                      gender: faker.helpers.randomize(['Male', 'Female', 'Other']),
                      date_of_birth: moment(faker.date.past(30)),
                      relationship: faker.helpers.randomize([
                        'Father',
                        'Mother',
                        'Father-in-law',
                        'Mother-in-law',
                        'Son',
                        'Daughter',
                        'Sister',
                        'Brother',
                        'Spouse',
                        'Other',
                      ]),
                      nationality: faker.helpers.randomize(countries.map((it) => it.id)),
                      province: faker.address.state(),
                      city: faker.address.city(),
                      personal_tax_id: faker.finance.account(),
                      personal_id: faker.finance.account(),
                      effective_start_date: moment(),
                      effective_end_date: null,
                    });
                  }}
                >
                  Auto fill
                </Button>
              ),
              ...defaultDoms,
            ];
          },
        }}
      >
        <ProForm.Group>
          <ProFormText
            width="sm"
            rules={[{ required: true }]}
            name="first_name"
            label="First name"
          />
          <ProFormText width="sm" rules={[{ required: true }]} name="last_name" label="Last name" />
          <ProFormSelect
            width="sm"
            name="gender"
            label="Gender"
            options={[
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Other', label: 'Other' },
            ]}
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormDatePicker width="sm" name="date_of_birth" label="Date of birth" />
          <ProFormSelect
            width="sm"
            name="relationship"
            label="Relationship"
            options={[
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Other', label: 'Other' },
            ]}
          />
          <ProFormSelect
            width="sm"
            name="nationality"
            label="Nationality"
            options={countries.map((it) => ({ value: it.id, label: it.name }))}
          />
          <ProFormText width="sm" name="province" label="Province" />
          <ProFormText width="sm" name="city" label="City" />
          <ProFormText width="sm" name="personal_id" label="Personal id" />
          <ProFormText width="sm" name="personal_tax_id" label="Personal tax id" />
          <ProFormDatePicker width="sm" name="effective_start_date" label="Effective start date" />
          <ProFormDatePicker width="sm" name="effective_end_date" label="Effective end date" />
        </ProForm.Group>
      </ModalForm>
    </Access>
  );
};

export default EmployeeDependent;
