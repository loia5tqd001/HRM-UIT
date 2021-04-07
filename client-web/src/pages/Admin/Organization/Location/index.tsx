import { __DEV__ } from '@/global';
import {
  allLocations,
  createLocation,
  deleteLocation,
  updateLocation,
} from '@/services/admin.organization.location';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import ProForm, {
  ModalForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, message, Popconfirm, Space } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import faker from 'faker';
import React, { useCallback, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'umi';
import { useEffect } from 'react';
import { allCountries } from '@/services';

type RecordType = API.Location;

export const Location: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [crudModalVisible, setCrudModalVisible] = useState<'hidden' | 'create' | 'update'>(
    'hidden',
  );
  const [selectedRecord, setSelectedRecord] = useState<RecordType>();
  const [form] = useForm<RecordType>();
  const intl = useIntl();
  const [countries, setCountries] = useState<API.Country[]>([]);

  useEffect(() => {
    allCountries().then((data) => setCountries(data));
  }, []);

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
    [],
  );

  const columns: ProColumns<RecordType>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.admin.organization.location.column.name"
          defaultMessage="Location"
        />
      ),
      dataIndex: 'name',
    },
    {
      title: (
        <FormattedMessage
          id="pages.admin.organization.location.column.country"
          defaultMessage="Country"
        />
      ),
      dataIndex: 'country',
      renderText: (text) => countries.find((it) => it.id === text)?.name,
    },
    {
      title: (
        <FormattedMessage
          id="pages.admin.organization.location.column.province"
          defaultMessage="Province"
        />
      ),
      dataIndex: 'province',
    },
    {
      title: (
        <FormattedMessage
          id="pages.admin.organization.location.column.city"
          defaultMessage="City"
        />
      ),
      dataIndex: 'city',
    },
    {
      title: (
        <FormattedMessage
          id="pages.admin.organization.location.column.address"
          defaultMessage="Address"
        />
      ),
      dataIndex: 'address',
    },
    {
      title: (
        <FormattedMessage
          id="pages.admin.organization.location.column.zipcode"
          defaultMessage="Zipcode"
        />
      ),
      dataIndex: 'zipcode',
    },
    {
      title: (
        <FormattedMessage
          id="pages.admin.organization.location.column.phone"
          defaultMessage="Phone"
        />
      ),
      dataIndex: 'phone',
    },
    {
      title: (
        <FormattedMessage id="pages.admin.organization.location.column.fax" defaultMessage="Fax" />
      ),
      dataIndex: 'fax',
    },
    {
      title: (
        <FormattedMessage
          id="pages.admin.organization.location.column.note"
          defaultMessage="Note"
        />
      ),
      dataIndex: 'note',
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
            title="Edit this location"
            size="small"
            onClick={() => {
              setCrudModalVisible('update');
              setSelectedRecord(record);
            }}
          >
            <EditOutlined />
          </Button>
          <Popconfirm
            placement="right"
            title={'Delete this location?'}
            onConfirm={async () => {
              await onCrudOperation(
                () => deleteLocation(record.id),
                'Delete successfully!',
                'Cannot delete location!',
              );
            }}
          >
            <Button title="Delete this location" size="small" danger>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const dict = {
    title: {
      create: 'Create location',
      update: 'Create location',
    },
  };

  return (
    <PageContainer>
      <ProTable<RecordType>
        headerTitle={intl.formatMessage({
          id: 'pages.admin.organization.location.list.title',
          defaultMessage: 'Locations',
        })}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setCrudModalVisible('create');
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="新建" />
          </Button>,
        ]}
        request={async () => {
          const data = await allLocations();
          return {
            data,
            success: true,
          };
        }}
        columns={columns}
      />
      <ModalForm<RecordType>
        title={dict.title[crudModalVisible]}
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
          };
          if (crudModalVisible === 'create') {
            await onCrudOperation(
              () => createLocation(record),
              'Create successfully!',
              'Create unsuccessfully!',
            );
          } else if (crudModalVisible === 'update') {
            await onCrudOperation(
              () => updateLocation(record.id, record),
              'Update successfully!',
              'Update unsuccessfully!',
            );
          }
          setCrudModalVisible('hidden');
          form.resetFields();
        }}
        submitter={{
          render: (props, defaultDoms) => {
            return [
              __DEV__ && (
                <Button
                  key="autoFill"
                  onClick={() => {
                    props.form?.setFieldsValue({
                      name: faker.address.streetName(),
                      province: faker.address.state(),
                      city: faker.address.city(),
                      address: faker.address.streetName(),
                      zipcode: faker.address.zipCode(),
                      phone: faker.phone.phoneNumber('+## ########'),
                      fax: faker.random.number({ min: 1000000, max: 9999999 }),
                      note: faker.lorem.words(),
                      country: faker.helpers.randomize(countries.map((it) => it.id)),
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
            rules={[{ required: true }]}
            name="name"
            width="sm"
            label={intl.formatMessage({
              id: 'pages.admin.organization.location.column.name',
              defaultMessage: 'Location',
            })}
          />
          {/* <ProFormText
            rules={[{ required: true }]}
            name="country"
            width="sm"
            label={intl.formatMessage({
              id: 'pages.admin.organization.location.column.country',
              defaultMessage: 'Country',
            })}
          /> */}
          <ProFormSelect
            rules={[{ required: true }]}
            name="country"
            width="sm"
            label={intl.formatMessage({
              id: 'pages.admin.organization.location.column.country',
              defaultMessage: 'Country',
            })}
            options={countries.map((it) => ({ value: it.id, label: it.name }))}
          />
          <ProFormText
            name="province"
            width="sm"
            label={intl.formatMessage({
              id: 'pages.admin.organization.location.column.province',
              defaultMessage: 'Province',
            })}
          />
          <ProFormText
            name="city"
            width="sm"
            label={intl.formatMessage({
              id: 'pages.admin.organization.location.column.city',
              defaultMessage: 'City',
            })}
          />
          <ProFormText
            name="address"
            width="sm"
            label={intl.formatMessage({
              id: 'pages.admin.organization.location.column.address',
              defaultMessage: 'Address',
            })}
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormText
            name="zipcode"
            width="sm"
            label={intl.formatMessage({
              id: 'pages.admin.organization.location.column.zipcode',
              defaultMessage: 'Zipcode',
            })}
          />
          <ProFormText
            name="phone"
            width="sm"
            label={intl.formatMessage({
              id: 'pages.admin.organization.location.column.phone',
              defaultMessage: 'Phone',
            })}
          />
          <ProFormText
            name="fax"
            width="sm"
            label={intl.formatMessage({
              id: 'pages.admin.organization.location.column.fax',
              defaultMessage: 'Fax',
            })}
          />
          <ProFormTextArea
            name="note"
            width="sm"
            label={intl.formatMessage({
              id: 'pages.admin.organization.location.column.note',
              defaultMessage: 'Note',
            })}
          />
        </ProForm.Group>
      </ModalForm>
    </PageContainer>
  );
};

export default Location;
