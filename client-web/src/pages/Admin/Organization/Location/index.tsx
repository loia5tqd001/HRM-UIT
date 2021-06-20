import { useTableSettings } from '@/utils/hooks/useTableSettings';
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
import { Access, FormattedMessage, useAccess, useIntl } from 'umi';
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
  const access = useAccess();
  const localeFeature = intl.formatMessage({ id: 'property.location' });

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
      title: localeFeature,
      dataIndex: 'name',
    },
    {
      title: <FormattedMessage id="property.country" defaultMessage="Country" />,
      dataIndex: 'country',
      renderText: (text) => countries.find((it) => it.id === text)?.name,
    },
    {
      title: <FormattedMessage id="property.province" defaultMessage="Province" />,
      dataIndex: 'province',
    },
    {
      title: <FormattedMessage id="property.city" defaultMessage="City" />,
      dataIndex: 'city',
    },
    {
      title: <FormattedMessage id="property.address" defaultMessage="Address" />,
      dataIndex: 'address',
    },
    {
      title: <FormattedMessage id="property.zipcode" defaultMessage="Zipcode" />,
      dataIndex: 'zipcode',
    },
    {
      title: <FormattedMessage id="property.phone" defaultMessage="Phone" />,
      dataIndex: 'phone',
    },
    {
      title: <FormattedMessage id="property.fax" defaultMessage="Fax" />,
      dataIndex: 'fax',
    },
    // {
    //   title: (
    //     <FormattedMessage
    //       id="pages.admin.organization.location.column.note"
    //       defaultMessage="Note"
    //     />
    //   ),
    //   dataIndex: 'note',
    // },
    (access['change_location'] || access['delete_location']) && {
      title: <FormattedMessage id="property.actions" defaultMessage="Actions" />,
      key: 'action',
      fixed: 'right',
      align: 'center',
      search: false,
      render: (dom, record) => (
        <Space size="small">
          <Access accessible={access['change_location']}>
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
          <Access accessible={access['delete_location']}>
            <Popconfirm
              placement="right"
              title={`${intl.formatMessage({
                id: 'property.actions.delete',
                defaultMessage: 'Delete',
              })} ${localeFeature}?`}
              onConfirm={async () => {
                await onCrudOperation(
                  () => deleteLocation(record.id),
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
                })} ${localeFeature}`}
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

  const tableSettings = useTableSettings();
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
    <PageContainer title={false}>
      <ProTable<RecordType>
        {...tableSettings}
        className="card-shadow"
        headerTitle={`${intl.formatMessage({
          id: 'property.actions.list',
          defaultMessage: ' ',
        })} ${localeFeature}`}
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Access accessible={access['add_location']}>
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
              () => updateLocation(record.id, record),
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
          <ProFormText rules={[{ required: true }]} name="name" width="sm" label={localeFeature} />
          {/* <ProFormText
            rules={[{ required: true }]}
            name="country"
            width="sm"
            label={intl.formatMessage({
              id: 'property.country',
              defaultMessage: 'Country',
            })}
          /> */}
          <ProFormSelect
            rules={[{ required: true }]}
            name="country"
            width="sm"
            label={intl.formatMessage({
              id: 'property.country',
              defaultMessage: 'Country',
            })}
            options={countries.map((it) => ({ value: it.id, label: it.name }))}
          />
          <ProFormText
            rules={[{ required: true }]}
            name="province"
            width="sm"
            label={intl.formatMessage({
              id: 'property.province',
              defaultMessage: 'Province',
            })}
          />
          <ProFormText
            rules={[{ required: true }]}
            name="city"
            width="sm"
            label={intl.formatMessage({
              id: 'property.city',
              defaultMessage: 'City',
            })}
          />
          <ProFormText
            name="address"
            width="sm"
            label={intl.formatMessage({
              id: 'property.address',
              defaultMessage: 'Address',
            })}
          />
          <ProFormText
            name="zipcode"
            width="sm"
            label={intl.formatMessage({
              id: 'property.zipcode',
              defaultMessage: 'Zipcode',
            })}
          />
          <ProFormText
            name="phone"
            width="sm"
            label={intl.formatMessage({
              id: 'property.phone',
              defaultMessage: 'Phone',
            })}
          />
          <ProFormText
            name="fax"
            width="sm"
            label={intl.formatMessage({
              id: 'property.fax',
              defaultMessage: 'Fax',
            })}
          />
          {/* <ProFormTextArea
            name="note"
            width="sm"
            label={intl.formatMessage({
              id: 'pages.admin.organization.location.column.note',
              defaultMessage: 'Note',
            })}
          /> */}
        </ProForm.Group>
      </ModalForm>
    </PageContainer>
  );
};

export default Location;
