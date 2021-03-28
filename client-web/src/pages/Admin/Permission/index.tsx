import ProCard from '@ant-design/pro-card';
import React from 'react';
import LeftPanel from './LeftPanel';
import { RightPanel } from './RightPanel';
import { CrudModal } from './components/CrudModal';

const Permission: React.FC = () => {
  return (
    <ProCard split="vertical" style={{ height: '100%' }}>
      <ProCard colSpan="380px" ghost>
        <LeftPanel />
      </ProCard>
      <RightPanel />
      <CrudModal />
    </ProCard>
  );
};

export default Permission;
