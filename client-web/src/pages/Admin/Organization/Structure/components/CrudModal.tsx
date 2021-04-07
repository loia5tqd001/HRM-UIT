import { __DEV__ } from '@/global';
import {
  allManagers,
  createDepartment,
  updateDepartment,
} from '@/services/admin.organization.structure';
import { ModalForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { Button, Form, TreeSelect } from 'antd';
import { useForm } from 'antd/es/form/Form';
import faker from 'faker';
import React, { useEffect, useState } from 'react';
import { FormattedMessage, useModel } from 'umi';

const dict = {
  title: {
    create: 'New Department',
    update: 'Edit Department',
  },
};

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
  const [managers, setManagers] = useState<API.Manager[]>([]);

  useEffect(() => {
    allManagers().then((data) => setManagers(data));
  }, []);

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
            'Created successfully!',
            'Created failed!',
          );
        } else if (crudModalVisible === 'update') {
          await onCrudOperation(
            () => updateDepartment(selectedDepartment!.id!, convertedToSubmit),
            'Updated successfully!',
            'Updated failed!',
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
                    manager: faker.helpers.randomize(managers.map((it) => it.id)),
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
      <Form.Item name="parent" label="Parent department" rules={[{ required: true }]}>
        <TreeSelect
          treeDataSimpleMode
          style={{ width: '100%' }}
          dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
          treeDefaultExpandAll
          loading={departmentsPending}
          treeData={treeData}
        />
      </Form.Item>
      <ProFormText
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="pages.searchTable.ruleName1"
                defaultMessage="Department name is required"
              />
            ),
          },
        ]}
        name="name"
        label="Department name"
      />
      <ProFormSelect
        name="manager"
        label="Manager"
        showSearch
        options={managers.map((it) => ({
          value: it.id,
          label: `${it.first_name} ${it.last_name}`,
        }))}
        rules={[{ required: true, message: 'Manager is required' }]}
      />
      <ProFormTextArea name="description" label="Description" />
    </ModalForm>
  );
};
