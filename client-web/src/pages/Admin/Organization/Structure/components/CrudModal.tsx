import { __DEV__ } from '@/global';
import type { CrudModalForm } from '@/models/admin.organization';
import { ModalForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { Button, Form, message, TreeSelect } from 'antd';
import { useForm } from 'antd/es/form/Form';
import sample from 'lodash/sample';
import React from 'react';
import { FormattedMessage, useModel } from 'umi';

const dict = {
  title: {
    create: 'New Department',
    update: 'Edit Department',
  },
};

export const CrudModal: React.FC = () => {
  const [form] = useForm<CrudModalForm>();
  const {
    onCreateDepartment,
    onUpdateDepartment,
    crudModalVisible,
    setCrudModalVisible,
    selectedDepartment,
    optionManagers,
    managerToOptionValue,
    departments,
    departmentsPending,
  } = useModel('admin.organization');

  const treeData = departments.map((it) => ({
    id: it.id,
    pId: it.parent,
    value: it.id,
    title: it.name,
    isLeaf: !departments.some((x) => x.parent === it.id),
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
            manager: managerToOptionValue(selectedDepartment.manager as API.Manager),
            parent: treeData.find((it) => it.id === selectedDepartment?.parent),
          });
        } else {
          form.setFieldsValue({
            parent: treeData.find((it) => it.id === selectedDepartment?.id),
          });
        }
      }}
      onFinish={async (value) => {
        const convertedToSubmit = {
          ...value,
          manager: (value.manager as string).split(/\s+/g)[0],
          parent: value.parent.id || value.parent,
        };
        if (crudModalVisible === 'create') {
          await onCreateDepartment(convertedToSubmit);
          message.success('Created successfully!');
        } else if (crudModalVisible === 'update') {
          await onUpdateDepartment(convertedToSubmit);
          message.success('Updated successfully!');
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
                    name: `Department${Math.random()}`,
                    manager: String(sample(optionManagers)?.value),
                    description: `${Math.random()}`,
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
        options={optionManagers}
        rules={[{ required: true, message: 'Manager is required' }]}
      />
      <ProFormTextArea name="description" label="Description" />
    </ModalForm>
  );
};
