import { useTableSettings } from '@/utils/hooks/useTableSettings';
import { __DEV__ } from '@/global';
import { createDepartment, updateDepartment } from '@/services/admin.organization.structure';
import { allEmployees } from '@/services/employee';
import { useAsyncData } from '@/utils/hooks/useAsyncData';
import { ModalForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { Button, Form, TreeSelect } from 'antd';
import { useForm } from 'antd/es/form/Form';
import faker from 'faker';
import React from 'react';
import { FormattedMessage, useAccess, useIntl, useModel } from 'umi';

export const CrudModal: React.FC = () => {
  const [form] = useForm<API.DepartmentUnit>();
  const {
    crudModalVisible,
    setCrudModalVisible,
    selectedDepartment,
    departments,
    departmentsPending,
    onCrudOperation,
  } = useModel('admin.organization');
  const managers = useAsyncData<API.Employee[]>(() => allEmployees());
  const intl = useIntl();
  const access = useAccess();
  const localeFeature = intl.formatMessage({
    id: 'property.department',
    defaultMessage: 'Department',
  });

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

  const treeData = departments.map((it) => ({
    id: it.id,
    pId: it.parent,
    value: it.id,
    title: it.name,
    isLeaf: !departments.some((x) => x.parent === it.id),
    disabled: it.id === selectedDepartment?.id,
  }));

  return (
    <ModalForm
      title={dict.title[crudModalVisible]}
      width="400px"
      visible={crudModalVisible !== 'hidden'}
      onVisibleChange={(visible) => {
        if (!visible) {
          setCrudModalVisible('hidden');
          form.resetFields();
          return;
        }
        if (!selectedDepartment) return;
        if (crudModalVisible === 'update') {
          form.setFieldsValue({
            ...selectedDepartment,
            parent: selectedDepartment?.parent,
          });
        } else {
          form.setFieldsValue({
            parent: selectedDepartment?.id,
          });
        }
      }}
      onFinish={async (value) => {
        const convertedToSubmit = {
          ...selectedDepartment,
          ...value,
          parent: value.parent,
        };
        if (crudModalVisible === 'create') {
          await onCrudOperation(
            () => createDepartment(convertedToSubmit),
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
            () => updateDepartment(selectedDepartment!.id!, convertedToSubmit),
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
      form={form}
      submitter={{
        render: (props, defaultDoms) => {
          return [
            __DEV__ && (
              <Button
                key="autoFill"
                onClick={() => {
                  form.setFieldsValue({
                    name: faker.commerce.department(),
                    manager: faker.helpers.randomize(managers.data?.map((it) => it.id) || []),
                    description: faker.company.bs(),
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
      <Form.Item
        name="parent"
        label={intl.formatMessage({
          id: 'property.parentDepartment',
          defaultMessage: 'Parent department',
        })}
        rules={[{ required: true }]}
      >
        <TreeSelect
          treeDataSimpleMode
          style={{ width: '100%' }}
          dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
          treeDefaultExpandAll
          loading={departmentsPending}
          treeData={treeData}
        />
      </Form.Item>
      <ProFormText rules={[{ required: true }]} name="name" label={localeFeature} />
      <ProFormSelect
        name="manager"
        label={intl.formatMessage({
          id: 'property.manager',
          defaultMessage: 'Manager',
        })}
        showSearch
        options={managers.data?.map((it) => ({
          value: it.id,
          label: `${it.first_name} ${it.last_name}`,
        }))}
        rules={[{ required: true, message: 'Manager is required' }]}
      />
      <ProFormTextArea
        name="description"
        label={intl.formatMessage({ id: 'property.description' })}
      />
    </ModalForm>
  );
};
