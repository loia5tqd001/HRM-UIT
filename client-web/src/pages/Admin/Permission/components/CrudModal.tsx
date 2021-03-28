import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { useForm } from 'antd/es/form/Form';
import React from 'react';
import { FormattedMessage, useModel } from 'umi';

type Props = {};

export type CrudModalForm = Pick<API.RoleItem, 'roleName' | 'description'>;

const dict = {
  title: {
    create: 'New Role',
    update: 'Edit Role',
  },
};

export const CrudModal: React.FC<Props> = () => {
  const [form] = useForm<CrudModalForm>();
  const {
    onCreateRole,
    onUpdateRole,
    crudModalVisible,
    setCrudModalVisible,
    selectedRole,
  } = useModel('admin.permissions');

  return (
    <ModalForm
      title={dict.title[crudModalVisible]}
      width="400px"
      visible={crudModalVisible !== 'hidden'}
      onVisibleChange={(visible) => {
        if (!visible) setCrudModalVisible('hidden');
        if (visible && crudModalVisible === 'update' && selectedRole) {
          form.setFieldsValue(selectedRole);
        } else {
          form.resetFields();
        }
      }}
      onFinish={async (value) => {
        if (crudModalVisible === 'create') {
          await onCreateRole(value);
        } else if (crudModalVisible === 'update') {
          await onUpdateRole(value);
        }
        setCrudModalVisible('hidden');
      }}
      form={form}
    >
      <ProFormText
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="pages.searchTable.ruleName1"
                defaultMessage="Role name is required"
              />
            ),
          },
        ]}
        name="roleName"
        label="Role name"
      />
      <ProFormTextArea name="description" label="Description" />
    </ModalForm>
  );
};
