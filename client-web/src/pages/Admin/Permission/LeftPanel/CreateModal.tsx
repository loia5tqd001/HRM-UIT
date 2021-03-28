import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import type { ActionType } from '@ant-design/pro-table';
import { useForm } from 'antd/es/form/Form';
import React from 'react';
import { FormattedMessage, useModel } from 'umi';

type Props = {
  actionRef: React.MutableRefObject<ActionType | undefined>;
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export type CreateRoleModal = Pick<API.RoleItem, 'roleName' | 'description'>;

export const CreateModal: React.FC<Props> = (props) => {
  const { actionRef, visible, setVisible } = props;
  const [form] = useForm<CreateRoleModal>();
  const { onAddRole } = useModel('admin.permissions');

  return (
    <ModalForm
      title={'New Role'}
      width="400px"
      visible={visible}
      onVisibleChange={(newVisible) => {
        setVisible(newVisible);
        form.resetFields();
      }}
      onFinish={async (value) => {
        await onAddRole(value);
        setVisible(false);
        actionRef.current?.reload();
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
