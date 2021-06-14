import { __DEV__ } from '@/global';
import { allCountries } from '@/services';
import {
  allDependents,
  createDependent,
  deleteDependent,
  updateDependent,
} from '@/services/employee';
import { useEmployeeDetailAccess } from '@/utils/hooks/useEmployeeDetailType';
import {
  DeleteOutlined,
  EditOutlined,
  ManOutlined,
  PlusOutlined,
  WomanOutlined,
} from '@ant-design/icons';
import ProForm, {
  ModalForm,
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
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
  const intl = useIntl();
  const localeFeature = intl.formatMessage({ id: 'property.dependent' });

  // == RBAC.BEGIN
  const { canViewDependent, canAddDependent, canChangeDependent, canDeleteDependent } =
    useEmployeeDetailAccess({ employeeId, isActive });
  // == RBAC.END

  const actionRef = useRef<ActionType>();
  const [crudModalVisible, setCrudModalVisible] = useState<'hidden' | 'create' | 'update'>(
    'hidden',
  );
  const [selectedRecord, setSelectedRecord] = useState<RecordType>();
  const [form] = useForm<RecordType>();
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
    { title: intl.formatMessage({ id: 'property.first_name' }), dataIndex: 'first_name' },
    { title: intl.formatMessage({ id: 'property.last_name' }), dataIndex: 'last_name' },
    {
      title: intl.formatMessage({ id: 'property.gender' }),
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
          text: intl.formatMessage({ id: 'property.gender.other' }),
        },
      },
    },
    {
      title: intl.formatMessage({ id: 'property.date_of_birth' }),
      key: 'date_of_birth',
      dataIndex: 'date_of_birth',
      renderText: (it) => moment(it).format('DD MMM YYYY'),
    },
    {
      title: intl.formatMessage({ id: 'property.relationship' }),
      dataIndex: 'relationship',
      valueEnum: {
        Father: { text: intl.formatMessage({ id: 'property.relationship.Father' }) },
        Mother: { text: intl.formatMessage({ id: 'property.relationship.Mother' }) },
        'Father-in-law': {
          text: intl.formatMessage({ id: 'property.relationship.Father-in-law' }),
        },
        'Mother-in-law': {
          text: intl.formatMessage({ id: 'property.relationship.Mother-in-law' }),
        },
        Son: { text: intl.formatMessage({ id: 'property.relationship.Son' }) },
        Daughter: { text: intl.formatMessage({ id: 'property.relationship.Daughter' }) },
        Sister: { text: intl.formatMessage({ id: 'property.relationship.Sister' }) },
        Brother: { text: intl.formatMessage({ id: 'property.relationship.Brother' }) },
        Spouse: { text: intl.formatMessage({ id: 'property.relationship.Spouse' }) },
        Other: { text: intl.formatMessage({ id: 'property.relationship.Other' }) },
      },
    },
    {
      title: intl.formatMessage({ id: 'property.nationality' }),
      dataIndex: 'nationality',
      renderText: (it) => countries.find((x) => x.id === it)?.name,
    },
    { title: intl.formatMessage({ id: 'property.province' }), dataIndex: 'province' },
    { title: intl.formatMessage({ id: 'property.city' }), dataIndex: 'city' },
    { title: intl.formatMessage({ id: 'property.personal_tax_id' }), dataIndex: 'personal_tax_id' },
    { title: intl.formatMessage({ id: 'property.personal_id' }), dataIndex: 'personal_id' },
    {
      title: intl.formatMessage({ id: 'property.effective' }),
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
      width: 'min-content',
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
              <Button
                title={`${intl.formatMessage({
                  id: 'property.actions.delete',
                  defaultMessage: 'Delete',
                })} ${localeFeature}?`}
                size="small"
                danger
              >
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
      create: `${intl.formatMessage({
        id: 'property.actions.create',
        defaultMessage: 'Create',
      })} ${localeFeature}`,
      update: `${intl.formatMessage({
        id: 'property.actions.update',
        defaultMessage: 'Update',
      })} ${localeFeature}`,
    },
  };

  return (
    <Access accessible={canViewDependent}>
      <ProTable<RecordType>
        headerTitle={`${intl.formatMessage({
          id: 'property.actions.list',
          defaultMessage: ' ',
        })} ${localeFeature}`}
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
              <PlusOutlined />{' '}
              <FormattedMessage id="property.actions.create" defaultMessage="New" />
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
            label={intl.formatMessage({ id: 'property.first_name' })}
          />
          <ProFormText
            width="sm"
            rules={[{ required: true }]}
            name="last_name"
            label={intl.formatMessage({ id: 'property.last_name' })}
          />
          <ProFormSelect
            width="sm"
            name="gender"
            label={intl.formatMessage({ id: 'property.gender' })}
            options={[
              { value: 'Male', label: intl.formatMessage({ id: 'property.gender.male' }) },
              { value: 'Female', label: intl.formatMessage({ id: 'property.gender.female' }) },
              { value: 'Other', label: intl.formatMessage({ id: 'property.gender.other' }) },
            ]}
          />
          <ProFormDatePicker
            width="sm"
            name="date_of_birth"
            label={intl.formatMessage({ id: 'property.date_of_birth' })}
          />
          <ProFormSelect
            width="sm"
            name="relationship"
            label={intl.formatMessage({ id: 'property.relationship' })}
            options={[
              {
                value: 'Father',
                label: intl.formatMessage({ id: 'property.relationship.Father' }),
              },

              {
                value: 'Mother',
                label: intl.formatMessage({ id: 'property.relationship.Mother' }),
              },

              {
                value: 'Father-in-law',
                label: intl.formatMessage({ id: 'property.relationship.Father-in-law' }),
              },

              {
                value: 'Mother-in-law',
                label: intl.formatMessage({ id: 'property.relationship.Mother-in-law' }),
              },

              {
                value: 'Son',
                label: intl.formatMessage({ id: 'property.relationship.Son' }),
              },

              {
                value: 'Daughter',
                label: intl.formatMessage({ id: 'property.relationship.Daughter' }),
              },

              {
                value: 'Sister',
                label: intl.formatMessage({ id: 'property.relationship.Sister' }),
              },

              {
                value: 'Brother',
                label: intl.formatMessage({ id: 'property.relationship.Brother' }),
              },

              {
                value: 'Spouse',
                label: intl.formatMessage({ id: 'property.relationship.Spouse' }),
              },

              {
                value: 'Other',
                label: intl.formatMessage({ id: 'property.relationship.Other' }),
              },
            ]}
          />
          <ProFormSelect
            width="sm"
            name="nationality"
            label={intl.formatMessage({ id: 'property.nationality' })}
            options={countries.map((it) => ({ value: it.id, label: it.name }))}
          />
          <ProFormText
            width="sm"
            name="province"
            label={intl.formatMessage({ id: 'property.province' })}
          />
          <ProFormText width="sm" name="city" label={intl.formatMessage({ id: 'property.city' })} />
          <ProFormText
            width="sm"
            name="personal_id"
            label={intl.formatMessage({ id: 'property.personal_id' })}
          />
          <ProFormText
            width="sm"
            name="personal_tax_id"
            label={intl.formatMessage({ id: 'property.personal_tax_id' })}
          />
          <ProFormDatePicker
            width="sm"
            name="effective_start_date"
            label={intl.formatMessage({ id: 'property.effective_start_date' })}
          />
          <ProFormDatePicker
            width="sm"
            name="effective_end_date"
            label={intl.formatMessage({ id: 'property.effective_end_date' })}
          />
        </ProForm.Group>
      </ModalForm>
    </Access>
  );
};

export default EmployeeDependent;
