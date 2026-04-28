import { useState } from 'react';
import { Button, Dropdown, Menu, message } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { delSkill, putSkillStatus } from '@/apis/agent-operator-integration';
import { postResourceOperation } from '@/apis/authorization';
import { useMicroWidgetProps } from '@/hooks';
import { confirmModal } from '@/utils/modal';
import PermConfigMenu from '@/components/OperatorList/PermConfigMenu';
import { PublishedPermModal } from '@/components/OperatorList/PublishedPermModal';
import {
  OperateTypeEnum,
  OperatorStatusType,
  OperatorTypeEnum,
  PermConfigTypeEnum,
} from '@/components/OperatorList/types';
import SkillDownloadButton from './SkillDownloadButton';

const SkillDropdown: React.FC<{ params: any; fetchInfo: () => void }> = ({ params, fetchInfo }) => {
  const { activeTab, record, enableSkillDetail = false } = params;
  const navigate = useNavigate();
  const microWidgetProps = useMicroWidgetProps();
  const [permissionCheckInfo, setPermissionCheckInfo] = useState<Array<PermConfigTypeEnum>>();

  const handlePreview = (type: string) => {
    navigate(`/skill-detail?skill_id=${record?.skill_id}&action=${type}`);
  };

  const handleStatus = async (status: string, successText: string) => {
    try {
      await putSkillStatus(record?.skill_id, { status });
      message.success(successText);
      fetchInfo?.();
      if (status === OperatorStatusType.Published && permissionCheckInfo?.includes(PermConfigTypeEnum.Authorize)) {
        PublishedPermModal({ record, activeTab: OperatorTypeEnum.Skill }, microWidgetProps);
      }
    } catch (error: any) {
      if (error?.description) {
        message.error(error.description);
      }
    }
  };

  const handleDelete = async () => {
    try {
      await delSkill(record?.skill_id);
      message.success('删除成功');
      fetchInfo?.();
    } catch (error: any) {
      if (error?.description) {
        message.error(error.description);
      }
    }
  };

  const showDeleteConfirm = () => {
    confirmModal({
      title: '删除Skill',
      content: '请确认是否删除此Skill？',
      onOk() {
        handleDelete();
      },
      onCancel() {},
    });
  };

  const showOfflineConfirm = () => {
    confirmModal({
      title: '下架Skill',
      content: '下架后，引用了该Skill的智能体或工作流会失效，此操作不可撤回。',
      onOk() {
        handleStatus(OperatorStatusType.Offline, '下架成功');
      },
      onCancel() {},
    });
  };

  const resourceOperation = async () => {
    try {
      const data = await postResourceOperation({
        method: 'GET',
        resources: [
          {
            id: record?.skill_id,
            type: activeTab,
          },
        ],
      });
      setPermissionCheckInfo(data?.[0]?.operation);
    } catch (error: any) {
      console.error(error);
    }
  };

  return (
    <Dropdown
      trigger={['click']}
      overlay={
        <Menu>
          {enableSkillDetail && permissionCheckInfo?.includes(PermConfigTypeEnum.View) && (
            <Menu.Item onClick={() => handlePreview(OperateTypeEnum.Edit)}>查看</Menu.Item>
          )}

          {permissionCheckInfo?.includes(PermConfigTypeEnum.View) && (
            <Menu.Item>
              <SkillDownloadButton skillId={record?.skill_id} name={record?.name} />
            </Menu.Item>
          )}

          {record?.status !== OperatorStatusType.Published &&
            permissionCheckInfo?.includes(PermConfigTypeEnum.Publish) && (
              <Menu.Item onClick={() => handleStatus(OperatorStatusType.Published, '发布成功')}>发布</Menu.Item>
            )}

          {record?.status === OperatorStatusType.Published &&
            permissionCheckInfo?.includes(PermConfigTypeEnum.Unpublish) && (
              <Menu.Item onClick={showOfflineConfirm}>下架</Menu.Item>
            )}

          {permissionCheckInfo?.includes(PermConfigTypeEnum.Authorize) && (
            <Menu.Item>
              <PermConfigMenu params={{ record, activeTab: OperatorTypeEnum.Skill }} />
            </Menu.Item>
          )}

          {record?.status !== OperatorStatusType.Published &&
            permissionCheckInfo?.includes(PermConfigTypeEnum.Delete) && (
              <Menu.Item className="operator-menu-delete" onClick={showDeleteConfirm}>
                删除
              </Menu.Item>
            )}
        </Menu>
      }
    >
      <Button type="text" icon={<EllipsisOutlined />} onClick={resourceOperation} />
    </Dropdown>
  );
};

export default SkillDropdown;
